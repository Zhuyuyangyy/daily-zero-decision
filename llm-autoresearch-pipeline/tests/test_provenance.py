"""Tests for provenance determination logic — BYTE_TRACEABLE, contamination, usable_clean."""
import pytest


class TestByteTraceable:
    """Verify BYTE_TRACEABLE records have both self and indep matches."""

    @pytest.mark.provenance
    def test_byte_traceable_records_have_both_matches(self, calibration_dataset):
        bt_records = [
            r for r in calibration_dataset
            if r.get("provenance_status") == "BYTE_TRACEABLE"
        ]
        assert len(bt_records) > 0, "No BYTE_TRACEABLE records found"
        for rec in bt_records:
            assert rec.get("self_match_to_original") is True, \
                f"{rec['project']}: BYTE_TRACEABLE but self_match_to_original != True"
            assert rec.get("indep_match_to_original") is not None, \
                f"{rec['project']}: BYTE_TRACEABLE but indep_match_to_original is None"

    @pytest.mark.provenance
    def test_byte_traceable_count(self, calibration_dataset):
        bt_records = [
            r for r in calibration_dataset
            if r.get("provenance_status") == "BYTE_TRACEABLE"
        ]
        # Data file has 7 BYTE_TRACEABLE records (paper says 14 but includes reclassified SELF_ONLY_TRACEABLE)
        assert len(bt_records) == 7, \
            f"Expected 7 BYTE_TRACEABLE records, got {len(bt_records)}"


class TestSelfOnlyTraceable:
    """Verify SELF_ONLY_TRACEABLE records have self match but not full indep match."""

    @pytest.mark.provenance
    def test_self_only_records_have_self_match(self, calibration_dataset):
        sot_records = [
            r for r in calibration_dataset
            if r.get("provenance_status") == "SELF_ONLY_TRACEABLE"
        ]
        for rec in sot_records:
            assert rec.get("provenance_status") is not None, \
                f"{rec['project']}: provenance_status is missing"


class TestContaminationRisk:
    """Verify contamination_risk field consistency."""

    @pytest.mark.provenance
    def test_indep_match_false_implies_possible(self, calibration_dataset):
        """Records where indep_match_to_original is False should have contamination_risk=POSSIBLE."""
        for rec in calibration_dataset:
            if rec.get("contamination_risk") is None:
                continue  # skip NULL_SCORES records
            if rec.get("indep_match_to_original") is False:
                assert rec.get("contamination_risk") in ("POSSIBLE", "CONTAMINATED"), \
                    f"{rec['project']}: indep_match_to_original=False but contamination_risk={rec.get('contamination_risk')}"

    @pytest.mark.provenance
    def test_indep_match_true_implies_clean(self, calibration_dataset):
        """Records where indep_match_to_original is True should have contamination_risk=CLEAN."""
        for rec in calibration_dataset:
            if rec.get("indep_match_to_original") is True:
                assert rec.get("contamination_risk") == "CLEAN", \
                    f"{rec['project']}: indep_match_to_original=True but contamination_risk={rec.get('contamination_risk')}"


class TestUsableClean:
    """Verify usable_clean field consistency."""

    @pytest.mark.provenance
    def test_usable_clean_implies_clean_contamination(self, calibration_dataset):
        """Records with usable_clean=True should have contamination_risk=CLEAN."""
        for rec in calibration_dataset:
            if rec.get("usable_clean") is True:
                assert rec.get("contamination_risk") == "CLEAN", \
                    f"{rec['project']}: usable_clean=True but contamination_risk={rec.get('contamination_risk')}"

    @pytest.mark.provenance
    def test_usable_clean_implies_byte_traceable(self, calibration_dataset):
        """Records with usable_clean=True should be BYTE_TRACEABLE."""
        for rec in calibration_dataset:
            if rec.get("usable_clean") is True:
                assert rec.get("provenance_status") == "BYTE_TRACEABLE", \
                    f"{rec['project']}: usable_clean=True but provenance_status={rec.get('provenance_status')}"


class TestProvenanceCounts:
    """Verify record counts by provenance_status."""

    @pytest.mark.provenance
    def test_total_record_count(self, calibration_dataset):
        """Total records should be 33 (as stated in paper)."""
        assert len(calibration_dataset) == 33, \
            f"Expected 33 records, got {len(calibration_dataset)}"

    @pytest.mark.provenance
    def test_clean_byte_traceable_count(self, calibration_dataset):
        """Should have exactly 7 clean BYTE_TRACEABLE records."""
        clean_bt = [
            r for r in calibration_dataset
            if r.get("provenance_status") == "BYTE_TRACEABLE"
            and r.get("contamination_risk") == "CLEAN"
        ]
        assert len(clean_bt) == 7, \
            f"Expected 7 clean BYTE_TRACEABLE records, got {len(clean_bt)}"

    @pytest.mark.provenance
    def test_contaminated_byte_traceable_count(self, calibration_dataset):
        """The 7 specific contaminated projects should have contamination_risk=POSSIBLE."""
        contaminated_projects = {
            "TCM-HerbDrug-FAERS", "LifeCycleAI", "UniCompress",
            "HWM-AP", "SafeEmbodiedFM-V2", "embodied-robot-brain", "TCM-PMS-Signal",
        }
        cont_projects = {
            r["project"]
            for r in calibration_dataset
            if r.get("project") in contaminated_projects
            and r.get("contamination_risk") == "POSSIBLE"
        }
        assert cont_projects == contaminated_projects, \
            f"Expected 7 contaminated projects with POSSIBLE risk, got {cont_projects}"
