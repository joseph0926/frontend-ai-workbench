#!/usr/bin/env python3
import argparse
import re
import subprocess
import sys
from dataclasses import dataclass
from pathlib import Path


U_FFFD_UTF8 = "\uFFFD".encode("utf-8")
HUNK_HEADER = re.compile(rb"^@@ -\d+(?:,\d+)? \+(\d+)(?:,\d+)? @@")


@dataclass(frozen=True)
class Finding:
    path: str
    line: int
    source: str


def git(root, *args):
    return subprocess.run(
        ["git", *args],
        cwd=root,
        capture_output=True,
        check=False,
    )


def discover_repo_root(explicit_root):
    if explicit_root:
        candidate = Path(explicit_root).resolve()
        result = git(candidate, "rev-parse", "--show-toplevel")
    else:
        result = subprocess.run(
            ["git", "rev-parse", "--show-toplevel"],
            capture_output=True,
            check=False,
        )
    if result.returncode != 0:
        message = result.stderr.decode("utf-8", errors="replace").strip()
        raise ValueError(message or "git repository를 찾을 수 없습니다")
    return Path(result.stdout.decode("utf-8").strip()).resolve()


def resolve_paths(root, raw_paths):
    resolved = []
    seen = set()
    for raw_path in raw_paths:
        candidate = Path(raw_path)
        if not candidate.is_absolute():
            candidate = root / candidate
        candidate = candidate.resolve(strict=False)
        try:
            relative = candidate.relative_to(root)
        except ValueError as error:
            raise ValueError(f"repository 밖 경로는 검사할 수 없습니다: {candidate}") from error
        relative_text = relative.as_posix()
        tracked = git(root, "ls-files", "--error-unmatch", "--", relative_text).returncode == 0
        if not tracked and not candidate.is_file():
            raise ValueError(f"추적 파일이나 존재하는 일반 파일이 아닙니다: {relative_text}")
        if candidate.is_dir():
            raise ValueError(f"파일 경로만 지정할 수 있습니다: {relative_text}")
        if relative_text not in seen:
            resolved.append((candidate, relative_text, tracked))
            seen.add(relative_text)
    return resolved


def parse_added_lines(diff_bytes):
    findings = []
    current_path = None
    new_line = None
    for line in diff_bytes.splitlines():
        if line.startswith(b"diff --git "):
            current_path = None
            new_line = None
            continue
        if line.startswith(b"+++ "):
            new_line = None
            marker = line[4:]
            if marker == b"/dev/null":
                current_path = None
            else:
                if marker.startswith(b"b/"):
                    marker = marker[2:]
                current_path = marker.decode("utf-8", errors="surrogateescape")
            continue
        header = HUNK_HEADER.match(line)
        if header:
            new_line = int(header.group(1))
            continue
        if new_line is None:
            continue
        if line.startswith(b"+") and not line.startswith(b"+++"):
            if current_path and U_FFFD_UTF8 in line[1:]:
                findings.append(Finding(current_path, new_line, "tracked addition"))
            new_line += 1
        elif line.startswith(b"-") and not line.startswith(b"---"):
            continue
        elif line.startswith(b"\\ No newline at end of file"):
            continue
        else:
            new_line += 1
    return findings


def scan_full_file(path, display_path):
    return [
        Finding(display_path, line_number, "untracked file")
        for line_number, line in enumerate(path.read_bytes().splitlines(), start=1)
        if U_FFFD_UTF8 in line
    ]


def verify(root, paths):
    findings = []
    head_exists = git(root, "rev-parse", "--verify", "HEAD").returncode == 0
    tracked_paths = [display for _, display, tracked in paths if tracked and head_exists]
    if tracked_paths:
        result = git(
            root,
            "-c",
            "core.quotePath=false",
            "diff",
            "--no-ext-diff",
            "--no-color",
            "--unified=0",
            "HEAD",
            "--",
            *tracked_paths,
        )
        if result.returncode != 0:
            message = result.stderr.decode("utf-8", errors="replace").strip()
            raise ValueError(message or "git diff 실행에 실패했습니다")
        findings.extend(parse_added_lines(result.stdout))
    for path, display, tracked in paths:
        if not head_exists or not tracked:
            if path.is_file():
                findings.extend(scan_full_file(path, display))
    return findings


def main():
    parser = argparse.ArgumentParser(
        description="Tracked 파일의 HEAD 대비 추가 줄과 untracked 파일 전체에서 새 U+FFFD를 검사합니다."
    )
    parser.add_argument("paths", nargs="+", help="검사할 repository 내부 파일 경로")
    parser.add_argument("--repo-root", help="git repository root override")
    args = parser.parse_args()

    try:
        root = discover_repo_root(args.repo_root)
        paths = resolve_paths(root, args.paths)
        findings = verify(root, paths)
    except (OSError, ValueError) as error:
        print(f"ERROR: {error}", file=sys.stderr)
        return 2

    if findings:
        print("ERROR: 새 U+FFFD가 발견됐습니다.", file=sys.stderr)
        for finding in findings:
            print(f"- {finding.path}:{finding.line} ({finding.source})", file=sys.stderr)
        return 1

    print(f"OK: {len(paths)}개 경로에 새 U+FFFD가 없습니다.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
