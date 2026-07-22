import importlib.util
import tempfile
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
SPEC = importlib.util.spec_from_file_location(
    "verify_no_new_ufffd", ROOT / "scripts/verify-no-new-ufffd.py"
)
VERIFY = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VERIFY)


class VerifyNoNewUfffdTest(unittest.TestCase):
    def test_historical_replacement_in_removed_line_is_ignored(self):
        diff = (
            b"diff --git a/knowledge/log.md b/knowledge/log.md\n"
            b"--- a/knowledge/log.md\n"
            b"+++ b/knowledge/log.md\n"
            b"@@ -10 +10 @@\n"
            b"-historical " + VERIFY.U_FFFD_UTF8 + b"\n"
            b"+clean replacement\n"
        )
        self.assertEqual(VERIFY.parse_added_lines(diff), [])

    def test_replacement_in_added_line_is_reported(self):
        diff = (
            b"diff --git a/knowledge/page.md b/knowledge/page.md\n"
            b"--- a/knowledge/page.md\n"
            b"+++ b/knowledge/page.md\n"
            b"@@ -10,0 +11,2 @@\n"
            b"+clean\n"
            b"+new " + VERIFY.U_FFFD_UTF8 + b" value\n"
        )
        self.assertEqual(
            VERIFY.parse_added_lines(diff),
            [VERIFY.Finding("knowledge/page.md", 12, "tracked addition")],
        )

    def test_file_boundary_resets_hunk_state(self):
        diff = (
            b"diff --git a/knowledge/first.md b/knowledge/first.md\n"
            b"--- a/knowledge/first.md\n"
            b"+++ b/knowledge/first.md\n"
            b"@@ -1,0 +1 @@\n"
            b"+clean\n"
            b"diff --git a/knowledge/second.md b/knowledge/second.md\n"
            b"--- a/knowledge/second.md\n"
            b"+++ b/knowledge/second.md\n"
            b"@@ -5,0 +6 @@\n"
            b"+new " + VERIFY.U_FFFD_UTF8 + b" value\n"
        )
        self.assertEqual(
            VERIFY.parse_added_lines(diff),
            [VERIFY.Finding("knowledge/second.md", 6, "tracked addition")],
        )

    def test_untracked_file_is_scanned_in_full(self):
        with tempfile.TemporaryDirectory() as temp:
            path = Path(temp) / "page.md"
            path.write_bytes(b"clean\nnew " + VERIFY.U_FFFD_UTF8 + b" value\n")
            self.assertEqual(
                VERIFY.scan_full_file(path, "page.md"),
                [VERIFY.Finding("page.md", 2, "untracked file")],
            )


if __name__ == "__main__":
    unittest.main()
