"""Find what changed in the edited Google Doc compared with the repo's current src/data.

Usage:
  python scripts/content-doc/diff.py <export> [--data src/data] [--json]

<export> is the Doc as text: the saved result of Drive read_file_content (the JSON
wrapper {fileContent, ...} or its bare markdown), or a .md / .txt / .html download.

How it works: render.py rebuilds the doc from the CURRENT JSON (the baseline), both
documents are flattened to the same normalised line model (headings, "JSON:" prefix
lines, paragraphs, table rows), and difflib reports the edits. Each change carries its
context (mode › section › block), the JSON path when the row has a [field] label, and
the old/new text. Whitespace-only edits and Google's export quirks are ignored.
"""
import argparse, difflib, html, json, os, re, sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from render import render_html  # noqa: E402


def norm(s):
    s = html.unescape(s)
    s = re.sub(r'\\(.)', r'\1', s)          # markdown escapes  \[  \<  \|
    s = s.replace('**', '').replace('*', '') if '↺' not in s else s.replace('*', '')
    return re.sub(r'\s+', ' ', s).strip()


def split_md_row(line):
    cells, cur, i = [], '', 0
    body = line.strip()[1:-1] if line.strip().endswith('|') else line.strip()[1:]
    while i < len(body):
        if body[i] == '\\' and i + 1 < len(body):
            cur += body[i:i + 2]; i += 2; continue
        if body[i] == '|':
            cells.append(cur); cur = ''; i += 1; continue
        cur += body[i]; i += 1
    cells.append(cur)
    return [norm(c) for c in cells]


def lines_from_md(text):
    out = []
    for raw in text.split('\n'):
        l = raw.rstrip()
        if not l.strip():
            continue
        if l.lstrip().startswith('|'):
            cells = split_md_row(l)
            if all(c == '' for c in cells) or all(re.fullmatch(r':?-+:?', c) for c in cells):
                continue  # Google's empty header row and the |:-|:-| separator
            out.append(('row', tuple(cells)))
        elif l.startswith('#'):
            lvl = len(l) - len(l.lstrip('#'))
            out.append((f'h{lvl}', norm(l.lstrip('#'))))
        elif re.match(r'\s*[-*] ', l):
            out.append(('li', norm(re.sub(r'^\s*[-*] ', '', l))))
        else:
            out.append(('p', norm(l)))
    return out


def lines_from_html(h):
    out = []
    for m in re.finditer(r'<(h[123]|p|li|tr)\b[^>]*>(.*?)</\1>', h, re.S):
        tag, inner = m.group(1), m.group(2)
        if tag == 'tr':
            cells = re.findall(r'<td>(.*?)</td>', inner, re.S)
            out.append(('row', tuple(norm(re.sub(r'<[^>]+>', '', c)) for c in cells)))
        else:
            out.append((tag, norm(re.sub(r'<[^>]+>', '', inner))))
    return out


def load_export(path):
    text = open(path, encoding='utf-8').read()
    if text.lstrip().startswith('{'):
        try:
            text = json.loads(text)['fileContent']
        except Exception:
            pass
    if '<table' in text.lower():
        return lines_from_html(text)
    return lines_from_md(text)


def annotate(lines):
    """Attach context + JSON path to every line."""
    ctx = {'h1': '', 'h2': '', 'h3': '', 'block': '', 'json': '', 'json_pending': False}
    res = []
    for kind, val in lines:
        if kind in ('h1', 'h2', 'h3'):
            ctx[kind] = val
            if kind == 'h1': ctx['h2'] = ctx['h3'] = ctx['block'] = ''
            if kind == 'h2': ctx['h3'] = ctx['block'] = ''
            if kind == 'h3': ctx['block'] = ''
            ctx['json'] = ''
        elif kind == 'p' and val.startswith('JSON: '):
            ctx['json'] = val[6:]
        elif kind == 'p' and re.match(r'^[^.]{1,80} \$[A-Z0-9]+$|^\$[A-Z0-9]+ · ', val):
            ctx['block'] = val; ctx['json'] = ''
        elif kind == 'row' and val and val[0] in ('Field',):
            pass
        where = ' › '.join(x for x in (ctx['h1'], ctx['h2'], ctx['h3'], ctx['block']) if x)
        path = ''
        if kind == 'row':
            m = re.search(r'\[(.+)\]$', val[0])
            if m:
                leaf = m.group(1)
                if leaf.startswith('in code'):
                    path = leaf
                elif ctx['json'] and not re.match(r'^(identity|headers|experience|projects|skills|testimonials|timeline|education|life|awards|certs|feed) ›', leaf):
                    path = f"{ctx['json']} › {leaf}"
                else:
                    path = leaf
            elif ctx['json']:
                path = ctx['json'] + ' (table row)'
        res.append({'kind': kind, 'val': val, 'where': where, 'path': path})
    return res


def word_delta(old, new):
    """Compact view of a long edit: only the changed words, with a little context."""
    a, b = old.split(' '), new.split(' ')
    parts = []
    for op, i1, i2, j1, j2 in difflib.SequenceMatcher(None, a, b, autojunk=False).get_opcodes():
        if op == 'equal':
            continue
        pre = ' '.join(a[max(0, i1 - 4):i1])
        post = ' '.join(a[i2:i2 + 4])
        parts.append(f"…{pre} [-{' '.join(a[i1:i2])}-] [+{' '.join(b[j1:j2])}+] {post}…")
    return '\n         '.join(parts)


def show(v):
    return ' | '.join(v) if isinstance(v, tuple) else v


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('export')
    ap.add_argument('--data', default='src/data')
    ap.add_argument('--json', action='store_true', help='machine-readable output')
    a = ap.parse_args()

    base = annotate(lines_from_html(render_html(a.data)))
    edit = annotate(load_export(a.export))
    # Ignore the generated date line, which differs every run.
    key = lambda x: (x['kind'], re.sub(r'Generated from .*', 'Generated', show(x['val'])))
    sm = difflib.SequenceMatcher(None, [key(x) for x in base], [key(x) for x in edit], autojunk=False)
    changes = []
    for op, i1, i2, j1, j2 in sm.get_opcodes():
        if op == 'equal':
            continue
        olds, news = base[i1:i2], edit[j1:j2]
        if op == 'replace' and len(olds) == len(news):
            for o, n in zip(olds, news):
                changes.append({'type': 'changed', 'where': n['where'], 'path': n['path'] or o['path'],
                                'old': show(o['val']), 'new': show(n['val'])})
        else:
            for o in olds:
                changes.append({'type': 'removed', 'where': o['where'], 'path': o['path'], 'old': show(o['val'])})
            for n in news:
                changes.append({'type': 'added', 'where': n['where'], 'path': n['path'], 'new': show(n['val'])})

    if a.json:
        print(json.dumps(changes, ensure_ascii=False, indent=1))
        return
    if not changes:
        print('No content changes: the doc matches src/data.')
        return
    print(f'{len(changes)} change(s) between the repo and the doc:\n')
    for c in changes:
        print(f"[{c['type'].upper()}] {c['where']}")
        if c['path']: print(f"  field: {c['path']}")
        if c['type'] == 'changed' and len(c['old']) > 160:
            print(f"  edit:  {word_delta(c['old'], c['new'])}")
        else:
            if 'old' in c: print(f"  old:   {c['old']}")
            if 'new' in c: print(f"  new:   {c['new']}")
        print()


if __name__ == '__main__':
    main()
