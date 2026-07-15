import subprocess
import sys
import tempfile
import textwrap
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
LINTER = ROOT / "scripts" / "wiki-lint.py"


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


if __name__ == "__main__":
    unittest.main()
