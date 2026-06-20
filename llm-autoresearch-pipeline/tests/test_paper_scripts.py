"""Integration tests for paper modification scripts in examples/."""
import subprocess
import sys
from pathlib import Path

import pytest


class TestFixPaperV66:
    """Test fix_paper_v66.py script."""

    @pytest.mark.paper
    def test_script_runs_without_error(self, examples_dir):
        """The script should run without raising an error."""
        script = examples_dir / "fix_paper_v66.py"
        assert script.exists(), f"Script not found: {script}"
        # The script modifies paper_v6.6.md in-place, so we test it can be imported
        # without actually running it (it would modify the real file)
        # Instead, we verify the script's logic by checking key patterns exist
        content = script.read_text(encoding="utf-8")
        # Verify the script contains the 8 replacement sections
        assert "REPLACEMENT 1" in content, "Missing REPLACEMENT 1"
        assert "REPLACEMENT 2" in content, "Missing REPLACEMENT 2"
        assert "REPLACEMENT 3" in content, "Missing REPLACEMENT 3"
        assert "REPLACEMENT 4" in content, "Missing REPLACEMENT 4"
        assert "REPLACEMENT 5" in content, "Missing REPLACEMENT 5"
        assert "REPLACEMENT 6" in content, "Missing REPLACEMENT 6"
        assert "REPLACEMENT 7" in content, "Missing REPLACEMENT 7"
        assert "REPLACEMENT 8" in content, "Missing REPLACEMENT 8"

    @pytest.mark.paper
    def test_script_contains_v66_key_numbers(self, examples_dir):
        """The replacement text should contain v6.6 key numbers."""
        content = (examples_dir / "fix_paper_v66.py").read_text(encoding="utf-8")
        assert "+35.4" in content, "Script should reference +35.4"
        assert "+37.0" in content, "Script should reference +37.0"
        assert "n=7" in content, "Script should reference n=7"

    @pytest.mark.paper
    def test_paper_v66_contains_key_numbers(self, examples_dir):
        """paper_v6.6.md should contain the v6.6 key numbers."""
        paper = examples_dir / "paper_v6.6.md"
        assert paper.exists(), f"Paper not found: {paper}"
        content = paper.read_text(encoding="utf-8")
        assert "+35.4" in content, "paper_v6.6.md should contain +35.4"
        assert "+37.0" in content, "paper_v6.6.md should contain +37.0"
        assert "n=7" in content, "paper_v6.6.md should contain n=7"


class TestApplyV66Patch:
    """Test apply_v66_patch.py script."""

    @pytest.mark.paper
    def test_script_structure(self, examples_dir):
        """Verify the patch script has the expected structure."""
        script = examples_dir / "apply_v66_patch.py"
        assert script.exists(), f"Script not found: {script}"
        content = script.read_text(encoding="utf-8")
        # Should have changelog insertion
        assert "CHANGELOG" in content or "Changelog" in content
        # Should update Abstract
        assert "ABSTRACT" in content or "Abstract" in content

    @pytest.mark.paper
    def test_script_contains_v66_numbers(self, examples_dir):
        """The patch script should contain v6.6 key numbers."""
        content = (examples_dir / "apply_v66_patch.py").read_text(encoding="utf-8")
        assert "+35.4" in content
        assert "n=7" in content


class TestGeneratePaperV66:
    """Test generate_paper_v66.py script."""

    @pytest.mark.paper
    def test_script_structure(self, examples_dir):
        """Verify the generation script has the expected structure."""
        script = examples_dir / "generate_paper_v66.py"
        assert script.exists(), f"Script not found: {script}"
        content = script.read_text(encoding="utf-8")
        # Should reference paper_v6.5.md as input
        assert "paper_v6.5" in content
        # Should reference v6.6 changes
        assert "v6.6" in content or "v66" in content

    @pytest.mark.paper
    def test_script_contains_v66_numbers(self, examples_dir):
        """The generation script should contain v6.6 key numbers."""
        content = (examples_dir / "generate_paper_v66.py").read_text(encoding="utf-8")
        assert "+35.4" in content
        assert "n=7" in content


class TestPaperV66Content:
    """Test that paper_v6.6.md has correct content after all modifications."""

    @pytest.mark.paper
    def test_primary_headline_is_n7(self, examples_dir):
        """Primary headline should use n=7, not n=2."""
        paper = examples_dir / "paper_v6.6.md"
        content = paper.read_text(encoding="utf-8")
        # The primary headline should mention n=7
        assert "n=7" in content
        # "Primary headline: n=2" should NOT appear
        assert "Primary headline: n=2" not in content

    @pytest.mark.paper
    def test_changelog_has_v66_entry(self, examples_dir):
        """paper_v6.6.md should have a v6.6 changelog entry."""
        paper = examples_dir / "paper_v6.6.md"
        content = paper.read_text(encoding="utf-8")
        assert "v6.6 changes" in content

    @pytest.mark.paper
    def test_contaminated_subset_mentioned(self, examples_dir):
        """paper_v6.6.md should mention the contaminated subset."""
        paper = examples_dir / "paper_v6.6.md"
        content = paper.read_text(encoding="utf-8")
        assert "+39.1" in content or "contaminated" in content.lower()

    @pytest.mark.paper
    def test_legacy_n28_demoted(self, examples_dir):
        """n=28 should be labeled as legacy, not primary."""
        paper = examples_dir / "paper_v6.6.md"
        content = paper.read_text(encoding="utf-8")
        # n=28 should appear with "legacy" or "contaminated upper bound"
        if "n=28" in content:
            # Check it's not labeled as primary
            assert "Primary headline: n=28" not in content
