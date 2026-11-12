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
    'text': 3, 'cap': 3, 'list': 3, 'nav': 4, 'watch': 2, 'ducky': 3, 'crop': 4, 'label': 2, 'paper': 4, 'tree': 3,
}
CAP_TYPES = {'NAR', 'THO', 'DIA', 'FAC', 'SFX', 'SUB', 'PORTAL', 'SKL', 'MODAL'}
POSES = {'stand', 'walk', 'sit', 'type', 'slump', 'point', 'present', 'hold', 'fold', 'bust',
         'silhouette', 'back', 'bench', 'lean'}
FLAGS = {'red', 'dash', 'fill', 'ivory', 'ink', 'center', 'l', 'r', 'f', 'teen', 'young', 'adult', 'old',
         'faint', 'bold'}
REFS_MD = os.path.join(ROOT, 'docs', 'story', 'REFERENCES.md')
WATCHES_MD = os.path.join(ROOT, 'docs', 'story', 'WATCHES.md')
WATCH_IDS = set()
MANIFEST = os.path.join(ROOT, 'public', 'story', 'manifest.json')
# Layer model (docs/story/STORYBOARDS.md): what a generated plate must contain vs what code draws.
GUIDE_ELS = {'crop', 'label', 'vp'}                 # storyboard annotations, never shipped
OVERLAY_ELS = {'cap', 'text', 'card', 'chart', 'list', 'nav', 'watch', 'ducky'}      # always drawn in code (HTML/CSS/SVG)
REF_KINDS = {'character', 'person', 'location', 'prop', 'evidence', 'style'}
FLAGS.update({'code', 'detail', 'real', 'wide', 'vertical'})
SKETCH_JS = os.path.join(ROOT, 'src', 'modes', 'story', 'sketch.js')
STORY_BOARDS_JSON = os.path.join(ROOT, 'src', 'story', 'storyboards.json')
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


def layer_of(tok):
    k = tok[0]
    if k in GUIDE_ELS or (k == 'arrow' and 'code' not in tok):
        return 'guide'
    if k in OVERLAY_ELS or 'code' in tok:
        return 'overlay'
    if 'real' in tok:
        return 'evidence'
    return 'art'


def nums_of(tok):
    return [float(t) for t in tok[1:] if NUM_RE.match(t)]


def caption_height(kind, text, w_pct, H):
    """Rough rendered height (% of frame height) of a caption box w_pct wide. Mirrors the viewer."""
    if kind == 'SFX':
        return 64 / H * 100
    cw, lh, extra = {'FAC': (9.6, 21.6, 24), 'SKL': (9.0, 19.5, 22)}.get(kind, (9.9, 26.4, 26))
    usable = max(40, w_pct * 10 - 34)
    chars = max(1, int(usable / cw))
    words, lines, cur = (text + (' →' if kind == 'PORTAL' else '')).split(), 1, 0
    for wd in words:
        add = len(wd) + (1 if cur else 0)
        if cur + add > chars:
            lines, cur = lines + 1, len(wd)
        else:
            cur += add
    return (lines * lh + extra) / H * 100


def check_frame(nid, where, fr, node, rep):
    aw, ah = (float(x) for x in fr['aspect'].split(':'))
    H = 1000 * ah / aw
    def out(msg):
        rep.err(where, f'{nid} [{fr["aspect"]}{" " + fr["label"] if fr["label"] else ""}]: {msg} — keep every element inside the panel frame')
    inside = lambda v: -0.01 <= v <= 100.01
    caps = []
    for tok in fr['els']:
        k, n = tok[0], nums_of(tok)
        if k in ('box', 'screen', 'chart', 'card', 'building', 'paper', 'wash', 'dark', 'crop', 'nav'):
            x, y, w, h = n[:4]
            if x < 0 or y < 0 or x + w > 100.01 or y + h > 100.01:
                out(f'{k} at {x:g},{y:g} size {w:g}×{h:g} crosses the edge')
        elif k in ('line', 'arrow'):
            if not all(inside(v) for v in n[:4]):
                out(f'{k} endpoint outside 0–100')
        elif k in ('floor',):
            if not inside(n[0]):
                out('floor outside the frame')
        elif k == 'vp':
            if not (inside(n[0]) and inside(n[1])):
                out('vanishing point outside the frame')
        elif k == 'fig':
            x, y, h = n[:3]
            top = y - h * (0.83 if ('bust' in tok or 'silhouette' in tok) else 1)
            if not inside(x) or y > 100.01 or top < -0.01:
                out(f'figure at {x:g},{y:g} height {h:g} is cut off')
        elif k == 'disc':
            x, y, r = n[:3]
            ry = r * 1000 / H
            if x - r < 0 or x + r > 100.01 or y - ry < -0.01 or y + ry > 100.01:
                out(f'disc at {x:g},{y:g} r {r:g} crosses the edge')
        elif k == 'phone':
            x, y = n[:2]
            if x < 0 or y < 0 or x + 2.6 > 100 or y + 4800 / H > 100:
                out('phone crosses the edge')
        elif k == 'tree':
            x, y, h = n[:3]
            if x - h * 0.3 * H / 1000 < 0 or x + h * 0.3 * H / 1000 > 100 or y - h < 0 or y > 100.01:
                out('tree crosses the edge')
        elif k in ('text', 'label'):
            x, y = n[:2]
            label = next((t for t in tok[1:] if not NUM_RE.match(t) and t not in FLAGS), '')
            size = n[2] if k == 'text' else 2.5 * 1000 / H
            width = len(label) * size * H / 1000 * (0.47 if k == 'text' else 0.45) * (2.1 if 'wide' in tok else 1)
            left = x - width / 2 if 'center' in tok else x
            if left < -0.5 or left + width > 100.5 or not inside(y):
                out(f'{k} "{label}" runs past the edge (≈{width:.0f}% wide)')
        elif k == 'watch':
            x, y = n[:2]
            if not (inside(x) and inside(y)):
                out('watch hotspot outside the frame')
            wid = next((t for t in tok[1:] if not NUM_RE.match(t)), None)
            if wid not in WATCH_IDS:
                rep.err(where, f'{nid}: watch {wid!r} is not in docs/story/WATCHES.md')
        elif k == 'ducky':
            x, y, h = n[:3]
            show = next((float(t[5:]) for t in tok if t.startswith('show=')), 1.0)
            half = h * 0.45 * H / 1000
            if x - half < -0.01 or x + half > 100.01 or y > 100.01 or y - h * show < -0.01:
                out(f'Ducky at {x:g},{y:g} crosses the edge')
        elif k == 'list':
            x, y, w = n[:3]
            strs = [t for t in tok[1:] if not NUM_RE.match(t) and t not in FLAGS]
            items = strs[-1].split('|') if strs else []
            h = (len(items) * 40 + (40 if len(strs) > 1 and strs[0] else 0)) / H * 100
            if x < 0 or x + w > 100.01 or y < 0 or y + h > 100.5:
                out(f'list at {x:g},{y:g} ({len(items)} items) crosses the edge')
        elif k == 'cap':
            x, y, w = n[:3]
            idx = int(n[3]) if len(n) > 3 else 1
            pool = [l for n2 in [node] + node['children'] for l in n2['lines'] if l['type'] == tok[1]]
            text = pool[idx - 1]['text'] if len(pool) >= idx else '(no line)'
            if tok[1] == 'MODAL' and len(pool) >= idx:
                text = pool[idx - 1]['speaker'] or 'Open list'
            if x < -4 or y < -4 or x + w > 104.01:
                out(f'caption {tok[1]} at {x:g},{y:g} width {w:g} hangs more than 4% past the edge')
            else:
                h = caption_height(tok[1], text, w * 1000 / 1000, H)
                for (cx, cy, cw, ch, ck) in caps:
                    if x < cx + cw and cx < x + w and y < cy + ch and cy < y + h:
                        rep.warn(where, f'{nid} [{fr["aspect"]}]: caption {tok[1]} may overlap caption {ck}')
                caps.append((x, y, w, h, tok[1]))
                if y + h > 100.5:
                    rep.warn(where, f'{nid} [{fr["aspect"]}]: caption {tok[1]} is about {h:.0f}% tall and may reach past the bottom '
                             f'(starts at {y:g}%) — the viewer and the Story nudge it inside, but move it up for a clean layout')


def plate_of(board):
    if not board:
        return None
    layers = {layer_of(t) for v in board['variants'] for f in v['frames'] for t in f['els']}
    if 'art' in layers:
        return 'generate'
    return 'evidence' if 'evidence' in layers else 'code'


def parse_refs(by_id, scene_ids, rep):
    if not os.path.exists(REFS_MD):
        return [], set()
    refs, cur, none_scenes, section = [], None, set(), None
    for n, raw in enumerate(open(REFS_MD, encoding='utf-8').read().split('\n'), 1):
        line = raw.strip()
        where = f'docs/story/REFERENCES.md:{n}'
        m = re.match(r'^##\s+(REF-[A-Z0-9-]+)\s+·\s+(.+)$', line)
        if m:
            cur = {'id': m.group(1), 'name': m.group(2), 'scenes': [], 'line': n, 'section': section}
            refs.append(cur)
            continue
        m = re.match(r'^#\s+(.+)$', line)
        if m:
            section, cur = m.group(1), None
            continue
        if line.lower().startswith('no reference needed:'):
            none_scenes |= {x.strip(' `') for x in line.split(':', 1)[1].split(',') if x.strip(' `')}
            continue
        if cur is None or ':' not in line or line.startswith(('>', '|')):
            continue
        k, v = (x.strip() for x in line.lstrip('- ').split(':', 1))
        k = k.lower()
        if k == 'scenes':
            cur['scenes'] = [x.strip(' `') for x in v.split(',') if x.strip(' `')]
            for sid in cur['scenes']:
                if sid not in scene_ids:
                    rep.err(where, f'{cur["id"]}: scene {sid} is not in the script')
        elif k == 'links':
            cur['links'] = [dict(zip(('t', 'u'), (m.group(1), m.group(2)))) for m in re.finditer(r'\[([^\]]+)\]\((https?://[^)\s]+)\)', v)]
        elif k in ('kind', 'source', 'status', 'privacy', 'notes', 'priority'):
            cur[k] = v
            if k == 'kind' and v not in REF_KINDS:
                rep.err(where, f'{cur["id"]}: kind must be one of {sorted(REF_KINDS)}')
    for sid in none_scenes:
        if sid not in scene_ids:
            rep.err('docs/story/REFERENCES.md', f'"No reference needed" lists unknown scene {sid}')
    return refs, none_scenes


def parse_watches():
    out = []
    if not os.path.exists(WATCHES_MD):
        return out
    cur = None
    for line in open(WATCHES_MD, encoding='utf-8').read().split('\n'):
        m = re.match(r'^##\s+Watch\s+([a-z0-9-]+)\s+·\s+(.+)$', line.strip())
        if m:
            cur = {'id': m.group(1), 'name': m.group(2)}
            out.append(cur)
            continue
        m = re.match(r'^-\s+(era|look|comment|last):\s*(.*)$', line.strip())
        if cur and m:
            cur[m.group(1)] = m.group(2)
    return out


def run(roots, by_id, rep, write=True):
    watches = parse_watches()
    WATCH_IDS.clear()
    WATCH_IDS.update(w['id'] for w in watches)
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
                check_frame(nid, f'{b["file"]}:{b["line"]}', fr, node, rep)
    scene_ids = {n['id'] for r in roots for n in walk(r) if n['kind'] == 'Scene'}
    refs, none_scenes = parse_refs(by_id, scene_ids, rep)
    groups = []
    counts = {}
    for root in roots:
        scenes = []
        for scene in (n for n in walk(root) if n['kind'] == 'Scene'):
            st = scene_status(scene, boards, rep)
            counts[st] = counts.get(st, 0) + 1
            scenes.append({'node': scene, 'status': st, 'hash': scene_hash(scene, boards)})
            if st in ('drafted', 'approved', 'revise') and scene['id'] not in none_scenes \
                    and not any(scene['id'] in r['scenes'] for r in refs) and refs:
                rep.warn(f'Scene {scene["id"]}', 'storyboarded but not listed in docs/story/REFERENCES.md')
        groups.append({'root': root, 'scenes': scenes})
    if write:
        write_status(groups, counts)
        write_viewer(groups, boards, refs, none_scenes, watches)
        sync_plates(by_id, boards)
        write_overlay_index(groups, boards)
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


OVERLAY_INDEX = os.path.join(ROOT, 'docs', 'story', 'OVERLAY-INDEX.md')
TYPE_NAME = {'NAR': 'Narration', 'DIA': 'Dialogue', 'THO': 'Thought', 'FAC': 'Fact box', 'SKL': 'Skill chips', 'SFX': 'Sound effect',
             'SUB': 'Card subtitle', 'PORTAL': 'Button → side story', 'MODAL': 'Button → pop-up list'}


def write_overlay_index(groups, boards):
    out = ['# Overlay index', '',
           '> Generated by `scripts/story/build.py` — do not edit. Edit overlays in `docs/STORY-SCRIPT.md`',
           '> (how: `docs/story/OVERLAYS.md`). "On the art" = the storyboard gives it a position on desktop;',
           '> "Under the panel" = it sits in the row beneath. On phones everything stacks under the frame.', '']
    for g in groups:
        r = g['root']
        out += [f'## {"Chapter" if r["kind"] == "Chapter" else "Arc"} `{r["id"]}` · {r["meta"].get("title") or r["label"]}', '',
                '| Panel | Type | Who / target | Text | Desktop position | Status |', '|---|---|---|---|---|---|']
        for sc in g['scenes']:
            for p in sc['node']['children']:
                for node in [p] + p['children']:
                    b = boards.get(node['id'])
                    placed = set()
                    if b and b['variants']:
                        for fr in b['variants'][0]['frames']:
                            for t in fr['els']:
                                if t[0] == 'cap':
                                    n = [x for x in t[2:] if NUM_RE.match(x)]
                                    placed.add((t[1], int(float(n[3])) if len(n) > 3 else 1))
                    count = {}
                    for l in node['lines']:
                        if l['type'] not in TYPE_NAME:
                            continue
                        count[l['type']] = count.get(l['type'], 0) + 1
                        who = l['speaker'] or (node['meta'].get('arc') if l['type'] == 'PORTAL' else '') or ''
                        where = 'On the art' if (l['type'], count[l['type']]) in placed else ('On the card' if node['kind'] == 'Item' else 'Under the panel')
                        text = l['text'].replace('|', '\\|')
                        out.append(f'| `{node["id"]}` | {TYPE_NAME[l["type"]]} | {who} | {text} | {where} | {l["status"]} |')
        out.append('')
    open(OVERLAY_INDEX, 'w', encoding='utf-8').write('\n'.join(out))


def sync_plates(by_id, boards):
    """Record in the manifest whether each art ID needs a generated plate or is drawn in code."""
    if not os.path.exists(MANIFEST):
        return
    man = json.load(open(MANIFEST, encoding='utf-8'))
    changed = False
    for nid, b in boards.items():
        node = by_id.get(nid)
        art = node and node['meta'].get('art')
        entry = art and man.get('assets', {}).get(art)
        if entry is not None and entry.get('plate') != plate_of(b):
            entry['plate'] = plate_of(b)
            changed = True
    if changed:
        open(MANIFEST, 'w', encoding='utf-8').write(json.dumps(man, ensure_ascii=False, indent=2) + '\n')


def copy_lines(node):
    return [{'t': l['type'], 's': l['speaker'], 'x': l['text'], 'st': l['status']}
            for l in node['lines'] if l['type'] != 'NOTE']


def notes(node):
    return [l['text'] for l in node['lines'] if l['type'] == 'NOTE']


def panel_json(p, boards):
    b = boards.get(p['id'])
    out = {'id': p['id'], 'label': p['label'], 'type': p['meta'].get('type'), 'art': p['meta'].get('art'),
           'gallery': p['meta'].get('gallery'), 'photo': p['meta'].get('photo'),
           'status': p['meta'].get('status', 'draft'), 'portal': p['meta'].get('portal'),
           'copy': copy_lines(p), 'notes': notes(p)}
    if p['kind'] == 'Item':
        out['title'] = p['meta'].get('title')
        out['skills'] = p['meta'].get('skills')
        out['arc'] = p['meta'].get('arc')
    if b:
        out['plate'] = plate_of(b)
        out['board'] = {k: b[k] for k in ('shot', 'camera', 'scroll', 'transition', 'mobile', 'tags', 'refs',
                                          'note', 'variants') if k in b}
    kids = [panel_json(i, boards) for i in p['children']]
    if kids:
        out['items'] = kids
    return out


def write_viewer(groups, boards, refs=(), none_scenes=(), watches=()):
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
    payload = {'groups': data, 'refs': [{k: r.get(k) for k in ('id', 'name', 'kind', 'source', 'status', 'privacy',
                                                                  'priority', 'notes', 'scenes', 'section', 'links')} for r in refs],
               'noRefScenes': sorted(none_scenes),
               'watches': [w for w in watches if '[EDIT' not in w.get('comment', '[EDIT')]}
    blob = json.dumps(payload, ensure_ascii=False, separators=(',', ':')).replace('</', '<\\/')
    open(VIEWER_OUT, 'w', encoding='utf-8').write(tpl.replace('/*__STORY_DATA__*/null', blob))
    # The website's Story mode reads the same data and shares the sketch renderer with the viewer.
    open(STORY_BOARDS_JSON, 'w', encoding='utf-8').write(json.dumps(payload, ensure_ascii=False, separators=(',', ':')) + '\n')
    a, b = tpl.index('// ---- sketch renderer'), tpl.index('// ---- views')
    os.makedirs(os.path.dirname(SKETCH_JS), exist_ok=True)
    open(SKETCH_JS, 'w', encoding='utf-8').write(
        '// GENERATED by scripts/story/build.py from docs/story/viewer/template.html — do not edit.\n'
        '// Draws storyboard frames as pencil sketches (placeholders until final art exists).\n'
        "const esc = (s) => String(s ?? '').replace(/[&<>\"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '\"': '&quot;', \"'\": '&#39;' }[c]));\n"
        'const markEdits = esc;\n' + tpl[a:b] + '\nexport { renderFrame, fitFrame, layerOf, lineFor, duckySVG, zoneOf };\n')
