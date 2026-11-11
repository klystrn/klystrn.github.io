"""Storyboards for Story mode: parse docs/story/storyboards/*.md, work out each scene's
storyboard status, and write docs/story/STORYBOARD-STATUS.md plus the storyboard viewer
(docs/story/viewer/index.html). Imported by build.py. Format: docs/story/STORYBOARDS.md.
"""
import glob
import hashlib
import json
import os
import re
import shlex

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
BOARDS = os.path.join(ROOT, 'docs', 'story', 'storyboards')
STATUS_MD = os.path.join(ROOT, 'docs', 'story', 'STORYBOARD-STATUS.md')
VIEWER_TPL = os.path.join(ROOT, 'docs', 'story', 'viewer', 'template.html')
VIEWER_OUT = os.path.join(ROOT, 'docs', 'story', 'viewer', 'index.html')

BOARD_STATUS = {'approved', 'revise'}
TAGS = {'PLACEHOLDER', 'REAL EVIDENCE', 'GENERATE LATER', 'NEEDS PERMISSION'}
FIELDS = {'shot', 'camera', 'scroll', 'transition', 'mobile', 'tags', 'refs', 'note'}
# element keyword -> minimum number of numeric args
ELEMENTS = {
    'floor': 1, 'vp': 2, 'box': 4, 'screen': 4, 'chart': 4, 'card': 4, 'building': 4,
    'fig': 3, 'phone': 2, 'disc': 3, 'arrow': 4, 'line': 4, 'wash': 4, 'dark': 4,
    'text': 3, 'cap': 3, 'crop': 4, 'label': 2, 'paper': 4, 'tree': 3,
}
CAP_TYPES = {'NAR', 'THO', 'DIA', 'FAC', 'SFX', 'SUB', 'PORTAL', 'SKL'}
POSES = {'stand', 'walk', 'sit', 'type', 'slump', 'point', 'present', 'hold', 'fold', 'bust',
         'silhouette', 'back', 'bench', 'lean'}
FLAGS = {'red', 'dash', 'fill', 'ivory', 'ink', 'center', 'l', 'r', 'f', 'teen', 'young', 'adult', 'old',
         'faint', 'bold'}
ASPECT_RE = re.compile(r'^\d+(?:\.\d+)?:\d+(?:\.\d+)?$')
HEAD_RE = re.compile(r'^##\s+(Panel|Item)\s+(\S+)\s*$')
NUM_RE = re.compile(r'^-?\d+(?:\.\d+)?$')


def parse_boards(rep):
    boards = {}
    for path in sorted(glob.glob(os.path.join(BOARDS, '*.md'))):
        rel = os.path.relpath(path, ROOT)
        cur = frame = variant = None
        for n, raw in enumerate(open(path, encoding='utf-8').read().split('\n'), 1):
            where = f'{rel}:{n}'
            line = raw.strip()
            if not line or line.startswith(('#', '>')) and not HEAD_RE.match(line):
                continue
            m = HEAD_RE.match(line)
            if m:
                kind, nid = m.groups()
                if nid in boards:
                    rep.err(where, f'storyboard for {nid} is defined twice')
                cur = boards[nid] = {'kind': kind, 'id': nid, 'file': rel, 'line': n, 'variants': []}
                frame = variant = None
                continue
            if cur is None:
                continue
            key, _, val = line.partition(':')
            if key in FIELDS and _ and not line.startswith(('frame', 'variant')):
                val = val.strip()
                if key == 'tags':
                    tags = [t.strip() for t in re.split(r',\s*(?![^()]*\))', val) if t.strip()]
                    for t in tags:
                        if t.split(' (')[0] not in TAGS:
                            rep.err(where, f'unknown tag {t!r} (use {", ".join(sorted(TAGS))})')
                    cur['tags'] = tags
                else:
                    cur.setdefault(key, [])
                    cur[key].append(val)
                continue
            try:
                tok = shlex.split(line)
            except ValueError as e:
                rep.err(where, f'cannot read line: {e}')
                continue
            word = tok[0]
            if word == 'variant':
                variant = {'label': ' '.join(tok[1:]), 'frames': []}
                cur['variants'].append(variant)
                frame = None
                continue
            if word == 'frame':
                if len(tok) < 2 or not ASPECT_RE.match(tok[1]):
                    rep.err(where, 'frame needs an aspect like 16:9')
                    continue
                if variant is None:
                    variant = {'label': '', 'frames': []}
                    cur['variants'].append(variant)
                frame = {'aspect': tok[1], 'label': ' '.join(tok[2:]), 'els': []}
                variant['frames'].append(frame)
                continue
            if word not in ELEMENTS:
                rep.err(where, f'unknown element {word!r}')
                continue
            if frame is None:
                rep.err(where, f'{word} must come after a frame line')
                continue
            nums = [t for t in tok[1:] if NUM_RE.match(t)]
            if len(nums) < ELEMENTS[word]:
                rep.err(where, f'{word} needs at least {ELEMENTS[word]} numbers')
                continue
            if word == 'cap' and (len(tok) < 2 or tok[1] not in CAP_TYPES):
                rep.err(where, f'cap needs a type: {", ".join(sorted(CAP_TYPES))}')
                continue
            if word == 'fig':
                poses = [t for t in tok[1:] if t in POSES]
                if not poses:
                    rep.err(where, f'fig needs a pose: {", ".join(sorted(POSES))}')
                    continue
            frame['els'].append(tok)
    return boards


def scene_hash(scene, boards):
    parts = []
    for p in scene['children']:
        parts.append([p['id'], [(l['type'], l['text']) for l in p['lines']], boards.get(p['id'])])
        for i in p['children']:
            parts.append([i['id'], [(l['type'], l['text']) for l in i['lines']], boards.get(i['id'])])
    return hashlib.sha1(json.dumps(parts, sort_keys=True, default=str).encode()).hexdigest()[:10]


def has_gaps(scene):
    for p in scene['children']:
        for node in [p] + p['children']:
            for l in node['lines']:
                if l['status'] == 'edit' or '[EDIT:' in l['text']:
                    return True
    return False


def scene_status(scene, boards, rep):
    panels = scene['children']
    boarded = [p for p in panels if p['id'] in boards]
    review = scene['meta'].get('storyboard')
    if review and review not in BOARD_STATUS:
        rep.err(f'Scene {scene["id"]}', f'storyboard: must be approved or revise (got {review!r})')
    if review == 'approved' and len(boarded) < len(panels):
        rep.warn(f'Scene {scene["id"]}', 'marked storyboard: approved but not every panel has a storyboard')
    if review in BOARD_STATUS:
        return review
    if panels and len(boarded) == len(panels):
        return 'drafted'
    if boarded:
        return 'partial'
    return 'waiting' if has_gaps(scene) else 'not-started'


def walk(node):
    yield node
    for c in node['children']:
        yield from walk(c)


def run(roots, by_id, rep, write=True):
    boards = parse_boards(rep)
    for nid, b in boards.items():
        node = by_id.get(nid)
        if not node or node['kind'] != b['kind']:
            rep.err(f'{b["file"]}:{b["line"]}', f'{b["kind"]} {nid} is not in the script')
            continue
        for v in b['variants']:
            for fr in v['frames']:
                for el in fr['els']:
                    if el[0] != 'cap':
                        continue
                    nums = [t for t in el[2:] if NUM_RE.match(t)]
                    idx = int(float(nums[3])) if len(nums) > 3 else 1
                    have = sum(1 for n2 in [node] + node['children'] for l in n2['lines'] if l['type'] == el[1])
                    if have < idx:
                        rep.warn(f'{b["file"]}:{b["line"]}', f'{nid}: caption {el[1]} #{idx} has no matching line in the script')
    groups = []
    counts = {}
    for root in roots:
        scenes = []
        for scene in (n for n in walk(root) if n['kind'] == 'Scene'):
            st = scene_status(scene, boards, rep)
            counts[st] = counts.get(st, 0) + 1
            scenes.append({'node': scene, 'status': st, 'hash': scene_hash(scene, boards)})
        groups.append({'root': root, 'scenes': scenes})
    if write:
        write_status(groups, counts)
        write_viewer(groups, boards)
    return counts


LABEL = {'approved': 'Approved', 'revise': 'Changes requested', 'drafted': 'Drafted — awaiting your review',
         'partial': 'Partly drafted', 'waiting': 'Waiting on script edits', 'not-started': 'Not started'}


def write_status(groups, counts):
    out = ['# Storyboard status', '',
           '> Generated by `scripts/story/build.py` from `docs/STORY-SCRIPT.md` and',
           '> `docs/story/storyboards/`. Do not edit by hand. To approve a scene, add',
           '> `storyboard: approved` (or `revise`) to its `story` block in the script, or use the',
           '> buttons in the storyboard viewer and ask Claude to sync them.', '',
           '| Status | Scenes |', '|---|---|']
    for k in ('approved', 'revise', 'drafted', 'partial', 'waiting', 'not-started'):
        out.append(f'| {LABEL[k]} | {counts.get(k, 0)} |')
    out.append('')
    for g in groups:
        r = g['root']
        title = r['meta'].get('title') or r['label']
        kind = 'Chapter' if r['kind'] == 'Chapter' else 'Arc'
        out += [f'## {kind} `{r["id"]}` · {title}', '', '| Scene | | Panels | Storyboard |', '|---|---|---|---|']
        for s in g['scenes']:
            n = s['node']
            out.append(f'| `{n["id"]}` | {n["label"]} | {len(n["children"])} | {LABEL[s["status"]]} |')
        out.append('')
    open(STATUS_MD, 'w', encoding='utf-8').write('\n'.join(out))


def copy_lines(node):
    return [{'t': l['type'], 's': l['speaker'], 'x': l['text'], 'st': l['status']}
            for l in node['lines'] if l['type'] != 'NOTE']


def notes(node):
    return [l['text'] for l in node['lines'] if l['type'] == 'NOTE']


def panel_json(p, boards):
    b = boards.get(p['id'])
    out = {'id': p['id'], 'label': p['label'], 'type': p['meta'].get('type'), 'art': p['meta'].get('art'),
           'status': p['meta'].get('status', 'draft'), 'portal': p['meta'].get('portal'),
           'copy': copy_lines(p), 'notes': notes(p)}
    if p['kind'] == 'Item':
        out['title'] = p['meta'].get('title')
        out['arc'] = p['meta'].get('arc')
    if b:
        out['board'] = {k: b[k] for k in ('shot', 'camera', 'scroll', 'transition', 'mobile', 'tags', 'refs',
                                          'note', 'variants') if k in b}
    kids = [panel_json(i, boards) for i in p['children']]
    if kids:
        out['items'] = kids
    return out


def write_viewer(groups, boards):
    data = []
    for g in groups:
        r = g['root']
        data.append({
            'kind': r['kind'].lower(), 'id': r['id'], 'title': r['meta'].get('title') or r['label'],
            'years': r['meta'].get('years'), 'category': r['meta'].get('category'),
            'order': r['meta'].get('order'), 'parent': r['meta'].get('parent'),
            'arcKind': r['meta'].get('kind') if r['kind'] == 'Arc' else None,
            'status': r['meta'].get('status', 'draft'),
            'scenes': [{'id': s['node']['id'], 'label': s['node']['label'], 'status': s['status'],
                        'hash': s['hash'], 'panels': [panel_json(p, boards) for p in s['node']['children']]}
                       for s in g['scenes']],
        })
    if not os.path.exists(VIEWER_TPL):
        return
    tpl = open(VIEWER_TPL, encoding='utf-8').read()
    blob = json.dumps(data, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    open(VIEWER_OUT, 'w', encoding='utf-8').write(tpl.replace('/*__STORY_DATA__*/null', blob))
