"""Shared fixtures for llm-autoresearch-pipeline tests."""
import json
from pathlib import Path

import pytest

# 项目根目录
PROJECT_ROOT = Path(__file__).resolve().parent.parent
AUDIT_V3_DIR = PROJECT_ROOT / "audit_v3"
EXAMPLES_DIR = PROJECT_ROOT / "examples"


def _load_jsonl(path: Path) -> list[dict]:
    """Load a JSONL file and return a list of dicts."""
    records = []
    with open(path, encoding="utf-8") as f:
        for line_no, line in enumerate(f, 1):
            line = line.strip()
            if not line:
                continue
            try:
                records.append(json.loads(line))
            except json.JSONDecodeError as e:
                raise ValueError(f"Invalid JSON at {path}:{line_no}: {e}") from e
    return records


@pytest.fixture
def project_root() -> Path:
    return PROJECT_ROOT


@pytest.fixture
def audit_v3_dir() -> Path:
    return AUDIT_V3_DIR


@pytest.fixture
def examples_dir() -> Path:
    return EXAMPLES_DIR


@pytest.fixture
def calibration_dataset(audit_v3_dir) -> list[dict]:
    """Load calibration_dataset_v3.jsonl."""
    return _load_jsonl(audit_v3_dir / "calibration_dataset_v3.jsonl")


@pytest.fixture
def clean_records(audit_v3_dir) -> list[dict]:
    """Load clean_records_v3.jsonl."""
    return _load_jsonl(audit_v3_dir / "clean_records_v3.jsonl")


@pytest.fixture
def validated_clean_records(audit_v3_dir) -> list[dict]:
    """Load validated_clean_records_v3.jsonl."""
    return _load_jsonl(
        audit_v3_dir / "manual_validation" / "validated_clean_records_v3.jsonl"
    )


@pytest.fixture
def validated_excluded_records(audit_v3_dir) -> list[dict]:
    """Load validated_excluded_records_v3.jsonl."""
    return _load_jsonl(
        audit_v3_dir / "manual_validation" / "validated_excluded_records_v3.jsonl"
    )


@pytest.fixture
def clean_gaps(clean_records) -> list[float]:
    """Gap values from clean records."""
    return [r["gap"] for r in clean_records]


@pytest.fixture
def contaminated_gaps(calibration_dataset) -> list[float]:
    """Gap values from contaminated-but-byte-traceable records (paper's n=7 contaminated subset)."""
    # The 7 contaminated projects are SELF_ONLY_TRACEABLE with contamination_risk=POSSIBLE
    contaminated_projects = {
        "TCM-HerbDrug-FAERS", "LifeCycleAI", "UniCompress",
        "HWM-AP", "SafeEmbodiedFM-V2", "embodied-robot-brain", "TCM-PMS-Signal",
    }
    return [
        r["gap"]
        for r in calibration_dataset
        if r.get("project") in contaminated_projects and r.get("gap") is not None
    ]
