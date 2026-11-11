#!/usr/bin/env python3
"""Validate docs/STORY-SCRIPT.md and compile it to src/story/story.json.

Standard library only. Format spec: docs/story/SCHEMA.md.

  python3 scripts/story/build.py                  validate + write story.json (dev)
  python3 scripts/story/build.py --todo           list every {edit} line / [EDIT: ...] marker
  python3 scripts/story/build.py --sync-manifest  add pending manifest entries for new art IDs
  python3 scripts/story/build.py --release        strict publication checks
  python3 scripts/story/build.py --check          fail if story.json is stale (CI)

Exit code 1 on any error. Warnings never fail the build.
"""
import argparse
import json
import os
import re
import sys

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
SCRIPT = os.path.join(ROOT, 'docs', 'STORY-SCRIPT.md')
LETTERS = os.path.join(ROOT, 'docs', 'story', 'letters')
MANIFEST = os.path.join(ROOT, 'public', 'story', 'manifest.json')
OUT = os.path.join(ROOT, 'src', 'story', 'story.json')
DATA = os.path.join(ROOT, 'src', 'data')

LEVEL = {'Chapter': 1, 'Arc': 1, 'Story': 2, 'Scene': 3, 'Panel': 4, 'Item': 5}
PARENT_KIND = {'Story': ('Chapter', 'Arc'), 'Scene': ('Story',), 'Panel': ('Scene',), 'Item': ('Panel',)}
PANEL_TYPES = {'TITLE_HERO', 'TITLE_CHAPTER', 'PANEL_SPLASH', 'PANEL_STANDARD', 'PANEL_SELECTION',
               'PANEL_EVIDENCE', 'PANEL_TESTIMONIAL', 'PANEL_TRANSITION'}
ARC_KINDS = {'project', 'daily-life', 'achievement', 'testimonial'}
NODE_STATUS = {'draft', 'approved', 'hold'}
LINE_STATUS = {'draft', 'approved', 'edit'}
PUBLISHED = {'NAR', 'THO', 'DIA', 'SUB', 'FAC', 'SKL', 'SFX', 'PORTAL', 'ALT'}
INTERNAL = {'VISUAL', 'NOTE'}
SPOKEN = {'NAR', 'THO', 'DIA'}
LETTER_STATUS = {'awaiting-text', 'approved', 'published'}
ART_STATUS = {'pending', 'approved-for-generation', 'generated', 'approved-for-publication', 'rejected'}
SCENE_WORD_BUDGET = 45
MAIN_PATH_BUDGET = 42

HEAD_RE = re.compile(r'^(#{1,6})\s+(Chapter|Arc|Story|Scene|Panel|Item)\s+([A-Za-z0-9][A-Za-z0-9_-]*)(?:\s+·\s+(.*?))?\s*$')
ANY_HEAD_RE = re.compile(r'^#{1,6}\s')
LINE_RE = re.compile(r'^\s*(?:[-*]\s+)?(NAR|THO|DIA|SUB|FAC|SKL|SFX|PORTAL|ALT|VISUAL|NOTE)'
                     r'(?:\[([^\]]+)\])?\s*(?:\{([a-z-]+)\})?\s*:\s*(.*?)\s*$')
SLUG_RE = re.compile(r'^[a-z0-9]+(?:-[a-z0-9]+)*$')
EDIT_RE = re.compile(r'\[EDIT:[^\]]*\]')
PRIVATE = [
    (re.compile(r'\b[STFGM]\d{7}[A-Z]\b'), 'NRIC-like number'),
    (re.compile(r'(?:\+65[\s-]?)\b[3689]\d{3}[\s-]?\d{4}\b|\b[89]\d{3}[\s-]\d{4}\b'), 'phone number'),
    (re.compile(r'[\w.+-]+@[\w-]+\.[\w.-]+'), 'email address'),
]


class Report:
    def __init__(self):
        self.errors, self.warnings = [], []

    def err(self, where, msg):
        self.errors.append(f'{where}: {msg}')

    def warn(self, where, msg):
        self.warnings.append(f'{where}: {msg}')


# ---------------------------------------------------------------- parsing

def strip_comment(v):
    return re.split(r'\s+#', v, maxsplit=1)[0].strip()


def parse_value(v):
    v = strip_comment(v)
    if v.startswith('[') and v.endswith(']'):
        return [x.strip() for x in v[1:-1].split(',') if x.strip()]
    if v.startswith('{') and v.endswith('}'):
        out = {}
        for part in v[1:-1].split(','):
            if ':' in part:
                k, val = part.split(':', 1)
                out[k.strip()] = val.strip()
        return out
    return v


def parse_meta(lines, where, rep):
    meta = {}
    for n, raw in lines:
        line = raw.strip()
        if not line or line.startswith('#'):
            continue
        if ':' not in line:
            rep.err(f'{where} (line {n})', f'meta line is not "key: value": {line!r}')
            continue
        k, v = line.split(':', 1)
        k = k.strip()
        if k in meta:
            rep.err(f'{where} (line {n})', f'duplicate meta key {k!r}')
        meta[k] = parse_value(v)
    return meta


def new_node(kind, nid, label, line):
    return {'kind': kind, 'id': nid, 'label': label or '', 'line': line, 'meta': {}, 'lines': [],
            'children': [], 'has_meta': False}


def parse_script(path, rep):
    roots, stack, by_id = [], [], {}
    lines = open(path, encoding='utf-8').read().split('\n')
    i, started = 0, False
    while i < len(lines):
        n, raw = i + 1, lines[i]
        m = HEAD_RE.match(raw)
        if m:
            hashes, kind, nid, label = m.groups()
            started = True
            if len(hashes) != LEVEL[kind]:
                rep.err(f'line {n}', f'{kind} must use {"#" * LEVEL[kind]} (found {hashes})')
            node = new_node(kind, nid, label, n)
            while stack and LEVEL[stack[-1]['kind']] >= LEVEL[kind]:
                stack.pop()
            if kind in ('Chapter', 'Arc'):
                roots.append(node)
            elif not stack or stack[-1]['kind'] not in PARENT_KIND[kind]:
                rep.err(f'line {n}', f'{kind} {nid} is not inside a {" or ".join(PARENT_KIND[kind])}')
            else:
                stack[-1]['children'].append(node)
                node['parent'] = stack[-1]['id']
            if nid in by_id:
                rep.err(f'line {n}', f'duplicate ID {nid!r} (first used on line {by_id[nid]["line"]})')
            else:
                by_id[nid] = node
            stack.append(node)
            i += 1
            # optional meta fence right after the heading
            j = i
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip() == '```story':
                k = j + 1
                body = []
                while k < len(lines) and lines[k].strip() != '```':
                    body.append((k + 1, lines[k]))
                    k += 1
                if k >= len(lines):
                    rep.err(f'line {j + 1}', 'unclosed ```story block')
                node['meta'] = parse_meta(body, f'{kind} {nid}', rep)
                node['has_meta'] = True
                i = k + 1
            continue
        if not started:
            i += 1
            continue
        if raw.strip() == '```story':
            rep.err(f'line {n}', '```story block must come directly after a heading')
            i += 1
            continue
        if ANY_HEAD_RE.match(raw):
            rep.err(f'line {n}', f'unrecognised heading (expected Chapter/Arc/Story/Scene/Panel/Item <ID>): {raw.strip()!r}')
            i += 1
            continue
        lm = LINE_RE.match(raw)
        if lm:
            prefix, speaker, status, text = lm.groups()
            cur = stack[-1] if stack else None
            if not cur or cur['kind'] not in ('Panel', 'Item'):
                rep.err(f'line {n}', f'{prefix} line must sit inside a Panel or Item')
            else:
                if status and status not in LINE_STATUS:
                    rep.err(f'line {n}', f'unknown status {{{status}}} (use draft, approved or edit)')
                if prefix == 'DIA' and not speaker:
                    rep.err(f'line {n}', 'DIA needs a speaker: DIA[Name]')
                cur['lines'].append({'type': prefix, 'speaker': speaker, 'status': status or 'draft',
                                     'text': text, 'line': n})
        elif raw.strip() and not raw.lstrip().startswith(('>', '---', '<!--')):
            rep.warn(f'line {n}', f'line ignored (not a recognised copy line): {raw.strip()[:60]!r}')
        i += 1
    return roots, by_id


def parse_letter(slug, rep):
    path = os.path.join(LETTERS, f'{slug}.md')
    if not os.path.exists(path):
        rep.err(f'letter {slug}', f'missing file docs/story/letters/{slug}.md')
        return None
    src = open(path, encoding='utf-8').read().split('\n')
    meta_lines, in_meta, text_lines, in_text = [], False, [], False
    for n, raw in enumerate(src, 1):
        s = raw.strip()
        if s == '```story' and not in_text:
            in_meta = True
            continue
        if in_meta:
            if s == '```':
                in_meta = False
            else:
                meta_lines.append((n, raw))
            continue
        if re.match(r'^##\s+Text\s*$', s):
            in_text = True
            continue
        if in_text:
            text_lines.append(raw)
    meta = parse_meta(meta_lines, f'letter {slug}', rep)
    text = '\n'.join(text_lines).strip()
    if meta.get('status') not in LETTER_STATUS:
        rep.err(f'letter {slug}', f'status must be one of {sorted(LETTER_STATUS)}')
    return {'slug': slug, 'meta': meta, 'text': text}


# ---------------------------------------------------------------- data

def load_json(path, default):
    try:
        return json.load(open(path, encoding='utf-8'))
    except FileNotFoundError:
        return default


def load_data():
    d = {k: load_json(os.path.join(DATA, f'{k}.json'), []) for k in
         ('education', 'experience', 'projects', 'testimonials', 'awards')}
    skills = load_json(os.path.join(DATA, 'skills.json'), {})
    names = set()
    for leaf in skills.get('leaves', []):
        names.add(leaf.get('name', '').lower())
    for x in d['experience']:
        names.update(s.lower() for s in x.get('detail', {}).get('skills', []))
    for p in d['projects']:
        names.update(s.lower() for s in p.get('skills', []))
    d['skill_names'] = names
    return d


def norm_years(s):
    return re.sub(r'\s+', '', str(s)).replace('-', '–')


def first_year(s):
    m = re.search(r'(19|20)\d\d', str(s))
    return m.group(0) if m else None


def resolve_ref(ref, data):
    if not isinstance(ref, str) or ':' not in ref:
        return None, 'data_ref must look like kind:key'
    kind, key = ref.split(':', 1)
    key = key.strip()
    if kind == 'awards':
        hit = next((a for a in data['awards'] if a.get('name') == key), None)
    elif kind == 'testimonials':
        hit = next((t for t in data['testimonials'] if t.get('slug') == key), None)
    elif kind in ('education', 'experience', 'projects'):
        hit = next((x for x in data[kind] if x.get('id') == key), None)
    else:
        return None, f'unknown data_ref kind {kind!r}'
    return (kind, hit), (None if hit else f'{ref!r} not found in src/data/{kind}.json')


# ---------------------------------------------------------------- validation

def walk(node):
    yield node
    for c in node['children']:
        yield from walk(c)


def validate(roots, by_id, manifest, data, release, rep):
    chapters = [r for r in roots if r['kind'] == 'Chapter']
    arcs = [r for r in roots if r['kind'] == 'Arc']
    arc_slugs = {a['id'] for a in arcs}
    orders = {}
    letters = {}
    unknown_skills = set()
    art_refs = {}

    for root in roots:
        where = f'{root["kind"]} {root["id"]}'
        if not SLUG_RE.match(root['id']):
            rep.err(where, 'slug must be lowercase letters, digits and hyphens (it becomes a URL)')
        meta = root['meta']
        status = meta.get('status', 'draft')
        if status not in NODE_STATUS:
            rep.err(where, f'unknown status {status!r}')
        if root['kind'] == 'Chapter':
            for k in ('order', 'title'):
                if k not in meta:
                    rep.err(where, f'missing required meta {k!r}')
            o = meta.get('order')
            if o in orders:
                rep.err(where, f'order {o} already used by chapter {orders[o]}')
            orders[o] = root['id']
        else:
            if meta.get('kind') not in ARC_KINDS:
                rep.err(where, f'kind must be one of {sorted(ARC_KINDS)}')
            par = meta.get('parent')
            if not par or par not in by_id or by_id[par]['kind'] != 'Panel':
                rep.err(where, f'parent {par!r} must be an existing Panel ID (the return target)')
            elif not panel_links_arc(by_id[par], root['id']):
                rep.warn(where, f'parent panel {par} has no portal/arc link to this arc')
            if not meta.get('portal'):
                rep.err(where, 'missing portal label (past tense)')
            if meta.get('kind') == 'testimonial':
                slug = meta.get('letter')
                if not slug:
                    rep.err(where, 'testimonial arcs need letter: <slug>')
                else:
                    letters[root['id']] = parse_letter(slug, rep)
        ref = meta.get('data_ref')
        if ref:
            hit, problem = resolve_ref(ref, data)
            if problem:
                rep.warn(where, problem)
            elif root['kind'] == 'Chapter' and meta.get('years') not in (None, 'none'):
                kind, rec = hit
                src_years = rec.get('years') or rec.get('detail', {}).get('stats', {}).get('Years') \
                    or rec.get('detail', {}).get('stats', {}).get('Since')
                if src_years and first_year(src_years) != first_year(meta['years']):
                    rep.warn(where, f'years {meta["years"]!r} disagree with {ref} ({src_years!r})')
        if not root['children']:
            rep.err(where, 'has no Story')

        for node in walk(root):
            if node is root:
                continue
            w = f'{node["kind"]} {node["id"]} (line {node["line"]})'
            ns = node['meta'].get('status', 'draft')
            if ns not in NODE_STATUS:
                rep.err(w, f'unknown status {ns!r}')
            if node['kind'] == 'Scene':
                words = sum(len(l['text'].split()) for p in node['children'] for l in p['lines']
                            if l['type'] in SPOKEN)
                if words > SCENE_WORD_BUDGET:
                    rep.warn(w, f'{words} words of NAR/THO/DIA (budget {SCENE_WORD_BUDGET})')
                for p in node['children']:
                    if not p['id'].startswith(node['id'] + '-'):
                        rep.warn(f'Panel {p["id"]}', f'ID is not prefixed by its scene ID {node["id"]}')
                if not node['children']:
                    rep.err(w, 'scene has no Panel')
            if node['kind'] == 'Panel':
                t = node['meta'].get('type')
                if t not in PANEL_TYPES:
                    rep.err(w, f'type must be one of {sorted(PANEL_TYPES)} (got {t!r})')
                for slug in as_list(node['meta'].get('portal')):
                    if slug not in arc_slugs:
                        rep.err(w, f'portal {slug!r} is not an Arc in this script')
                if t == 'PANEL_SELECTION' and not node['children']:
                    rep.err(w, 'PANEL_SELECTION needs at least one Item')
                if node['children'] and t != 'PANEL_SELECTION':
                    rep.err(w, 'only PANEL_SELECTION panels can contain Items')
                ref = node['meta'].get('data_ref')
                if ref:
                    _, problem = resolve_ref(ref, data)
                    if problem:
                        rep.warn(w, problem)
            if node['kind'] == 'Item':
                if not node['meta'].get('title'):
                    rep.err(w, 'Item needs a title')
                if not node['meta'].get('art'):
                    rep.err(w, 'Item needs an art ID')
                arc = node['meta'].get('arc')
                if arc and arc not in arc_slugs:
                    rep.err(w, f'arc {arc!r} is not an Arc in this script')
            if node['kind'] in ('Panel', 'Item'):
                art = node['meta'].get('art')
                if art:
                    art_refs.setdefault(art, []).append(node['id'])
                    check_art(w, art, node['kind'] == 'Item', manifest, release, rep)
                for s in as_list(node['meta'].get('skills')):
                    if s.lower() not in data['skill_names']:
                        unknown_skills.add(s)
                for l in node['lines']:
                    lw = f'{node["id"]} line {l["line"]}'
                    for rx, what in PRIVATE:
                        if rx.search(l['text']):
                            rep.err(lw, f'looks like a {what} — keep private data out of the public repo')
                    if l['type'] == 'SKL':
                        for s in [x.strip() for x in l['text'].split(',') if x.strip()]:
                            if s.lower() not in data['skill_names']:
                                unknown_skills.add(s)
                    if release and l['type'] in PUBLISHED and visible(node, by_id):
                        if l['status'] != 'approved':
                            rep.err(lw, f'{l["type"]} is {{{l["status"]}}} — must be {{approved}} to publish')
                        if EDIT_RE.search(l['text']):
                            rep.err(lw, 'unresolved [EDIT: …] marker')
            if release and node['kind'] in ('Panel', 'Item') and visible(node, by_id) \
                    and ns != 'approved' and root['meta'].get('status', 'draft') != 'hold':
                rep.err(w, 'panel/item status must be approved to publish')

    for arc_id, letter in letters.items():
        if not letter:
            continue
        arc = by_id[arc_id]
        ls = letter['meta'].get('status')
        ref = arc['meta'].get('data_ref')
        if ref:
            hit, problem = resolve_ref(ref, data)
            if not problem:
                rec = hit[1]
                for k in ('name', 'title'):
                    if letter['meta'].get(k) and rec.get(k) and letter['meta'][k] != rec[k]:
                        rep.warn(f'letter {letter["slug"]}', f'{k} {letter["meta"][k]!r} differs from src/data ({rec[k]!r})')
        if ls in ('approved', 'published') and not letter['text']:
            rep.err(f'letter {letter["slug"]}', f'status is {ls} but ## Text is empty')
        if release and arc['meta'].get('status', 'draft') != 'hold' and ls not in ('approved', 'published'):
            rep.err(f'letter {letter["slug"]}', 'testimonial arc is public but its letter is not approved')

    main_panels = [p for c in chapters if c['meta'].get('status') != 'hold' for p in walk(c)
                   if p['kind'] == 'Panel' and p['meta'].get('status') != 'hold']
    if len(main_panels) > MAIN_PATH_BUDGET:
        rep.warn('main path', f'{len(main_panels)} panels (budget {MAIN_PATH_BUDGET})')
    if unknown_skills:
        rep.warn('skills', 'not found in src/data (fine if intentional — skills sidecars should map to evidence): '
                 + ', '.join(sorted(unknown_skills)))
    for art in sorted(set(manifest.get('assets', {})) - set(art_refs)):
        rep.warn(f'manifest {art}', 'art ID is no longer used by the script')
    return {'chapters': chapters, 'arcs': arcs, 'letters': letters, 'art_refs': art_refs,
            'main_path_panels': len(main_panels)}


def as_list(v):
    if v is None:
        return []
    return v if isinstance(v, list) else [v]


def panel_links_arc(panel, slug):
    if slug in as_list(panel['meta'].get('portal')):
        return True
    return any(i['meta'].get('arc') == slug for i in panel['children'])


def visible(node, by_id):
    """False if this node or any ancestor is on hold."""
    while node:
        if node['meta'].get('status') == 'hold':
            return False
        node = by_id.get(node.get('parent'))
    return True


def check_art(where, art, needs_variants, manifest, release, rep):
    entry = manifest.get('assets', {}).get(art)
    if not entry:
        (rep.err if release else rep.warn)(where, f'art {art!r} has no manifest entry (run --sync-manifest)')
        return
    st = entry.get('status')
    if st not in ART_STATUS:
        rep.err(where, f'manifest {art}: unknown status {st!r}')
    if release:
        if st != 'approved-for-publication':
            rep.err(where, f'art {art!r} is {st!r}, not approved-for-publication')
        if needs_variants:
            v = entry.get('variants', {})
            for bp in ('desktop', 'mobile'):
                for cut in ('crop', 'full'):
                    if not (v.get(bp) or {}).get(cut):
                        rep.err(where, f'art {art!r} is missing the {bp}.{cut} variant')


# ---------------------------------------------------------------- output

def compile_node(node, by_id, release):
    out = {'kind': node['kind'].lower(), 'id': node['id'], 'label': node['label']}
    meta = dict(node['meta'])
    meta.setdefault('status', 'draft')
    out.update(meta)
    lines = []
    for l in node['lines']:
        if l['type'] == 'NOTE' or (release and l['type'] in INTERNAL):
            continue
        item = {'type': l['type'], 'text': l['text'], 'status': l['status']}
        if l['speaker']:
            item['speaker'] = l['speaker']
        lines.append(item)
    if lines:
        out['copy'] = lines
    kids = [compile_node(c, by_id, release) for c in node['children']
            if not (release and not visible(c, by_id))]
    if kids:
        key = {'Chapter': 'stories', 'Arc': 'stories', 'Story': 'scenes', 'Scene': 'panels', 'Panel': 'items'}[node['kind']]
        out[key] = kids
    return out


def build_output(res, by_id, release):
    def order_key(c):
        try:
            return int(c['meta'].get('order', 999))
        except ValueError:
            return 999
    chapters = []
    for c in sorted(res['chapters'], key=order_key):
        if release and c['meta'].get('status') == 'hold':
            continue
        node = compile_node(c, by_id, release)
        node['route'] = f'/story/chapter/{c["id"]}'
        chapters.append(node)
    arcs = []
    for a in res['arcs']:
        if release and a['meta'].get('status') == 'hold':
            continue
        node = compile_node(a, by_id, release)
        node['route'] = f'/story/arc/{a["id"]}'
        letter = res['letters'].get(a['id'])
        if letter:
            ok = letter['meta'].get('status') in ('approved', 'published')
            node['letter'] = {'slug': letter['slug'], 'name': letter['meta'].get('name'),
                              'title': letter['meta'].get('title'), 'status': letter['meta'].get('status'),
                              'text': letter['text'] if ok else None}
        arcs.append(node)
    return {
        '_generated': 'by scripts/story/build.py from docs/STORY-SCRIPT.md — do not edit by hand',
        'mode': 'release' if release else 'dev',
        'chapters': chapters,
        'arcs': arcs,
    }


def dump(obj):
    return json.dumps(obj, ensure_ascii=False, indent=2) + '\n'


def todo(roots, by_id):
    rows = []
    for root in roots:
        for node in walk(root):
            for l in node['lines']:
                if l['status'] == 'edit' or EDIT_RE.search(l['text']):
                    rows.append((l['line'], root['id'], node['id'], l['type'], l['text']))
    for n, root, nid, t, text in rows:
        print(f'  line {n:>4}  {root:<22} {nid:<16} {t:<6} {text}')
    print(f'\n{len(rows)} item(s) to edit')


def sync_manifest(manifest, art_refs, by_id):
    assets = manifest.setdefault('assets', {})
    added = 0
    for art, ids in sorted(art_refs.items()):
        if art in assets:
            assets[art]['scene_ids'] = sorted(set(assets[art].get('scene_ids', [])) | set(ids))
            continue
        node = by_id[ids[0]]
        visual = ' '.join(l['text'] for l in node['lines'] if l['type'] == 'VISUAL')
        assets[art] = {
            'scene_ids': ids,
            'kind': 'image',
            'description': visual,
            'character_age': None,
            'status': 'pending',
            'rights': 'not_reviewed',
            'subjects': [],
            'references': [],
            'model': None,
            'prompt': None,
            'cost': None,
            'hosting': 'repo',
            'variants': {'desktop': {'crop': None, 'full': None}, 'mobile': {'crop': None, 'full': None}},
            'motion': None,
        }
        added += 1
    manifest['assets'] = dict(sorted(assets.items()))
    return added


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('--release', action='store_true')
    ap.add_argument('--check', action='store_true')
    ap.add_argument('--todo', action='store_true')
    ap.add_argument('--sync-manifest', action='store_true')
    ap.add_argument('--quiet', action='store_true', help='hide warnings')
    a = ap.parse_args()

    rep = Report()
    manifest = load_json(MANIFEST, {'version': 1, 'assets': {}})
    roots, by_id = parse_script(SCRIPT, rep)
    if a.todo:
        todo(roots, by_id)
        return 0
    data = load_data()
    res = validate(roots, by_id, manifest, data, a.release, rep)

    if a.sync_manifest:
        added = sync_manifest(manifest, res['art_refs'], by_id)
        os.makedirs(os.path.dirname(MANIFEST), exist_ok=True)
        open(MANIFEST, 'w', encoding='utf-8').write(dump(manifest))
        print(f'manifest: {added} new art ID(s) added, {len(manifest["assets"])} total')
        rep = Report()  # re-validate against the updated manifest
        roots, by_id = parse_script(SCRIPT, rep)
        res = validate(roots, by_id, manifest, data, a.release, rep)

    if not a.quiet:
        for w in rep.warnings:
            print(f'warning  {w}')
    for e in rep.errors:
        print(f'ERROR    {e}')

    out = dump(build_output(res, by_id, a.release))
    if a.check:
        current = open(OUT, encoding='utf-8').read() if os.path.exists(OUT) else ''
        if current != out:
            print('ERROR    src/story/story.json is out of date — run python3 scripts/story/build.py')
            return 1
    elif not rep.errors:
        os.makedirs(os.path.dirname(OUT), exist_ok=True)
        open(OUT, 'w', encoding='utf-8').write(out)

    print(f'\n{len(res["chapters"])} chapters · {len(res["arcs"])} arcs · '
          f'{res["main_path_panels"]} main-path panels · {len(res["art_refs"])} art IDs · '
          f'{len(rep.errors)} error(s) · {len(rep.warnings)} warning(s)'
          + ('' if rep.errors or a.check else f'\nwrote {os.path.relpath(OUT, ROOT)}'))
    return 1 if rep.errors else 0


if __name__ == '__main__':
    sys.exit(main())
