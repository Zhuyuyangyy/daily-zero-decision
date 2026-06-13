#!/usr/bin/env python3
"""Preflight checks for the official-document-assistant contest package."""

from __future__ import annotations

import argparse
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import zipfile
from dataclasses import dataclass
from pathlib import Path


TEXT_SUFFIXES = {
    ".md",
    ".txt",
    ".json",
    ".yaml",
    ".yml",
    ".py",
    ".js",
    ".ts",
    ".css",
    ".html",
}


@dataclass
class Check:
    name: str
    ok: bool
    detail: str


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as handle:
        for chunk in iter(lambda: handle.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest().upper()


def add(checks: list[Check], name: str, ok: bool, detail: str = "") -> None:
    checks.append(Check(name=name, ok=ok, detail=detail))


def check_zip_structure(skill_zip: Path, checks: list[Check]) -> list[str]:
    names: list[str] = []
    with zipfile.ZipFile(skill_zip) as zf:
        names = zf.namelist()
        add(checks, "skill_zip_has_root_skill_md", "SKILL.md" in names)
        add(checks, "skill_zip_file_count", len(names) <= 500, str(len(names)))
        add(checks, "skill_zip_size", skill_zip.stat().st_size <= 100 * 1024 * 1024, str(skill_zip.stat().st_size))

        large_files: list[str] = []
        nul_files: list[str] = []
        not_utf8: list[str] = []
        for name in names:
            data = zf.read(name)
            if len(data) > 10 * 1024 * 1024:
                large_files.append(name)
            suffix = Path(name).suffix.lower()
            if suffix in TEXT_SUFFIXES:
                if b"\x00" in data:
                    nul_files.append(name)
                try:
                    data.decode("utf-8")
                except UnicodeDecodeError as exc:
                    not_utf8.append(f"{name}: {exc}")

        add(checks, "skill_zip_single_file_size", not large_files, ", ".join(large_files))
        add(checks, "skill_zip_text_no_nul", not nul_files, ", ".join(nul_files))
        add(checks, "skill_zip_text_utf8", not not_utf8, "; ".join(not_utf8))
    return names


def run_script(root: Path, *args: str, input_text: str | None = None) -> subprocess.CompletedProcess[str]:
    return subprocess.run(
        [sys.executable, str(root / "scripts" / "gov_doc_review.py"), *args],
        input=input_text,
        text=True,
        encoding="utf-8",
        capture_output=True,
        check=True,
    )


def smoke_test_skill_zip(skill_zip: Path, checks: list[Check]) -> None:
    with tempfile.TemporaryDirectory(prefix="gov-doc-skill-") as tmp:
        root = Path(tmp)
        with zipfile.ZipFile(skill_zip) as zf:
            zf.extractall(root)

        add(checks, "smoke_root_skill_md", (root / "SKILL.md").exists())
        add(checks, "smoke_root_readme", (root / "README.md").exists())
        add(checks, "smoke_script_exists", (root / "scripts" / "gov_doc_review.py").exists())

        review = run_script(root, "--mode", "review", "--format", "json", "--input", str(root / "examples" / "input-notice.md"))
        review_json = json.loads(review.stdout)
        review_ok = review_json.get("doc_type") == "通知"
        add(checks, "smoke_review_notice", review_ok, "" if review_ok else json.dumps(review_json.get("doc_type"), ensure_ascii=True))

        draft = run_script(root, "--mode", "draft", "--format", "markdown", "--input", str(root / "examples" / "input-draft-letter.txt"))
        expected = (root / "examples" / "output-draft-letter.md").read_text(encoding="utf-8")
        add(checks, "smoke_draft_letter_matches_example", draft.stdout == expected)

        brief = run_script(root, "--mode", "brief", "--format", "json", "--input", str(root / "examples" / "input-meeting.md"))
        brief_json = json.loads(brief.stdout)
        add(checks, "smoke_brief_items", len(brief_json.get("supervision_items", [])) >= 2)

        empty = run_script(root, "--mode", "review", "--format", "json", input_text="\x00\x01")
        empty_json = json.loads(empty.stdout)
        add(checks, "smoke_control_chars_high_risk", empty_json.get("risk_level") == "高" and bool(empty_json.get("issues")))

        personal = run_script(
            root,
            "--mode",
            "review",
            "--format",
            "json",
            input_text="关于报送人员信息的通知\n\n各部门：\n\n请报送身份证号110105199001011234，联系电话13812345678。\n\n办公室\n2026年6月10日",
        )
        personal_json = json.loads(personal.stdout)
        personal_names = {issue.get("name") for issue in personal_json.get("issues", [])}
        add(checks, "smoke_personal_sensitive_warning", "疑似个人敏感信息" in personal_names)
        redacted_preview = personal_json.get("redacted_preview", "")
        add(
            checks,
            "smoke_redacted_preview",
            "138****5678" in redacted_preview
            and "110105********1234" in redacted_preview
            and "13812345678" not in redacted_preview
            and "110105199001011234" not in redacted_preview,
        )

        confidential = run_script(
            root,
            "--mode",
            "review",
            "--format",
            "json",
            input_text="关于材料流转的通知\n\n各部门：\n\n本材料含内部资料和涉密附件，不得外传。\n\n办公室\n2026年6月10日",
        )
        confidential_names = {issue.get("name") for issue in json.loads(confidential.stdout).get("issues", [])}
        add(checks, "smoke_confidential_warning", "疑似涉密或内部资料" in confidential_names)


def check_materials_zip(materials_zip: Path, checks: list[Check]) -> None:
    with zipfile.ZipFile(materials_zip) as zf:
        names = zf.namelist()
        required = {
            "official-document-assistant-v0.2-review-material.docx",
            "skillhub-submission-copy.md",
            "heat-list-launch-playbook.md",
            "social-posters/poster-01-launch-cover.png",
            "social-posters/poster-02-feature-cards.png",
            "social-posters/poster-03-download-guide.png",
        }
        missing = sorted(required.difference(names))
        add(checks, "materials_required_files", not missing, ", ".join(missing))

        not_utf8: list[str] = []
        nul_files: list[str] = []
        for name in names:
            suffix = Path(name).suffix.lower()
            if suffix not in TEXT_SUFFIXES:
                continue
            data = zf.read(name)
            if b"\x00" in data:
                nul_files.append(name)
            try:
                data.decode("utf-8")
            except UnicodeDecodeError as exc:
                not_utf8.append(f"{name}: {exc}")
        add(checks, "materials_text_utf8", not not_utf8, "; ".join(not_utf8))
        add(checks, "materials_text_no_nul", not nul_files, ", ".join(nul_files))


def main() -> int:
    parser = argparse.ArgumentParser(description="Run preflight checks for contest submission artifacts.")
    parser.add_argument("--skill-zip", default="_contest/official-document-assistant-v0.2.zip")
    parser.add_argument("--materials-zip", default="_contest/official-document-assistant-v0.2-review-materials.zip")
    args = parser.parse_args()

    skill_zip = Path(args.skill_zip)
    materials_zip = Path(args.materials_zip)
    checks: list[Check] = []

    add(checks, "skill_zip_exists", skill_zip.exists(), str(skill_zip))
    add(checks, "materials_zip_exists", materials_zip.exists(), str(materials_zip))
    if skill_zip.exists():
        check_zip_structure(skill_zip, checks)
        smoke_test_skill_zip(skill_zip, checks)
    if materials_zip.exists():
        check_materials_zip(materials_zip, checks)

    print("# Preflight Report")
    if skill_zip.exists():
        print(f"skill_zip_sha256={sha256(skill_zip)}")
    if materials_zip.exists():
        print(f"materials_zip_sha256={sha256(materials_zip)}")
    print()
    for check in checks:
        status = "PASS" if check.ok else "FAIL"
        detail = f" - {check.detail}" if check.detail else ""
        print(f"[{status}] {check.name}{detail}")

    failed = [check for check in checks if not check.ok]
    print()
    print(f"summary: {len(checks) - len(failed)}/{len(checks)} passed")
    return 1 if failed else 0


if __name__ == "__main__":
    raise SystemExit(main())
