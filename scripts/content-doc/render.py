"""Render src/data/*.json into the Google Doc HTML (the 4-mode content doc).

Usage:  python scripts/content-doc/render.py [--data src/data] [--out content-doc.html]
Upload the HTML to Drive as a Google Doc (Drive create_file, contentMimeType text/html).
diff.py imports render_html() to rebuild the baseline it compares an edited doc against.
"""
import json, html, os, sys, argparse, datetime

def render_html(data_dir):
  D = os.path.join(data_dir, '')
  L = lambda n: json.load(open(D + n + '.json', encoding='utf-8'))
  idn, hdr, xp, edu, tl, pj, sk, aw, ce, ts, fd, life = [L(n) for n in
    'identity headers experience education timeline projects skills awards certs testimonials feed life'.split()]

  e = lambda s: html.escape('' if s is None else str(s), quote=False)
  out = []
  w = out.append
  KEY = 'font-family:Roboto Mono,monospace;font-size:8pt;color:#80868b'

  def key(k): return f'<code>{e(k)}</code>'
  def h1(t): w(f'<h1>{e(t)}</h1>')
  def h2(t): w(f'<h2>{e(t)}</h2>')
  def h3(t): w(f'<h3>{e(t)}</h3>')
  def p(t): w(f'<p>{t}</p>')
  def note(t): w(f'<p><i>{t}</i></p>')

  def table(rows, head=('Element', 'Content', 'Source key')):
      three = len(head) == 3 and head[-1] == 'Source key'
      if three:
          segs = [r[2].split(' › ') for r in rows if r[2] and not r[2].startswith('[') and not r[2].startswith('(')]
          pre = []
          if len(segs) > 1:
              for parts in zip(*[s_[:-1] for s_ in segs]):
                  if all(x == parts[0] for x in parts): pre.append(parts[0])
                  else: break
          if pre: w(f'<p>JSON: {e(" › ".join(pre))}</p>')
          w('<table border="1"><tr><td><b>Field</b></td><td><b>Content</b></td></tr>')
          for lab, val, k in rows:
              ks = k.split(' › ')
              leaf = ' › '.join(ks[len(pre):]) if pre and not k.startswith('[') else k
              leaf = leaf.replace('[in code] ', 'in code: ') if leaf.startswith('[in code]') else leaf
              lab_html = e(lab) + (f' <i>[{e(leaf)}]</i>' if leaf else '')
              vh = val if isinstance(val, Raw) else e(val)
              w(f'<tr><td>{lab_html}</td><td>{vh}</td></tr>')
          w('</table>')
          return
      w('<table border="1"><tr>' + ''.join(f'<td><b>{e(c)}</b></td>' for c in head) + '</tr>')
      for r in rows:
          w('<tr>' + ''.join(f'<td>{c if isinstance(c, Raw) else e(c)}</td>' for c in r) + '</tr>')
      w('</table>')

  class Raw(str): pass
  lst = lambda a: ' | '.join(a)
  stats = lambda d: '; '.join(f'{k}: {v}' for k, v in d.items())
  SHARED = lambda where: Raw(f'<i>↺ same text as {e(where)} (edit it there)</i>')

  # ---------------- Intro ----------------
  w('<p class="title" style="font-size:24pt"><b>reginaldtan.com — Portfolio Content Doc</b></p>')
  p('Every piece of copy on the site, grouped by the mode it appears in: <b>1 Paper</b> (/), <b>2 Tech</b> (/tech), <b>3 Finance</b> (/finance), <b>4 Life</b> (/life). Generated from <code>src/data/*.json</code> on ' + datetime.date.today().strftime('%d %b %Y') + '.')
  h2('How to edit this doc')
  w('<ul>')
  for li in [
    'Edit the <b>Content</b> column (right-hand side) only. Leave the [bracketed field names] and “JSON:” lines alone: they tell Claude Code which JSON field to update when you re-upload this doc.',
    'Each fact is written once. Where another mode shows the same text, the cell says <i>↺ same text as …</i>. Edit it at the place it points to, and the change will show in every mode.',
    'Lists use “ | ” between items (skills, tags, highlights). Keep that separator.',
    'Keep inline tags such as &lt;b&gt;, &lt;em&gt;, &lt;br&gt;, &lt;code&gt; where they appear: they produce bold, italics, line breaks and code style on the site.',
    'Tokens in braces fill in automatically: {CodingSpan} / {codingSpan} = years since you started coding (2018), {TradingSpan} / {tradingSpan} = years since you started trading (2024). Capitalised = starts with a capital letter.',
    'Rows marked <b>[auto]</b> are calculated by the site (e.g. Finance growth figures, fundamentals strip, allocation %). Change their inputs, not the numbers.',
    'Rows marked <b>[in code]</b> are written into a component file, not the JSON. They can still be edited here, and Claude Code will change the file.',
    'To add a project, award, cert, milestone etc., copy an existing row or block and fill it in. Leave the field name off and Claude Code will slot it in.',
  ]: w(f'<li>{li}</li>')
  w('</ul>')

  # ================= 1 PAPER =================
  h1('1 · Paper mode  (/)')
  note('The light, editorial scroll site and the default landing page. Sections appear top to bottom in this order, with a dot-rail on the right listing them.')

  h2('1.1 Hero')
  table([
    ['Rotating headline 1', idn['positioningLinesHtml'][0], 'identity › positioningLinesHtml[0]'],
    ['Rotating headline 2', idn['positioningLinesHtml'][1], 'identity › positioningLinesHtml[1]'],
    ['Rotating headline 3', idn['positioningLinesHtml'][2], 'identity › positioningLinesHtml[2]'],
    ['Sub-line (lede)', idn['lede'], 'identity › lede'],
    ['Button 1', 'Download résumé  (opens CV link)', '[in code] Paper.jsx'],
    ['Button 2', 'Get in touch  (scrolls to Contact)', '[in code] Paper.jsx'],
    ['Scroll cue', 'SCROLL ↓', '[in code] Paper.jsx'],
  ])
  note('Headlines rotate every 4.8 s. &lt;em&gt; marks the italic red word; &lt;br&gt; is the line break.')

  h2('1.2 About  (rail: 01 · About)')
  table([
    ['Heading', hdr['about']['paper'], 'headers › about › paper'],
    ['Paragraph 1', idn['aboutHtml'][0], 'identity › aboutHtml[0]'],
    ['Paragraph 2', idn['aboutHtml'][1], 'identity › aboutHtml[1]'],
    ['Goal pull-quote', idn['goal'], 'identity › goal'],
  ])
  h3('Quick stats (animated counters; Tech README shows the same numbers)')
  rows = []
  for s in idn['stats']:
      val = f"[auto] years since {s['since']}" if 'since' in s else str(s['n'])
      rows.append([val, s['label'], f"identity › stats › {s['key']}"])
  table(rows, ('Number', 'Label', 'Source key'))

  h2('1.3 Journey / timeline  (rail: 02 · Journey)')
  table([
    ['Heading', hdr['timeline']['paper'], 'headers › timeline › paper'],
    ['Sub-heading', hdr['timeline']['paperSub'], 'headers › timeline › paperSub'],
  ])
  for i, ph in enumerate(tl['phases']):
      h3(f"Phase {i+1}: {ph['phase']}")
      table([
        ['Dates', ph['when'], f'timeline › phases[{i}] › when'],
        ['Phase title', ph['phase'], f'timeline › phases[{i}] › phase'],
        ['Description', ph['desc'], f'timeline › phases[{i}] › desc'],
        ['Tag', ph['tag'], f'timeline › phases[{i}] › tag'],
      ])
      table([[m['b'].strip(), m['text'], m['when']] for m in ph['miles']], ('Milestone (bold part)', 'Milestone (rest)', 'When'))

  h2('1.4 Experience  (rail: 03 · Experience)')
  table([['Heading', hdr['experience']['paper'], 'headers › experience › paper']])
  note('Each card opens a detail pop-up when clicked. Card hint text: “details →” [in code].')
  for x in xp:
      h3(x['orgShort'])
      k = f"experience › {x['id']}"
      table([
        ['Card: dates', x['when'], f'{k} › when'],
        ['Card: role', x['role'], f'{k} › role'],
        ['Card: organisation', x['org'], f'{k} › org'],
        ['Card: description', x['paperDesc'], f'{k} › paperDesc'],
        ['Card: tag', x['paperTag'], f'{k} › paperTag'],
        ['Pop-up: title (also Finance holding name)', x['orgShort'], f'{k} › orgShort'],
        ['Pop-up: meta line', x['detail']['meta'], f'{k} › detail › meta'],
        ['Pop-up: body', x['detail']['body'], f'{k} › detail › body'],
        ['Pop-up: skills', lst(x['detail']['skills']), f'{k} › detail › skills'],
        ['Pop-up: key stats', stats(x['detail']['stats']), f'{k} › detail › stats'],
        ['Pop-up: privacy note', x['detail'].get('private') or '(none)', f'{k} › detail › private'],
      ])

  h2('1.5 Projects  (rail: 04 · Projects)')
  table([
    ['Heading', hdr['projects']['paper'], 'headers › projects › paper'],
    ['Sub-heading', hdr['projects']['paperSub'], 'headers › projects › paperSub'],
  ])
  note('Flagship projects show as cards; supplementary ones as one-line rows below. Both open the same pop-up. The pop-up text (description, skills, stats) is also used by Tech (repo page) and Finance (Fundamentals / Key stats), so edit it here once. Pop-up meta line = “year · role · status”.')
  def proj_rows(q):
      k = f"projects › {q['sym']}"
      rows = [
        ['Title', q['title'], f'{k} › title'],
        ['Year', q['year'], f'{k} › year'],
        ['Role', q['role'], f'{k} › role'],
        ['Status', q['status'], f'{k} › status'],
      ]
      if 'card' in q:
          c = q['card']
          rows += [
            ['Card: year label', c['yr'], f'{k} › card › yr'],
            ['Card: title (if different)', c.get('title') or '(uses Title)', f'{k} › card › title'],
            ['Card: blurb', c['blurb'], f'{k} › card › blurb'],
            ['Card: tags', lst(c['tags']), f'{k} › card › tags'],
            ['Card: wide “featured” card', 'yes' if c.get('feat') else 'no', f'{k} › card › feat'],
          ]
      if 'mini' in q:
          rows += [
            ['Row: one-liner', q['mini']['blurb'], f'{k} › mini › blurb'],
            ['Row: tag', q['mini']['tag'], f'{k} › mini › tag'],
          ]
      rows += [
        ['Pop-up: description (shared)', q['desc'], f'{k} › desc'],
        ['Pop-up: skills (shared)', lst(q['skills']), f'{k} › skills'],
        ['Pop-up: key stats (shared)', stats(q['stats']), f'{k} › stats'],
        ['Pop-up: privacy note', q.get('private') or '(none)', f'{k} › private'],
      ]
      return rows
  h3('Flagship')
  for q in [q for q in pj if q['flag']]:
      p(f"<b>{e(q['title'])}</b>  {key('$' + q['sym'])}")
      table(proj_rows(q))
  h3('Supplementary')
  for q in [q for q in pj if not q['flag']]:
      p(f"<b>{e(q['title'])}</b>  {key('$' + q['sym'])}")
      table(proj_rows(q))

  h2('1.6 Skills constellation  (rail: 05 · Skills)')
  table([
    ['Heading', hdr['skills']['paper'], 'headers › skills › paper'],
    ['Centre node label', sk['root']['label'], 'skills › root › label'],
    ['Centre node caption', sk['root']['caption'], 'skills › root › caption'],
  ])
  note('Each skill links to its cluster hub automatically. “Connects to” adds extra direct links (lit up when a node is clicked). Hover caption = “Skill · strength/10 · evidence”. Strength also drives Finance’s Sector Exposure %.')
  table([[h['label'], h['id']] for h in sk['hubs']] + [[f"{s['label']} (sub-cluster of {s['hub']})", s['id']] for s in sk['subhubs']], ('Cluster label', 'Cluster id'))
  table([[l['name'], l['parent'], str(l['strength']), l['evidence'], lst(l['connects_to']) or '—'] for l in sk['leaves']],
        ('Skill', 'Cluster id', 'Strength /10', 'Evidence (hover caption)', 'Connects to'))

  h2('1.7 Awards & Certificates  (rail: Awards & honours)')
  table([
    ['Awards column heading', hdr['awards']['eyebrow'], 'headers › awards › eyebrow  (the “06 · ” is stripped)'],
    ['Certificates column heading', hdr['awards']['certsEyebrow'], 'headers › awards › certsEyebrow'],
    ['“View all” link', f"…and {{N}} more · view all ↗  (N = [auto] count of non-curated certs; opens the Drive folder)", '[in code] Paper.jsx'],
  ])
  h3('Awards  (Shown = curated; Finance ticker label = tape)')
  table([[a['name'], a['year'], 'yes' if a['curated'] else 'no', a.get('tape', '—')] for a in aw],
        ('Award', 'Year', 'Shown on Paper', 'Finance ticker label'))
  h3('Certificates  (Paper shows the short name for curated certs; Tech shows the slug for all)')
  table([[c['short'], c['name'], c['issuer'], c['year'], 'yes' if c['curated'] else 'no', c['slug']] for c in ce],
        ('Short name (shown)', 'Full name', 'Issuer (not shown)', 'Year', 'Shown on Paper', 'Tech slug'))

  h2('1.8 Testimonials  (rail: 06 · Testimonials)')
  table([['Heading', hdr['testimonials']['paper'], 'headers › testimonials › paper']])
  note('A carousel, one quote at a time, rotating every 5 s. Each has a “Read in full ↗” link [in code]. The quote is also used by Tech’s APPROVALS.md.')
  for t in ts:
      k = f"testimonials › {t['slug']}"
      table([
        ['Name', t['name'], f'{k} › name'],
        ['Title', t['title'], f'{k} › title'],
        ['Quote (shared with Tech)', t['quote'], f'{k} › quote'],
        ['Full letter link', t.get('url', ''), f'{k} › url'],
      ])

  h2('1.9 “Try the other modes” box')
  note('Shown until the visitor has opened both Tech and Finance. [in code] Paper.jsx')
  table([
    ['Seen neither', 'Same story, two more lenses. You haven’t tried them yet.'],
    ['Seen Tech only', 'One lens left: the brokerage view awaits.'],
    ['Seen Finance only', 'One lens left: the repo view awaits.'],
    ['Buttons', '⌘ open Tech mode | ▲ open Finance mode'],
  ], ('State', 'Text'))

  h2('1.10 Contact footer  (rail: Contact)')
  c = idn['contact']
  table([
    ['Email', c['email'], 'identity › contact › email'],
    ['LinkedIn URL', c['linkedin'], 'identity › contact › linkedin'],
    ['LinkedIn handle (Tech)', c['linkedinHandle'], 'identity › contact › linkedinHandle'],
    ['GitHub URL', c['github'], 'identity › contact › github'],
    ['GitHub handle (Tech)', c['githubHandle'], 'identity › contact › githubHandle'],
    ['CV / résumé link', c['cvUrl'], 'identity › contact › cvUrl'],
    ['Certificates Drive folder', c['driveUrl'], 'identity › contact › driveUrl'],
    ['Résumé button', 'Résumé', '[in code] Paper.jsx'],
    ['Credit line', f"Built by {idn['name']}", 'identity › name'],
  ])
  note('Contact links are used in every mode; edit them here once.')

  # ================= 2 TECH =================
  h1('2 · Tech mode  (/tech)')
  note('A dark IDE: file tree on the left, file viewer in the middle, a working terminal at the bottom. ⌘K / Ctrl+K opens quick-open, which auto-opens on the first visit. Hovering a tree file shows a git-blame tooltip taken from the timeline commits below.')

  h2('2.1 Window chrome')
  table([
    ['Title bar', 'klystrn · ~/portfolio · zsh', '[in code] Tech.jsx  (identity › tech › titlebar is stored but unused)'],
    ['Tree heading', 'Explorer · klystrn', '[in code] Tech.jsx'],
    ['Tree order', 'README.md | timeline.git | experience/ | projects/ (flagship repos + supplementary/) | APPROVALS.md | stack.json | certs.lock | CONTACT.me', '[in code] Tech.jsx'],
    ['Status bar', 'Ln 14, Col 1 · Markdown', '[in code] Tech.jsx'],
  ])

  h2('2.2 README.md  (opens by default)')
  t = idn['tech']
  table([
    ['H1', idn['name'], 'identity › name'],
    ['Tagline', t['readmeTagline'], 'identity › tech › readmeTagline'],
    ['Badges', lst(t['readmeBadges']), 'identity › tech › readmeBadges'],
    ['“About me” paragraph', t['readmeAboutHtml'], 'identity › tech › readmeAboutHtml'],
    ['Quick stats', SHARED('Paper 1.2 Quick stats (shown as key: number)'), 'identity › stats'],
    ['current_status line', t['readmeStatus'], 'identity › tech › readmeStatus'],
    ['Navigate list', 'Career history: timeline.git | References: APPROVALS.md | Repos in projects/ · Reach me: CONTACT.me', '[in code] files.jsx'],
  ])

  h2('2.3 timeline.git  (git log graph)')
  table([
    ['Heading', 'git log --graph --all', '[in code] files.jsx'],
    ['Comment line', '# branches: sst · np · work · saf · trade · xtra', '[in code] files.jsx'],
  ])
  note('Newest first. Colour = the branch dot colour.')
  table([[cm['hash'], cm['tag'], cm['msg'], cm['when'], cm['c']] for cm in tl['commits']],
        ('Hash', 'Branch tag', 'Commit message', 'Year', 'Colour'))

  h2('2.4 experience/  (one .md file per role)')
  note('The role’s “Highlights” heading reads “Notes” for SAF [in code].')
  for x in xp:
      k = f"experience › {x['id']} › tech"
      h3(x['tech']['file'])
      table([
        ['File name', x['tech']['file'], f'{k} › file'],
        ['H1', x['tech']['title'], f'{k} › title'],
        ['Badges', lst(b[1] for b in x['tech']['badges']), f'{k} › badges'],
        ['Body', x['tech']['bodyHtml'], f'{k} › bodyHtml'],
        ['Highlights', lst(x['tech']['highlights']) or '(none, section hidden)', f'{k} › highlights'],
      ])

  h2('2.5 projects/  (one repo page per project)')
  note('Each repo page shows: repo name, “public” label, badges (✓ status · year · role), the description, a language bar, a Stack list (= skills), and “also listed as $SYM in Finance mode →”. Status, year, role, description and skills are shared with Paper 1.5. Below are the Tech-only fields.')
  table([[('★ ' if q['flag'] else '') + q['title'], q['repo'], lst(f'{a} {b}%' for a, b, _ in q['langs'])] for q in pj],
        ('Project (★ = flagship, top level)', 'Repo / folder name', 'Language bar (name %)'))

  h2('2.6 APPROVALS.md  (testimonials as code reviews)')
  table([
    ['Heading', 'Code review · approvals', '[in code] files.jsx'],
    ['Each review', '✓ Approved · {slug} reviewed → “quote” → title · read in full ↗', '[in code] files.jsx'],
    ['Quotes and titles', SHARED('Paper 1.8 Testimonials'), 'testimonials › quote / title'],
    ['Footer', 'LGTM ×{count}. merge when ready', '[in code] files.jsx'],
  ])

  h2('2.7 stack.json')
  note('Rendered as a JSON object. Separate from the constellation, so tools can live here without being a node.')
  table([[k, lst(v)] for k, v in sk['stack'].items()] + [['years_writing_code', '[auto] years since 2018']], ('Key', 'Values'))
  table([['Trailing comment', '// proprietary stacks (Athena, Hydra, Sigma) live in the repos', '[in code] files.jsx']])

  h2('2.8 certs.lock')
  table([
    ['Heading', 'certs.lock', '[in code] files.jsx'],
    ['Comment', '# verified dependencies, do not edit by hand', '[in code] files.jsx'],
    ['Entries', SHARED('Paper 1.7 Certificates (Tech slug + year, all certs)'), 'certs › slug / year'],
  ])

  h2('2.9 CONTACT.me')
  table([
    ['Tagline', 'Zero merge conflicts. Fast response time.', '[in code] files.jsx'],
    ['email / linkedin / github / cv', SHARED('Paper 1.10 Contact'), 'identity › contact'],
    ['CV link text', 'download résumé.pdf ⬇', '[in code] files.jsx'],
  ])

  h2('2.10 Terminal')
  table([
    ['Header', 'terminal · zsh · try: help', '[in code] Terminal.jsx'],
    ['Prompt', 'klystrn@portfolio ~ %', '[in code] Terminal.jsx'],
    ['help output', 'available: whoami · ls · cd <dir> · open <file> · projects · contact · cv · stack · github · linkedin · email · mode <name> · date · echo · history · clear', '[in code] Terminal.jsx'],
    ['Boot tip', 'tip · hover a file in the tree for its last commit · ⌘K to quick-open', '[in code] Terminal.jsx'],
    ['whoami', 'SWE × markets. Now: Guards HQ (media team manager · AI task force). Prev: JPMC CIB, Alibaba Cloud.', '[in code] Terminal.jsx'],
    ['sudo hire-me (easter egg)', 'request escalated ✓ drafting offer letter…  (any other sudo: permission denied (hint: sudo hire-me))', '[in code] Terminal.jsx'],
    ['Unknown command', "zsh: command not found: {cmd}, try 'help'", '[in code] Terminal.jsx'],
  ])
  p('<b>Credit line:</b> “// built by Reginald Tan” style, from identity › name.')

  # ================= 3 FINANCE =================
  h1('3 · Finance mode  (/finance)')
  note('A dark brokerage terminal: Reginald Tan is the stock $RTAN, projects are tickers, roles are holdings, testimonials are analyst coverage.')

  h2('3.1 Ticker tape (scrolling, top)')
  table([
    ['Items', '$RTAN ▲ | every project as $SYM +growth | award ticker labels | PIOI OLYMPIAD TOP-8 | 16 WORKSHOPS OVERFLOW', ''],
    ['Project growth', '[auto] last curve point minus first, per project (see 3.4)', 'projects › curve'],
    ['Award labels', SHARED('Paper 1.7 Awards (Finance ticker label column)'), 'awards › tape'],
    ['Fixed items', 'PIOI OLYMPIAD TOP-8 | 16 WORKSHOPS OVERFLOW', '[in code] Finance.jsx'],
  ])

  h2('3.2 Header')
  f = idn['finance']
  table([
    ['Ticker', '$' + f['sym'], 'identity › finance › sym'],
    ['Exchange', '·' + f['exch'], 'identity › finance › exch'],
    ['Name line', f['name'], 'identity › finance › name'],
    ['Quote line', f['quoteHtml'], 'identity › finance › quoteHtml'],
    ['Status (after “LIVE · ”)', f['statusLine'], 'identity › finance › statusLine'],
  ])

  h2('3.3 Fundamentals strip  [auto]')
  note('All calculated: YRS ACTIVE (since first timeline year), PROJECTS (count), SHIPPED (status = shipped / total), AVG GROWTH, POSITIONS (number of experience entries), LICENCES (number of certs). Nothing to edit here.')

  h2('3.4 Watchlist · Projects')
  table([
    ['Panel title', hdr['finance']['watchlist'], 'headers › finance › watchlist'],
    ['Hint / tabs', 'click to inspect | FLAGSHIP | SUPPLEMENTARY', '[in code] Finance.jsx'],
  ])
  note('Rows are grouped by sector (text before the first “·”). Curve = 12 points (0–100) that draw the chart and sparkline. Milestones = “index: label”, index 0–11 marks a point on the curve.')
  for q in pj:
      k = f"projects › {q['sym']}"
      p(f"<b>${e(q['sym'])} · {e(q['title'])}</b>{' (flagship)' if q['flag'] else ''}")
      table([
        ['Ticker', q['sym'], f'{k} › sym'],
        ['Sector', q['sector'], f'{k} › sector'],
        ['Chart curve', ', '.join(map(str, q['curve'])), f'{k} › curve'],
        ['Chart milestones', ' | '.join(f'{i}: {t}' for i, t in q['miles']), f'{k} › miles'],
        ['Growth', f"[auto] +{q['curve'][-1]-q['curve'][0]} pts", '(derived)'],
      ])

  h2('3.5 Selected-ticker detail')
  table([
    ['Quote line', '▲ {growth} since inception', '[in code] Finance.jsx'],
    ['Chart caption', 'project arc · milestones marked', '[in code] Chart.jsx'],
    ['Fundamentals label', hdr['finance']['fundamentals'], 'headers › finance › fundamentals'],
    ['Fundamentals text', SHARED('Paper 1.5 project pop-up description'), 'projects › desc'],
    ['Skills label', hdr['finance']['sector'], 'headers › finance › sector'],
    ['Skill chips', SHARED('Paper 1.5 project pop-up skills'), 'projects › skills'],
    ['Key stats label', hdr['finance']['keystats'], 'headers › finance › keystats'],
    ['Key stats', SHARED('Paper 1.5 project pop-up key stats'), 'projects › stats'],
  ])

  h2('3.6 Institutional Holdings · Experience')
  table([
    ['Panel title', hdr['finance']['holdings'], 'headers › finance › holdings'],
    ['Hint', 'positions held', '[in code] Finance.jsx'],
  ])
  for x in xp:
      k = f"experience › {x['id']}"
      p(f"<b>{e(x['orgShort'])}</b>")
      table([
        ['Holding name', SHARED('Paper 1.4 pop-up title (orgShort)'), f'{k} › orgShort'],
        ['Tag', x['financeTag'], f'{k} › financeTag'],
        ['Meta line', x['financeMeta'], f'{k} › financeMeta'],
        ['Description', x['financeDesc'], f'{k} › financeDesc'],
      ])

  h2('3.7 Listing History · Education')
  table([['Panel title', hdr['finance']['education'], 'headers › finance › education']])
  for d in edu:
      k = f"education › {d['id']}"
      p(f"<b>{e(d['school'])}</b>")
      table([
        ['Name line', d['financeName'], f'{k} › financeName'],
        ['Tag', d['financeTag'], f'{k} › financeTag'],
        ['Meta line', d['financeMeta'], f'{k} › financeMeta'],
        ['Description', d['financeDesc'], f'{k} › financeDesc'],
      ])
  note('Education only appears in Finance as its own panel; in Paper it shows through the Journey timeline. School, programme, years, academics and “beyond” are stored but not displayed (see Appendix).')

  h2('3.8 Trade Ticket (contact)')
  table([
    ['Panel title', hdr['finance']['ticket'], 'headers › finance › ticket'],
    ['Pitch', f['ticket'], 'identity › finance › ticket'],
    ['Order box', 'MARKET ORDER · BUY 1 $RTAN @ MKT → ▸ SIMULATE FILL → FILLING… → ✓ FILLED @ MKT · settles in an interview →', '[in code] Finance.jsx'],
    ['Buttons', 'BUY · CONTACT (email) | LINKEDIN | ⬇ DOWNLOAD PROSPECTUS · CV.PDF', '[in code] Finance.jsx'],
  ])

  h2('3.9 Sector Exposure · Allocation')
  table([
    ['Panel title', 'Sector Exposure · Allocation', '[in code] Finance.jsx  (headers › finance › sector is the detail label instead)'],
    ['Hint', 'by skill strength', '[in code] Finance.jsx'],
    ['Bars / %', '[auto] sum of skill strengths per cluster (TECH, AI, MARKETS, MEDIA, OPS). Edit strengths in Paper 1.6.', 'skills › leaves › strength'],
  ])

  h2('3.10 Analyst Coverage · Testimonials')
  table([['Panel title', hdr['finance']['coverage'], 'headers › finance › coverage']])
  for t in ts:
      k = f"testimonials › {t['slug']}"
      p(f"<b>{e(t['name'])}</b>")
      table([
        ['Rating tag', t['financeTag'], f'{k} › financeTag'],
        ['Quote (Finance cut)', t.get('quoteFinance') or '(uses Paper quote)', f'{k} › quoteFinance'],
        ['Byline', t['titleFinance'], f'{k} › titleFinance'],
        ['Link text', 'FULL NOTE ↗  (same link as Paper 1.8)', '[in code] Finance.jsx'],
      ])

  h2('3.11 News Wire · Recent')
  table([
    ['Panel title', hdr['finance']['news'], 'headers › finance › news'],
    ['Hint', 'GitHub · LinkedIn', '[in code] Finance.jsx'],
  ])
  note('GitHub items are replaced live by your latest public GitHub activity when it loads; the GitHub rows below are only the fallback. LinkedIn rows always show. Links set to # show no “view ↗”.')
  table([[i['t'], 'GitHub' if i['src'] == 'gh' else 'LinkedIn', i['xHtml'], i['link']] for i in fd],
        ('When', 'Source', 'Text', 'Link'))

  h2('3.12 Footer')
  table([
    ['Disclaimer', f['disclaimer'], 'identity › finance › disclaimer'],
    ['Credit', f"BUILT BY {idn['name'].upper()} · ${f['sym']}", 'identity › name + finance › sym'],
  ])

  # ================= 4 LIFE =================
  h1('4 · Life mode  (/life)')
  note('“Off the clock”: a photorealistic render of your room with clickable hotspots. Hovering shows a tooltip; clicking zooms in and opens a sub-page.')

  h2('4.1 Room')
  table([
    ['Intro title (fallback view if the render fails)', life['intro']['title'], 'life › intro › title'],
    ['Intro sub (fallback view)', life['intro']['sub'], 'life › intro › sub'],
    ['Hint bar', 'Hover an object · click to step inside · press 1–5 to jump  (touch: Tap an object to step inside.)', '[in code] Life.jsx'],
  ])
  note('Hotspots, in keyboard order 1–5: trophy, cards, camera, work (desk), watch.')
  for oid in ['trophy', 'cards', 'camera', 'work', 'watch']:
      o = life['objects'][oid]
      k = f'life › objects › {oid}'
      h3(f"Hotspot: {o['label']}")
      rows = [
        ['Label', o['label'], f'{k} › label'],
        ['Tooltip title', o['hoverTitle'], f'{k} › hoverTitle'],
      ]
      if oid != 'trophy':
          rows += [
            ['Tooltip blurb', o['blurb'], f'{k} › blurb'],
            ['Tooltip tag', o['tag'], f'{k} › tag'],
            ['Call to action', o.get('cta', ''), f'{k} › cta'],
          ]
      else:
          rows += [['Tooltip body', 'Shows the trophy lists below (blurb and tag are stored but not displayed)', '']]
      table(rows)
      if oid == 'trophy':
          table([[a['year'], a['name']] for a in life['trophies']['taekwondo']], ('Taekwondo: year', 'Achievement'))
          table([[a['year'], a['name']] for a in life['trophies']['diving']], ('Diving: year', 'Achievement'))
          table([['Blurb (unused)', o['blurb'], f'{k} › blurb'], ['Tag (unused)', o['tag'], f'{k} › tag']])

  h2('4.2 Photography page  (/life/photography)')
  P = life['photography']
  table([
    ['Handle', P['handle'], 'life › photography › handle'],
    ['Name', P['name'], 'life › photography › name'],
    ['Bio', P['bio'], 'life › photography › bio'],
    ['Stat: sets', str(P['stats']['posts']), 'life › photography › stats › posts'],
    ['Stat: gear', P['stats']['gear'], 'life › photography › stats › gear'],
    ['Stat: shooting since', P['stats']['since'], 'life › photography › stats › since'],
    ['Avatar image', P['avatar'], 'life › photography › avatar'],
  ])
  note('Photo sets (no photos uploaded yet; tiles show a coloured placeholder).')
  table([[t['title'], str(t['count']), t['id']] for t in P['tiles']], ('Set title', 'Photo count shown', 'id'))

  h2('4.3 Watch story  (/life/watch)')
  W = life['watchStory']
  table([
    ['Title', W['brand'], 'life › watchStory › brand'],
    ['Subtitle', W['sub'], 'life › watchStory › sub'],
  ])
  table([[x['year'], x['line1'], x['line2']] for x in W['entries']], ('Year (on dial)', 'Headline', 'Story'))

  h2('4.4 Card Toss game  (/life/cards)')
  C = life['cards']
  table([
    ['Title', C['title'], 'life › cards › title'],
    ['Instructions', C['intro'], 'life › cards › intro'],
    ['Cards per round', str(C['cardsPerRound']), 'life › cards › cardsPerRound'],
    ['Curveball bonus', str(C['curveBonus']), 'life › cards › curveBonus'],
  ])
  table([[r['label'], str(r['points']), str(r['r'])] for r in C['rings']], ('Ring', 'Points', 'Radius (px)'))

  # ================= Appendix =================
  h1('Appendix · Site-wide and stored-but-hidden')
  h2('Mode switcher (top nav) tooltips  [in code] PillNav.jsx')
  table([
    ['Paper', 'The classic view — résumé, timeline, projects.'],
    ['Tech', 'The same career as a terminal — cd into it.'],
    ['Finance', 'The same career as a stock ticket — $RTAN.'],
    ['Life', 'Off the clock — an interactive room, a watch, two games.'],
  ], ('Mode', 'Tooltip'))
  h2('404 page  [in code] NotFound.jsx')
  table([['Heading', 'This page wandered off.'], ['Text', "The link is broken or the page never existed. Let's get you back to the work."]], ('Element', 'Text'))
  h2('Stored in the data but not shown anywhere yet')
  note('Kept for reference. Tell Claude Code if you want any of these surfaced.')
  rows = [
    ['Status line', idn['status'], 'identity › status'],
    ['Location', idn['location'], 'identity › location'],
    ['Credit text', idn['credit'], 'identity › credit'],
    ['Tech titlebar', idn['tech']['titlebar'], 'identity › tech › titlebar'],
    ['Life “namecard” object', f"{life['objects']['namecard']['hoverTitle']}: {life['objects']['namecard']['blurb']}", 'life › objects › namecard (no hotspot in the render yet)'],
    ['Camera photo', life['objects']['camera'].get('photo', ''), 'life › objects › camera › photo'],
  ]
  for x in xp: rows.append([f"{x['orgShort']}: location", x['location'], f"experience › {x['id']} › location"])
  for d in edu:
      k = f"education › {d['id']}"
      rows += [
        [f"{d['id'].upper()}: school / programme / years", f"{d['school']} · {d['programme']} · {d['years']}", f'{k} › school / programme / years'],
        [f"{d['id'].upper()}: academics", d['academics'], f'{k} › academics'],
        [f"{d['id'].upper()}: beyond the classroom", d['beyond'], f'{k} › beyond'],
      ]
  table(rows)

  return '<html><head><meta charset="utf-8"></head><body>' + '\n'.join(out) + '</body></html>'

if __name__ == '__main__':
  ap = argparse.ArgumentParser()
  ap.add_argument('--data', default='src/data')
  ap.add_argument('--out', default='content-doc.html')
  a = ap.parse_args()
  open(a.out, 'w', encoding='utf-8').write(render_html(a.data))
  print('wrote', a.out)
