import unittest
from pathlib import Path

import yaml


ROOT = Path(__file__).resolve().parents[1]
SKILLS = ROOT / "skills"


def frontmatter(path):
    text = path.read_text(encoding="utf-8")
    _, raw, _ = text.split("---", 2)
    return yaml.safe_load(raw), text


class SkillContractTest(unittest.TestCase):
    def test_skill_frontmatter_matches_directory(self):
        for skill_dir in sorted(path for path in SKILLS.iterdir() if path.is_dir()):
            metadata, _ = frontmatter(skill_dir / "SKILL.md")
            self.assertEqual(metadata["name"], skill_dir.name)
            self.assertIsInstance(metadata["description"], str)
            self.assertTrue(metadata["description"].strip())

    def test_build_production_ui_references_exist(self):
        skill_dir = SKILLS / "build-production-ui"
        _, skill = frontmatter(skill_dir / "SKILL.md")
        expected = [
            "references/modes-and-gates.md",
            "references/evidence-and-acceptance.md",
            "references/test-cases.md",
            "assets/decision-packet.md",
        ]
        for relative in expected:
            self.assertIn(relative, skill)
            self.assertTrue((skill_dir / relative).is_file(), relative)

    def test_build_production_ui_packet_is_v2(self):
        packet = SKILLS / "build-production-ui" / "assets" / "decision-packet.md"
        metadata, body = frontmatter(packet)
        self.assertEqual(metadata["workflow_version"], 2)
        self.assertEqual(metadata["status"], "draft")
        for key in [
            "target",
            "mode",
            "anchor",
            "baseline",
            "acceptance_source",
            "candidate_ids",
            "implemented_candidate_ids",
            "final_decision_mode",
            "approved_direction",
            "capture_manifest",
        ]:
            self.assertIn(key, metadata)
        for section in [
            "Acceptance와 Evidence Trace",
            "Capture Manifest",
            "Terminal State와 Recovery",
            "Production Integration과 Cleanup",
        ]:
            self.assertIn(section, body)

    def test_build_production_ui_smoke_matrix_covers_terminal_states(self):
        matrix = (
            SKILLS / "build-production-ui" / "references" / "test-cases.md"
        ).read_text(encoding="utf-8")
        for phrase in [
            "Four-to-two contract",
            "Approval cannot be bypassed",
            "Rejection and cancellation cleanup",
            "Integration failure recovery",
            "Capture manifest and sensitive data",
            "Verification gap",
        ]:
            self.assertIn(phrase, matrix)

    def test_research_query_covers_canonical_drift(self):
        skill_dir = SKILLS / "research-query"
        _, skill = frontmatter(skill_dir / "SKILL.md")
        matrix = (skill_dir / "references" / "test-cases.md").read_text(encoding="utf-8")
        for phrase in [
            "query source set",
            "pre-existing-dirty-preserved",
            "drift-blocked",
        ]:
            self.assertIn(phrase, skill)
            self.assertIn(phrase, matrix)

    def test_research_workflow_covers_new_ufffd(self):
        skill_dir = SKILLS / "research-workflow"
        _, skill = frontmatter(skill_dir / "SKILL.md")
        matrix = (skill_dir / "references" / "test-cases.md").read_text(encoding="utf-8")
        self.assertIn("scripts/verify-no-new-ufffd.py", skill)
        self.assertIn("Tracked 파일", skill)
        for phrase in ["historical U+FFFD baseline", "new tracked U+FFFD", "new untracked U+FFFD"]:
            self.assertIn(phrase, matrix)


if __name__ == "__main__":
    unittest.main()
