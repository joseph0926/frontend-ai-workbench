import subprocess
import sys
import tempfile
import textwrap
import unittest
import importlib.util
from copy import deepcopy
from datetime import date
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LINTER = ROOT / "scripts" / "wiki-lint.py"
SPEC = importlib.util.spec_from_file_location("wiki_lint", LINTER)
WIKI_LINT = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(WIKI_LINT)


def page(title, links):
    relation_links = ", ".join(f'"[[uiux/{link}]]"' for link in links)
    body_links = ", ".join(f"[[uiux/{link}]]" for link in links)
    return textwrap.dedent(
        f"""\
        ---
        schema_version: 1
        type: concept
        tags: [uiux]
        sources:
          - "https://example.com/{title} — accessed 2026-07-15"
        relations:
          depends_on: [{relation_links}]
          contrasts_with: []
          expands_on: []
          applies_to: []
          contradicts: []
          supersedes: []
        confidence: 0.8
        status: current
        updated: 2026-07-15
        ---

        # {title}

        {body_links}와 연결되는 판단입니다.

        ## Sources

        - https://example.com/{title} — accessed 2026-07-15
        """
    )


def write_valid_graph(knowledge):
    topic = knowledge / "uiux" / "concepts"
    topic.mkdir(parents=True)
    (knowledge / "index.md").write_text(
        "# Topics\n\n- [[uiux/one]]\n", encoding="utf-8"
    )
    (knowledge / "uiux" / "index.md").write_text(
        "# UIUX\n\n- [[uiux/one]]\n- [[uiux/two]]\n- [[uiux/three]]\n",
        encoding="utf-8",
    )
    (topic / "one.md").write_text(page("one", ["two", "three"]), encoding="utf-8")
    (topic / "two.md").write_text(page("two", ["three", "one"]), encoding="utf-8")
    (topic / "three.md").write_text(page("three", ["one", "two"]), encoding="utf-8")
    return topic


class WikiLintTest(unittest.TestCase):
    def run_lint(self, knowledge, *args):
        return subprocess.run(
            [sys.executable, str(LINTER), str(knowledge), *args],
            capture_output=True,
            text=True,
            check=False,
        )

    def test_valid_graph_passes_all_modes(self):
        with tempfile.TemporaryDirectory() as temp:
            knowledge = Path(temp) / "knowledge"
            write_valid_graph(knowledge)

            structure = self.run_lint(knowledge)
            manifest = self.run_lint(knowledge, "--audit-manifest", "--seed", "2026-07-15")
            routing = self.run_lint(knowledge, "--routing-audit")

            self.assertEqual(structure.returncode, 0, structure.stdout + structure.stderr)
            self.assertEqual(manifest.returncode, 0, manifest.stdout + manifest.stderr)
            self.assertEqual(routing.returncode, 0, routing.stdout + routing.stderr)
            self.assertIn("검증 페이지: 3개", structure.stderr)

    def test_invalid_page_fails(self):
        with tempfile.TemporaryDirectory() as temp:
            knowledge = Path(temp) / "knowledge"
            topic = knowledge / "uiux" / "concepts"
            topic.mkdir(parents=True)
            (knowledge / "index.md").write_text("# Topics\n\n- `uiux`\n", encoding="utf-8")
            (knowledge / "uiux" / "index.md").write_text(
                "# UIUX\n\n- [[uiux/broken]]\n", encoding="utf-8"
            )
            (topic / "broken.md").write_text("# Broken\n", encoding="utf-8")

            result = self.run_lint(knowledge)

            self.assertEqual(result.returncode, 1)
            self.assertIn("frontmatter 없음", result.stdout)

    def test_url_without_accessed_date_warns(self):
        with tempfile.TemporaryDirectory() as temp:
            knowledge = Path(temp) / "knowledge"
            topic = write_valid_graph(knowledge)
            target = topic / "one.md"
            target.write_text(
                target.read_text(encoding="utf-8").replace(" — accessed 2026-07-15", ""),
                encoding="utf-8",
            )

            result = self.run_lint(knowledge)

            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("URL 출처에 접근일", result.stdout)


class WikiLintFrontmatterTypeTest(unittest.TestCase):
    def setUp(self):
        self.frontmatter = {
            "schema_version": 1,
            "type": "concept",
            "tags": ["uiux"],
            "sources": ["https://example.com — accessed 2026-07-19"],
            "relations": {key: [] for key in WIKI_LINT.VALID_RELATIONS},
            "confidence": 0.8,
            "status": "current",
            "updated": date(2026, 7, 19),
        }
        self.body = "[[uiux/one]] [[uiux/two]]\n\n## Sources\n- https://example.com — accessed 2026-07-19\n"

    def validate(self, frontmatter):
        target = WIKI_LINT.WikiPage(
            Path("knowledge/uiux/concepts/probe.md"),
            "",
            frontmatter,
            self.body,
        )
        return WIKI_LINT.validate_page(target, {"uiux/one", "uiux/two"}, {"uiux"})

    def assert_error(self, field, value, message):
        frontmatter = deepcopy(self.frontmatter)
        frontmatter[field] = value
        issues = self.validate(frontmatter)
        self.assertTrue(
            any(issue.severity == "error" and message in issue.message for issue in issues),
            [issue.message for issue in issues],
        )

    def test_valid_frontmatter_passes(self):
        self.assertEqual(self.validate(self.frontmatter), [])

    def test_frontmatter_must_be_mapping(self):
        issues = self.validate([])
        self.assertTrue(any("frontmatter는 mapping" in issue.message for issue in issues))

    def test_type_and_status_must_be_strings(self):
        self.assert_error("type", [], "type은 문자열")
        self.assert_error("status", [], "status는 문자열")

    def test_sources_and_tags_must_be_string_lists(self):
        self.assert_error("sources", {"url": "https://example.com"}, "sources는 문자열 리스트")
        self.assert_error("tags", [{}], "tags는 문자열 리스트")

    def test_relations_must_be_mapping_of_string_lists(self):
        self.assert_error("relations", "bad", "relations는 mapping")
        relations = deepcopy(self.frontmatter["relations"])
        relations["depends_on"] = "[[uiux/one]]"
        self.assert_error("relations", relations, "relations 값은 문자열 리스트")

    def test_date_and_numeric_fields_are_typed(self):
        self.assert_error("updated", "2026/07/19", "updated는 YYYY-MM-DD YAML date")
        self.assert_error("confidence", True, "confidence는 0.0~1.0 숫자")
        self.assert_error("schema_version", True, "schema_version은 정수")


if __name__ == "__main__":
    unittest.main()
