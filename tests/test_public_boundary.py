import subprocess
import unittest
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


class PublicBoundaryTest(unittest.TestCase):
    def test_tracked_text_has_no_local_absolute_paths(self):
        result = subprocess.run(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
            cwd=ROOT,
            capture_output=True,
            check=True,
        )
        offenders = []
        for raw in result.stdout.split(b"\0"):
            if not raw:
                continue
            path = ROOT / raw.decode("utf-8")
            try:
                text = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, IsADirectoryError):
                continue
            markers = ["/" + "Users" + "/", "~/" + "dev" + "/", "/" + "home" + "/"]
            if any(marker in text for marker in markers):
                offenders.append(str(path.relative_to(ROOT)))
        self.assertEqual(offenders, [])

    def test_tracked_text_has_no_replacement_characters(self):
        result = subprocess.run(
            ["git", "ls-files", "--cached", "--others", "--exclude-standard", "-z"],
            cwd=ROOT,
            capture_output=True,
            check=True,
        )
        offenders = []
        for raw in result.stdout.split(b"\0"):
            if not raw:
                continue
            path = ROOT / raw.decode("utf-8")
            try:
                text = path.read_text(encoding="utf-8")
            except (UnicodeDecodeError, IsADirectoryError):
                continue
            if "\uFFFD" in text:
                offenders.append(str(path.relative_to(ROOT)))
        self.assertEqual(offenders, [])


if __name__ == "__main__":
    unittest.main()
