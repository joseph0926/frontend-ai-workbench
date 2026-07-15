#!/usr/bin/env python3
"""
knowledge/ wiki lint runner.

Validates wiki pages against knowledge/SCHEMA.md rules.
Run: python scripts/wiki-lint.py [knowledge/]

Exit code: 0 if no errors, 1 if errors exist.
"""

import re
import sys
import random
import hashlib
import yaml
from datetime import date, datetime, timedelta
from pathlib import Path
from collections import defaultdict


VALID_TYPES = {"source", "entity", "concept", "synthesis"}
VALID_STATUS = {"current", "outdated", "conflict", "review-needed", "deprecated"}
VALID_RELATIONS = {"depends_on", "contrasts_with", "expands_on", "applies_to", "contradicts", "supersedes"}
REQUIRED_FIELDS = {"schema_version", "type", "tags", "sources", "relations", "confidence", "status", "updated"}
CURRENT_SCHEMA_VERSION = 1
PAGE_SIZE_WARNING = 400
PAGE_SIZE_ERROR = 800
MIN_WIKILINKS = 2
STALE_DAYS = 90
# 의미 검수 타깃팅용 파라미터
SYMMETRIC_RELATIONS = {"contrasts_with", "contradicts"}
RISK_CONFIDENCE_MAX = 0.6
RISK_STATUSES = {"outdated", "conflict", "review-needed"}
RANDOM_AUDIT_PERCENT = 3

WIKILINK_RE = re.compile(r"\[\[([^\]]+)\]\]")
CODE_BLOCK_RE = re.compile(r"```.*?```", re.DOTALL)
INLINE_CODE_RE = re.compile(r"`[^`]+`")
FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n", re.DOTALL)
URL_RE = re.compile(r"https?://")
ACCESSED_RE = re.compile(r"accessed\s+\d{4}-\d{2}-\d{2}", re.IGNORECASE)
NON_CONTENT_FILES = {"index.md", "write-back-inbox.md", "SCHEMA.md"}


class Issue:
    def __init__(self, severity, path, message):
        self.severity = severity
        self.path = path
        self.message = message

    def __repr__(self):
        return f"[{self.severity.upper()}] {self.path}: {self.message}"


def extract_wikilinks(body):
    """Strip code blocks and inline code before extracting [[wikilinks]]. Filter Next.js catch-all syntax."""
    if not body:
        return []
    stripped = CODE_BLOCK_RE.sub("", body)
    stripped = INLINE_CODE_RE.sub("", stripped)
    links = WIKILINK_RE.findall(stripped)
    return [l for l in links if not l.startswith("...") and "/" in l]


def normalize_wikilink(link):
    return link.split("|")[0].split("#")[0].strip()


def source_text(page):
    """Collect provenance context: frontmatter `sources` + body Sources section + inline 출처/링크 lines."""
    parts = []
    fm = page.frontmatter
    if isinstance(fm, dict):
        srcs = fm.get("sources") or []
        if isinstance(srcs, str):
            srcs = [srcs]
        parts.extend(str(s) for s in srcs)
    body = page.body or ""
    m = re.search(r"^##\s+(?:Sources|출처)\b", body, re.MULTILINE)
    if m:
        rest = body[m.start():]
        nxt = re.search(r"\n##\s+", rest)
        parts.append(rest[:nxt.start()] if nxt else rest)
    for line in body.splitlines():
        if "출처:" in line or "링크:" in line:
            parts.append(line)
    return "\n".join(parts)


class WikiPage:
    def __init__(self, path, content, frontmatter, body):
        self.path = path
        self.content = content
        self.frontmatter = frontmatter
        self.body = body
        self.wikilinks = extract_wikilinks(body)
        self.line_count = content.count("\n") + 1


def parse_page(path):
    text = path.read_text(encoding="utf-8")
    match = FRONTMATTER_RE.match(text)
    if match:
        try:
            fm = yaml.safe_load(match.group(1)) or {}
        except yaml.YAMLError:
            fm = None
        body = text[match.end():]
        return WikiPage(path, text, fm, body)
    return WikiPage(path, text, None, text)


def find_knowledge_root(start):
    """Walk up to find the knowledge/ directory; fall back to start if not found."""
    for parent in [start] + list(start.parents):
        if parent.name == "knowledge" and parent.is_dir():
            return parent
        candidate = parent / "knowledge"
        if candidate.is_dir():
            return candidate
    return start


def derive_taxonomy(knowledge_root):
    return {d.name for d in knowledge_root.iterdir() if d.is_dir() and not d.name.startswith(".")}


def is_excluded(path, _root):
    return path.name in NON_CONTENT_FILES


def collect_pages(scope, exclude_root):
    pages = {}
    for md in sorted(scope.rglob("*.md")):
        if is_excluded(md, exclude_root):
            continue
        try:
            pages[md] = parse_page(md)
        except Exception as e:
            pages[md] = None
            print(f"[ERROR] {md}: failed to parse — {e}", file=sys.stderr)
    return pages


def page_slug(path, root):
    rel = path.relative_to(root)
    parts = list(rel.parts)
    if len(parts) >= 2 and parts[-2] in {"concepts", "entities", "synthesis", "sources"}:
        parts.pop(-2)
    parts[-1] = parts[-1].removesuffix(".md")
    return "/".join(parts)


def validate_page(page, all_slugs, taxonomy):
    issues = []
    p = page.path

    fm = page.frontmatter
    if isinstance(fm, dict) and fm.get("status") == "deprecated":
        targets = []
        sb = fm.get("superseded_by") or []
        if isinstance(sb, str):
            sb = [sb]
        for item in sb:
            targets.extend(WIKILINK_RE.findall(str(item)))
        if not targets:
            issues.append(Issue("warning", p, "deprecated 문서인데 superseded_by 없음"))
        for t in targets:
            t = normalize_wikilink(t)
            if t and t not in all_slugs:
                issues.append(Issue("error", p, f"deprecated superseded_by 대상 부재: {t!r}"))
        return issues
    if fm is None:
        issues.append(Issue("error", p, "frontmatter 없음 또는 파싱 실패"))
        return issues
    else:
        missing = REQUIRED_FIELDS - fm.keys()
        if missing:
            issues.append(Issue("error", p, f"frontmatter 필수 필드 누락: {sorted(missing)}"))

        if "schema_version" in fm and fm["schema_version"] != CURRENT_SCHEMA_VERSION:
            issues.append(Issue("error", p, f"schema_version 값 불일치: {fm['schema_version']!r} (현재 {CURRENT_SCHEMA_VERSION})"))

        if "type" in fm and fm["type"] not in VALID_TYPES:
            issues.append(Issue("error", p, f"type 값이 enum 밖: {fm['type']!r}"))

        if "status" in fm and fm["status"] not in VALID_STATUS:
            issues.append(Issue("error", p, f"status 값이 enum 밖: {fm['status']!r}"))

        if "tags" in fm:
            tags = fm["tags"] or []
            if not isinstance(tags, list):
                issues.append(Issue("error", p, "tags는 리스트여야 함"))
            else:
                out_of_taxonomy = [t for t in tags if t not in taxonomy]
                if out_of_taxonomy:
                    issues.append(Issue("error", p, f"tags가 taxonomy 밖: {out_of_taxonomy}"))
                if len(tags) > 5:
                    issues.append(Issue("warning", p, f"tags 5개 초과: {len(tags)}개"))

        if "confidence" in fm:
            c = fm["confidence"]
            if not isinstance(c, (int, float)) or not 0.0 <= c <= 1.0:
                issues.append(Issue("error", p, f"confidence는 0.0~1.0 범위여야 함: {c!r}"))
            elif c <= 0.5 and "근거 강도 메모" not in page.body:
                issues.append(Issue("error", p, "confidence 0.5 이하인데 `## 근거 강도 메모` 부재"))

        if "relations" in fm:
            rels = fm["relations"] or {}
            if isinstance(rels, dict):
                unknown = set(rels.keys()) - VALID_RELATIONS
                if unknown:
                    issues.append(Issue("error", p, f"relations 키가 enum 밖: {sorted(unknown)}"))
                rel_missing = VALID_RELATIONS - set(rels.keys())
                if rel_missing:
                    issues.append(Issue("error", p, f"relations 6개 키 중 누락: {sorted(rel_missing)} (빈 배열로라도 명시 필요)"))

        if "updated" in fm:
            u = fm["updated"]
            if isinstance(u, (date, datetime)):
                u_date = u if isinstance(u, date) else u.date()
                if (date.today() - u_date).days > STALE_DAYS:
                    issues.append(Issue("warning", p, f"{STALE_DAYS}일 이상 미갱신 ({u_date})"))

        if fm.get("type") == "synthesis":
            ref_count = len(page.wikilinks)
            if ref_count < 3:
                issues.append(Issue("error", p, f"synthesis 페이지는 최소 3개 참조 필요 (현재 {ref_count})"))

    if len(page.wikilinks) < MIN_WIKILINKS:
        issues.append(Issue("error", p, f"outbound [[wikilink]] {MIN_WIKILINKS}개 미만 (현재 {len(page.wikilinks)})"))

    has_sources_section = "## Sources" in page.body or "## 출처" in page.body
    has_inline_source = "- 출처:" in page.body or "- 링크:" in page.body
    if not (has_sources_section or has_inline_source):
        issues.append(Issue("error", p, "Sources 섹션 또는 인라인 출처 부재"))

    src_text = source_text(page)
    has_url = bool(URL_RE.search(src_text))
    if has_url and not ACCESSED_RE.search(src_text):
        issues.append(Issue("warning", p, "URL 출처에 접근일(`accessed YYYY-MM-DD`) 부재"))

    if page.line_count > PAGE_SIZE_ERROR:
        issues.append(Issue("error", p, f"page size {PAGE_SIZE_ERROR}줄 초과 (현재 {page.line_count})"))
    elif page.line_count > PAGE_SIZE_WARNING:
        issues.append(Issue("warning", p, f"page size {PAGE_SIZE_WARNING}줄 초과 (현재 {page.line_count})"))

    for link in page.wikilinks:
        target = normalize_wikilink(link)
        if target and target not in all_slugs:
            issues.append(Issue("error", p, f"깨진 [[wikilink]]: {target!r}"))

    return issues


def build_relation_map(all_pages, root):
    """slug -> {relation_type: set(target_slugs)} (frontmatter relations 기준)."""
    rel_map = {}
    for path, page in all_pages.items():
        if not page or not isinstance(page.frontmatter, dict):
            continue
        rels = page.frontmatter.get("relations") or {}
        if not isinstance(rels, dict):
            continue
        entry = {}
        for rtype, targets in rels.items():
            if isinstance(targets, str):
                targets = [targets]
            tset = set()
            for t in (targets or []):
                for m in WIKILINK_RE.findall(str(t)):
                    tt = normalize_wikilink(m)
                    if tt:
                        tset.add(tt)
            entry[rtype] = tset
        rel_map[page_slug(path, root)] = entry
    return rel_map


def check_relation_symmetry(scope_pages, rel_map, root, include_soft):
    """↔ 관계(contrasts_with/contradicts)가 한쪽만 선언된 경우.

    contradicts는 양쪽 선언을 요구하므로 warning으로 기본 lint에 포함한다.
    contrasts_with는 관습상 한쪽만 둘 수 있어 → info, LLM이 대칭 필요 여부 판단할 후보.
    info는 양이 많아 기본 lint를 시끄럽게 하므로 `--routing-audit`(관점3 피드)에서만 방출한다.
    """
    issues = []
    for path, page in sorted(scope_pages.items()):
        if not page or not isinstance(page.frontmatter, dict):
            continue
        slug = page_slug(path, root)
        entry = rel_map.get(slug, {})
        for rtype in SYMMETRIC_RELATIONS:
            for target in entry.get(rtype, set()):
                back = rel_map.get(target)
                if back is None:
                    continue  # 대상 페이지 부재/legacy — 존재성은 다른 체크가 담당
                if slug in back.get(rtype, set()):
                    continue
                if rtype == "contradicts":
                    issues.append(Issue("warning", path, f"비대칭 contradicts 관계: [[{target}]]를 가리키나 역방향 누락 (양쪽 선언 필요)"))
                elif include_soft:
                    issues.append(Issue("info", path, f"비대칭 contrasts_with 관계: [[{target}]]를 가리키나 역방향 누락 (의미 검토 후보)"))
    return issues


def check_index_routing(scope, all_slugs, knowledge_root, scope_topics=None):
    """index.md 라우팅/경계 텍스트의 [[wikilink]] 대상이 실존하는지 확인한다.

    index는 운영 파일이라 page 검증에서 제외되지만, 라우팅 표면이라 깨진 링크는 라우팅 결함이다.
    scoped 실행에서는 root index.md도 함께 스캔하되, scope topic을 가리키는 링크만 보고한다.
    """
    issues = []
    index_paths = set(scope.rglob("index.md"))
    root_index = knowledge_root / "index.md"
    if scope.resolve() != knowledge_root.resolve() and root_index.exists():
        index_paths.add(root_index)
    for idx in sorted(index_paths):
        text = idx.read_text(encoding="utf-8")
        for link in extract_wikilinks(text):
            target = normalize_wikilink(link)
            if idx.resolve() == root_index.resolve() and scope.resolve() != knowledge_root.resolve() and scope_topics:
                topic = target.split("/", 1)[0]
                if topic not in scope_topics:
                    continue
            if target and target not in all_slugs:
                issues.append(Issue("warning", idx, f"index 라우팅 링크 대상 부재: [[{target}]] (retire/rename 가능)"))
    return issues


def is_deprecated(page):
    """Deprecated tombstone은 active graph 품질 검사에서 제외한다."""
    return isinstance(page.frontmatter, dict) and page.frontmatter.get("status") == "deprecated"


def build_inbound_map(all_pages, root):
    """slug -> 콘텐츠 페이지 inbound 참조 수 (self 제외).

    collect_pages가 index.md(운영 파일)를 이미 제외하므로 여기 wikilinks 출처는 콘텐츠 페이지뿐이다.
    Index 라우팅으로만 도달하고 content graph에는 연결되지 않은 page를 찾는다.
    """
    inbound = {page_slug(p, root): 0 for p, pg in all_pages.items() if pg}
    for path, page in sorted(all_pages.items()):
        if not page or is_deprecated(page):
            continue
        src = page_slug(path, root)
        for link in page.wikilinks:
            t = normalize_wikilink(link)
            if t in inbound and t != src:
                inbound[t] += 1
    return inbound


def check_orphans(scope_pages, inbound, root):
    """Content page의 inbound가 0개면 warning으로 보고한다."""
    issues = []
    for path, page in sorted(scope_pages.items()):
        if not page or is_deprecated(page):
            continue
        slug = page_slug(path, root)
        if inbound.get(slug, 0) == 0:
            issues.append(Issue("warning", path, "고아 페이지 — 콘텐츠 inbound [[wikilink]] 0개 (index 라우팅 외 연결 없음)"))
    return issues


def check_index_registration(scope_pages, root):
    """Page가 자기 topic index.md에 등록됐는지 확인한다."""
    issues = []
    idx_cache = {}
    for path, page in sorted(scope_pages.items()):
        if not page or is_deprecated(page):
            continue
        slug = page_slug(path, root)
        topic = slug.split("/")[0]
        if topic not in idx_cache:
            idx = root / topic / "index.md"
            idx_cache[topic] = idx.read_text(encoding="utf-8") if idx.exists() else None
        text = idx_cache[topic]
        if text is None:
            continue
        registered = {normalize_wikilink(link) for link in extract_wikilinks(text)}
        if slug not in registered:
            issues.append(Issue("error", path, f"topic index.md에 미등록: [[{slug}]] 링크 부재"))
    return issues


def check_contradicts_resolved(scope_pages, status_by_slug, rel_map, root):
    """Contradicts 관계의 양쪽 status가 conflict인지 확인한다."""
    issues = []
    seen_pairs = set()
    for path, page in sorted(scope_pages.items()):
        if not page or is_deprecated(page) or not isinstance(page.frontmatter, dict):
            continue
        slug = page_slug(path, root)
        contradicts = rel_map.get(slug, {}).get("contradicts", set())
        if not contradicts:
            continue
        my_status = page.frontmatter.get("status")
        for t in sorted(contradicts):
            if t not in status_by_slug:
                continue
            pair_key = tuple(sorted((slug, t)))
            if pair_key in seen_pairs:
                continue
            if my_status != "conflict" and status_by_slug[t] != "conflict":
                seen_pairs.add(pair_key)
                issues.append(Issue("warning", path, f"contradicts [[{t}]] 선언됐으나 양쪽 status가 conflict 아님"))
    return issues


def markdown_table_cells(line):
    stripped = line.strip()
    if not stripped.startswith("|") or "|" not in stripped[1:]:
        return None
    return [cell.strip() for cell in stripped.strip("|").split("|")]


def is_markdown_separator_row(cells):
    return all(re.fullmatch(r":?-{3,}:?", cell.replace(" ", "")) for cell in cells)


def registered_root_topics(root_index_text):
    topics = set()
    for link in extract_wikilinks(root_index_text):
        slug = normalize_wikilink(link)
        if "/" in slug:
            topics.add(slug.split("/", 1)[0])
    directory_col = None
    for line in root_index_text.splitlines():
        cells = markdown_table_cells(line)
        if cells is None:
            directory_col = None
            continue
        if is_markdown_separator_row(cells):
            continue
        header_idx = next((i for i, cell in enumerate(cells) if cell in {"디렉터리", "Dir", "Directory"}), None)
        if header_idx is not None:
            directory_col = header_idx
            continue
        if directory_col is None or len(cells) <= directory_col:
            continue
        for token in re.findall(r"`([^`]+)`", cells[directory_col]):
            if re.fullmatch(r"[a-z0-9][a-z0-9-]*", token):
                topics.add(token)
    return topics


def check_topic_structure(scope_topics, knowledge_root, root_topics):
    """Topic index와 root routing 등록을 확인한다."""
    issues = []
    for topic in sorted(scope_topics):
        idx = knowledge_root / topic / "index.md"
        if not idx.exists():
            issues.append(Issue("error", idx, "topic 디렉터리에 index.md 부재"))
        if topic not in root_topics:
            issues.append(Issue("warning", knowledge_root / "index.md", f"topic '{topic}'이 root index.md 라우팅에 미등록"))
    return issues


def random_sample_size(total):
    return max(1, (total * RANDOM_AUDIT_PERCENT + 99) // 100) if total else 0


def stable_random_sample(slugs, seed):
    size = min(random_sample_size(len(slugs)), len(slugs))
    seed_int = int(hashlib.sha256(seed.encode("utf-8")).hexdigest(), 16)
    rng = random.Random(seed_int)
    return sorted(rng.sample(sorted(slugs), size)) if size else []


def build_audit_manifest(all_pages, root, seed):
    """관점1(페이지 품질) LLM 표본 타깃팅: 리스크 신호가 있는 페이지만 추린다.

    census(전수 정독) 대신 confidence 낮음/status 비정상/stale/synthesis 후보/전체 랜덤 표본으로
    LLM 정독 대상을 좁힌다(비용↓).
    """
    priority = []    # confidence/status/stale 신호 — 전부 정독 (작고 고위험)
    synth_pool = []  # synthesis뿐 — emergent 연결 검수 표본 후보
    all_schema_slugs = []
    total = 0
    for path, page in sorted(all_pages.items()):
        if not page or not isinstance(page.frontmatter, dict):
            continue
        total += 1
        fm = page.frontmatter
        reasons = []
        c = fm.get("confidence")
        if isinstance(c, (int, float)) and c <= RISK_CONFIDENCE_MAX:
            reasons.append(f"confidence={c}")
        if fm.get("status") in RISK_STATUSES:
            reasons.append(f"status={fm.get('status')}")
        u = fm.get("updated")
        if isinstance(u, (date, datetime)):
            ud = u if isinstance(u, date) else u.date()
            age = (date.today() - ud).days
            if age > STALE_DAYS:
                reasons.append(f"stale={age}d")
        slug = page_slug(path, root)
        all_schema_slugs.append(slug)
        is_synth = fm.get("type") == "synthesis"
        if reasons:
            if is_synth:
                reasons.append("synthesis")
            priority.append((slug, reasons))
        elif is_synth:
            synth_pool.append(slug)
    random_sample = stable_random_sample(all_schema_slugs, seed)
    return priority, synth_pool, random_sample, total


def parse_args(argv):
    flags = set()
    options = {}
    positional = []
    i = 0
    while i < len(argv):
        arg = argv[i]
        if arg == "--seed":
            if i + 1 >= len(argv):
                raise ValueError("--seed requires a value")
            options["seed"] = argv[i + 1]
            i += 2
            continue
        if arg.startswith("--seed="):
            options["seed"] = arg.split("=", 1)[1]
            i += 1
            continue
        if arg.startswith("--"):
            flags.add(arg)
        else:
            positional.append(arg)
        i += 1
    return flags, options, positional


def main():
    try:
        flags, options, positional = parse_args(sys.argv[1:])
    except ValueError as e:
        print(str(e), file=sys.stderr)
        return 2
    scope = Path(positional[0] if positional else "knowledge").resolve()
    if not scope.is_dir():
        print(f"디렉터리 없음: {scope}", file=sys.stderr)
        return 2

    knowledge_root = find_knowledge_root(scope.resolve())
    taxonomy = derive_taxonomy(knowledge_root)
    scope_pages = collect_pages(scope, knowledge_root)
    all_pages = scope_pages if scope.resolve() == knowledge_root else collect_pages(knowledge_root, knowledge_root)
    all_slugs = {page_slug(p, knowledge_root) for p, page in all_pages.items() if page}

    rel_map = build_relation_map(all_pages, knowledge_root)

    if scope.resolve() == knowledge_root:
        scope_topics = set(taxonomy)
    else:
        rel = scope.resolve().relative_to(knowledge_root)
        scope_topics = {rel.parts[0]} if rel.parts else set(taxonomy)

    if "--audit-manifest" in flags:
        # 관점1(페이지 품질) 표본 타깃팅: census 대신 고위험 + synthesis 후보 + 전체 랜덤 표본으로 좁힌다
        seed = options.get("seed") or date.today().isoformat()
        priority, synth_pool, random_sample, total = build_audit_manifest(all_pages, knowledge_root, seed)
        print("# priority (전부 정독 — confidence/status/stale)")
        for slug, reasons in priority:
            print(f"{slug}\t{', '.join(reasons)}")
        print(f"\n# synthesis pool ({len(synth_pool)}개 — emergent 연결 검수 표본 후보)")
        for slug in synth_pool:
            print(slug)
        print(f"\n# random sample (N={len(random_sample)}, seed={seed}, pool={total} — 전체 SCHEMA 페이지 {RANDOM_AUDIT_PERCENT}% 스팟체크)")
        for slug in random_sample:
            print(slug)
        print(f"\nrisk priority: {len(priority)}개(정독), synthesis pool: {len(synth_pool)}개(표본), random sample: {len(random_sample)}개(seed={seed}), SCHEMA 페이지 {total}개", file=sys.stderr)
        return 0

    if "--routing-audit" in flags:
        # 관점3(라우팅·연결) 피드: 대칭성 후보(info 포함) + index 라우팅 링크 실존
        routing = check_relation_symmetry(scope_pages, rel_map, knowledge_root, include_soft=True)
        routing += check_index_routing(scope, all_slugs, knowledge_root, scope_topics)
        by_sev = defaultdict(list)
        for i in routing:
            by_sev[i.severity].append(i)
        for sev in ("error", "warning", "info"):
            for i in by_sev[sev]:
                print(i)
        print(f"\n라우팅 후보: warning {len(by_sev['warning'])}, info {len(by_sev['info'])} (LLM 진위 판단 대상)", file=sys.stderr)
        return 0

    all_issues = []
    for path, page in sorted(scope_pages.items()):
        if page is None:
            continue
        all_issues.extend(validate_page(page, all_slugs, taxonomy))

    # 기본 lint: contradicts 비대칭(warning) + index 라우팅 링크 실존(warning)만. contrasts_with info는 --routing-audit로.
    all_issues.extend(check_relation_symmetry(scope_pages, rel_map, knowledge_root, include_soft=False))
    all_issues.extend(check_index_routing(scope, all_slugs, knowledge_root, scope_topics))

    # 고아·index 미등록·contradicts 미해결·topic 구조 위생
    inbound = build_inbound_map(all_pages, knowledge_root)
    status_by_slug = {
        page_slug(p, knowledge_root): (pg.frontmatter.get("status") if isinstance(pg.frontmatter, dict) else None)
        for p, pg in all_pages.items() if pg
    }
    root_index = knowledge_root / "index.md"
    root_index_text = root_index.read_text(encoding="utf-8") if root_index.exists() else ""
    root_topics = registered_root_topics(root_index_text)
    all_issues.extend(check_orphans(scope_pages, inbound, knowledge_root))
    all_issues.extend(check_index_registration(scope_pages, knowledge_root))
    all_issues.extend(check_contradicts_resolved(scope_pages, status_by_slug, rel_map, knowledge_root))
    all_issues.extend(check_topic_structure(scope_topics, knowledge_root, root_topics))

    by_severity = defaultdict(list)
    for issue in all_issues:
        by_severity[issue.severity].append(issue)

    for sev in ("error", "warning", "info"):
        for issue in by_severity[sev]:
            print(issue)

    err = len(by_severity["error"])
    warn = len(by_severity["warning"])
    info = len(by_severity["info"])
    print(f"\n검증 페이지: {len(scope_pages)}개 (scope), {len(all_pages)}개 (full), taxonomy: {len(taxonomy)}개 topic", file=sys.stderr)
    print(f"error: {err}, warning: {warn}, info: {info}", file=sys.stderr)
    return 1 if err else 0


if __name__ == "__main__":
    sys.exit(main())
