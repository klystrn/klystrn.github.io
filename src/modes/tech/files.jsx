import { identity, experience, timeline, certs, testimonials, skills } from '../../lib/data';
import { PROJECTS } from '../../lib/projects';

/*
 * Editor views. `ctx` = { openFile, openDir, gotoFinance, toast, cvClick }.
 * Every fact rendered here comes from src/data — components are furniture only.
 */

/* Inline "code link" — reads like a filename in prose but jumps to another
   file/dir. Not a real <a>, so it needs a keyboard path in manually. */
function FLink({ as: Tag = 'code', onClick, children }) {
  return (
    <Tag
      className="flink"
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } }}
    >
      {children}
    </Tag>
  );
}

function Readme({ ctx }) {
  const t = identity.tech;
  const kv = identity.stats;
  const badgeCls = ['b-cy', 'b-gr', 'b-vi', 'b-or'];
  return (
    <div className="md">
      <h1>{identity.name}</h1>
      <p style={{ opacity: 0.55 }}>{t.readmeTagline}</p>
      <div className="badges">
        {t.readmeBadges.map((b, i) => (
          <span key={b} className={`badge ${badgeCls[i % 4]}`}>{b}</span>
        ))}
      </div>
      <h2>About me</h2>
      <p dangerouslySetInnerHTML={{ __html: t.readmeAboutHtml }} />
      <h2>Quick stats</h2>
      {kv.map((s) => (
        <div className="kv-line" key={s.key}>
          <span className="k">{s.key}</span>
          <span className="v">{s.n}</span>
        </div>
      ))}
      <div className="kv-line">
        <span className="k">current_status</span>
        <span className="v">{t.readmeStatus}</span>
      </div>
      <h2>Navigate</h2>
      <ul>
        <li>Career history: <FLink onClick={() => ctx.openFile('timeline')}>timeline.git</FLink></li>
        <li>References: <FLink onClick={() => ctx.openFile('approvals')}>APPROVALS.md</FLink></li>
        <li>
          Repos in <FLink onClick={() => ctx.openDir('proj')}>projects/</FLink> · Reach me:{' '}
          <FLink onClick={() => ctx.openFile('contact')}>CONTACT.me</FLink>
        </li>
      </ul>
    </div>
  );
}

function XpFile({ xp }) {
  return (
    <div className="md">
      <h1>{xp.tech.title}</h1>
      <div className="badges">
        {xp.tech.badges.map(([cls, text]) => (
          <span key={text} className={`badge ${cls}`}>{text}</span>
        ))}
      </div>
      <p dangerouslySetInnerHTML={{ __html: xp.tech.bodyHtml }} />
      {xp.tech.highlights.length > 0 && (
        <>
          <h2>Highlights</h2>
          <ul>
            {xp.tech.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

/* Line-number gutter for the code-style files (stack.json, certs.lock), so
   they read as source in an editor rather than as styled prose. */
function Code({ lines }) {
  return (
    <div className="code">
      {lines.map((l, i) => (
        <div className="cl" key={i}>
          <span className="ln">{i + 1}</span>
          <span className="lc">{l}</span>
        </div>
      ))}
    </div>
  );
}

function StackFile() {
  const s = skills.stack;
  const keys = Object.entries(s).filter(([, v]) => Array.isArray(v));
  const lines = [
    <span className="p">{'{'}</span>,
    ...keys.map(([k, v]) => (
      <>
        {'  '}<span className="k">"{k}"</span><span className="p">: [</span>
        {v.map((x, i) => (
          <span key={x}><span className="s">"{x}"</span>{i < v.length - 1 && <span className="p">, </span>}</span>
        ))}
        <span className="p">],</span>
      </>
    )),
    <>
      {'  '}<span className="k">"years_writing_code"</span><span className="p">: </span>
      <span className="n">{s.years_writing_code}</span>{'  '}
      <span className="cm">// proprietary stacks (Athena, Hydra, Sigma) live in the repos</span>
    </>,
    <span className="p">{'}'}</span>,
  ];
  return (
    <div className="md">
      <Code lines={lines} />
    </div>
  );
}

/* Lockfile-style: one resolved entry per certificate, like a yarn.lock. */
function CertsFile() {
  const lines = [
    <span className="cm"># certs.lock: verified dependencies, do not edit by hand</span>,
    <span className="cm"># {certs.length} packages resolved</span>,
    '',
  ];
  certs.forEach((c) => {
    lines.push(<><span className="k">{c.slug}</span><span className="p">@</span><span className="n">{c.year}</span><span className="p">:</span></>);
    lines.push(<>{'  '}<span className="kw">resolved</span> <span className="s">"{c.name}"</span></>);
    lines.push(<>{'  '}<span className="kw">issuer</span> <span className="s">"{c.issuer}"</span></>);
    lines.push(<>{'  '}<span className="kw">integrity</span> <span className="ok">✓ verified</span></>);
    lines.push('');
  });
  return (
    <div className="md">
      <Code lines={lines} />
    </div>
  );
}

function TimelineFile() {
  const COMMITS = timeline.commits;
  const row = 62;
  const H = COMMITS.length * row;
  return (
    <div className="md">
      <h1>git log --graph --all</h1>
      <p style={{ opacity: 0.55 }}># branches: sst · np · work · saf · trade · xtra</p>
      <div className="graph-wrap">
        <svg className="graph-svg" width="60" height={H} viewBox={`0 0 60 ${H}`} aria-hidden="true">
          <line x1="26" y1={row / 2} x2="26" y2={H - row / 2} stroke="#56d4dd" strokeWidth="2" opacity=".35" />
          {COMMITS.map((c, i) => (
            <circle key={c.hash} cx="26" cy={i * row + 22} r="5.5" fill="var(--tbg)" stroke={c.c} strokeWidth="2.5" />
          ))}
        </svg>
        <div className="commits">
          {COMMITS.map((c) => (
            <div className="commit" key={c.hash}>
              <div className="commit-top">
                <span className="hash">{c.hash}</span>
                <span className="msg"><span className="tag">{c.tag}</span>{c.msg}</span>
                <span className="when">{c.when}</span>
              </div>
              {c.body && <div className="commit-body">{c.body}</div>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ApprovalsFile() {
  return (
    <div className="md">
      <h1>Code review · approvals</h1>
      {testimonials.filter((t) => t.quote).map((t) => (
        <div className="review" key={t.slug}>
          <div className="review-h">
            <span className="ok">✓ Approved</span>
            <span style={{ opacity: 0.5 }}>· {t.slug} reviewed</span>
          </div>
          <div className="review-b">{`"${t.quote}"`}</div>
          <div className="review-f">
            {t.title}
            {t.url && (
              <>
                {' · '}
                <a className="flink" href={t.url} target="_blank" rel="noopener noreferrer">read in full ↗</a>
              </>
            )}
          </div>
        </div>
      ))}
      <p style={{ marginTop: 10 }}>LGTM ×{testimonials.length}. <code>merge when ready</code></p>
    </div>
  );
}

function ContactFile({ ctx }) {
  const c = identity.contact;
  return (
    <div className="md">
      <h1>CONTACT.me</h1>
      <p>Zero merge conflicts. Fast response time.</p>
      <div className="kv-line"><span className="k">email</span><span className="v"><a href={`mailto:${c.email}`}>{c.email}</a></span></div>
      <div className="kv-line"><span className="k">linkedin</span><span className="v"><a href={c.linkedin} target="_blank" rel="noopener noreferrer">{c.linkedinHandle} ↗</a></span></div>
      <div className="kv-line"><span className="k">github</span><span className="v"><a href={c.github} target="_blank" rel="noopener noreferrer">{c.githubHandle} ↗</a></span></div>
      <div className="kv-line"><span className="k">cv</span><span className="v"><a href={c.cvUrl || '#'} onClick={ctx.cvClick}>download résumé.pdf ⬇</a></span></div>
    </div>
  );
}

/* A repo opens on its README: overview, milestones as a checked-off list,
   key stats, stack and language mix. Optional `readme` fields on the project
   (problem / approach / next) slot in as their own sections when present. */
function RepoFile({ p, ctx }) {
  const r = p.readme || {};
  return (
    <div className="md">
      <div className="repo-head">
        <h1>{p.repo}</h1>
        <span className="vis">{p.private ? 'private' : 'public'}</span>
      </div>
      <div className="badges">
        <span className="badge b-gr">✓ {p.status}</span>
        <span className="badge b-vi">{p.year}</span>
        <span className="badge">{p.role}</span>
      </div>
      <div className="langbar">
        {p.langs.map((l) => (
          <i key={l[0]} style={{ width: `${l[1]}%`, background: l[2] }} />
        ))}
      </div>
      <div className="langkey">
        {p.langs.map((l) => (
          <span key={l[0]}><b style={{ background: l[2] }} />{l[0]} {l[1]}%</span>
        ))}
      </div>
      <h2>Overview</h2>
      <p>{p.desc}</p>
      {r.problem && (<><h2>Problem</h2><p>{r.problem}</p></>)}
      {r.approach && (<><h2>Approach</h2><p>{r.approach}</p></>)}
      {p.miles?.length > 0 && (
        <>
          <h2>Milestones</h2>
          <ul className="checks">
            {p.miles.map(([, label]) => <li key={label}>{label}</li>)}
          </ul>
        </>
      )}
      <h2>Key stats</h2>
      {Object.entries(p.stats).map(([k, v]) => (
        <div className="kv-line" key={k}><span className="k">{k.toLowerCase()}</span><span className="v">{v}</span></div>
      ))}
      <h2>Stack</h2>
      <div className="badges">
        {p.skills.map((s) => (
          <span key={s} className="badge b-cy">{s}</span>
        ))}
      </div>
      {r.next && (<><h2>What's next</h2><p>{r.next}</p></>)}
      {p.private && <p className="note">// {p.private}</p>}
      <div className="repo-meta">
        <span>⎇ <b>main</b></span>
        <FLink as="span" onClick={() => ctx.gotoFinance(p.sym)}>
          also listed as <b>${p.sym}</b> in Finance mode →
        </FLink>
      </div>
    </div>
  );
}

/* Plain-text renderings of every file: what `cat` prints, what `grep` and the
   ⌘K palette search, and what the status bar counts lines of. Built from the
   same data as the rendered views, so they can't disagree. */
const strip = (html) => html.replace(/<[^>]+>/g, '');
const TEXT = {
  readme: () => [
    `# ${identity.name}`, identity.tech.readmeTagline, '', identity.tech.readmeBadges.join(' · '), '',
    '## About me', strip(identity.tech.readmeAboutHtml), '', '## Quick stats',
    ...identity.stats.map((s) => `${s.key}: ${s.n}`), `current_status: ${identity.tech.readmeStatus}`,
  ],
  timeline: () => timeline.commits.flatMap((c) => [`${c.hash} (${c.tag}) ${c.msg} · ${c.when}`, ...(c.body ? [`    ${c.body}`] : [])]),
  approvals: () => testimonials.filter((t) => t.quote).flatMap((t) => [`✓ Approved · ${t.name}`, `  "${t.quote}"`, `  ${t.title}`, '']),
  stack: () => JSON.stringify(skills.stack, null, 2).split('\n'),
  certs: () => certs.flatMap((c) => [`${c.slug}@${c.year}:`, `  resolved "${c.name}"`, `  issuer "${c.issuer}"`, '']),
  contact: () => {
    const c = identity.contact;
    return [`email: ${c.email}`, `linkedin: ${c.linkedin}`, `github: ${c.github}`, `cv: ${c.cvUrl || '(not wired)'}`];
  },
};
const xpText = (xp) => [`# ${xp.tech.title}`, xp.tech.badges.map((b) => b[1]).join(' · '), '', strip(xp.tech.bodyHtml), '', '## Highlights', ...xp.tech.highlights.map((h) => `- ${h}`)];
const repoText = (p) => [
  `# ${p.repo}`, `${p.status} · ${p.year} · ${p.role}`, '', '## Overview', p.desc, '',
  '## Milestones', ...(p.miles || []).map(([, l]) => `- [x] ${l}`), '',
  '## Key stats', ...Object.entries(p.stats).map(([k, v]) => `${k}: ${v}`), '',
  '## Stack', p.skills.join(', '), '', `listed as $${p.sym} in Finance mode`,
];

/* File registry: id → { label, ext, lang, render, text }. `ext` drives the
   tree/tab icon; `lang` is the status-bar language; `text()` is plain text. */
export function buildFiles() {
  const files = {
    readme: { label: 'README.md', ext: 'md', lang: 'Markdown', render: (ctx) => <Readme ctx={ctx} />, text: TEXT.readme },
    timeline: { label: 'timeline.git', ext: 'git', lang: 'Git Log', render: () => <TimelineFile />, text: TEXT.timeline },
    approvals: { label: 'APPROVALS.md', ext: 'md', lang: 'Markdown', render: () => <ApprovalsFile />, text: TEXT.approvals },
    stack: { label: 'stack.json', ext: 'json', lang: 'JSON', render: () => <StackFile />, text: TEXT.stack },
    certs: { label: 'certs.lock', ext: 'lock', lang: 'Lockfile', render: () => <CertsFile />, text: TEXT.certs },
    contact: { label: 'CONTACT.me', ext: 'me', lang: 'Plain Text', render: (ctx) => <ContactFile ctx={ctx} />, text: TEXT.contact },
  };
  experience.forEach((xp) => {
    files[xp.id] = { label: xp.tech.file, ext: 'md', lang: 'Markdown', render: () => <XpFile xp={xp} />, text: () => xpText(xp) };
  });
  PROJECTS.forEach((p) => {
    files[`p_${p.id}`] = {
      label: p.repo.length > 18 ? `${p.repo.slice(0, 17)}…` : p.repo,
      ext: 'repo',
      lang: 'Markdown',
      render: (ctx) => <RepoFile p={p} ctx={ctx} />,
      text: () => repoText(p),
    };
  });
  return files;
}

/* Search aliases per file, so the palette and terminal find "jpmc",
   "alibaba" or a ticker, not just the literal filename. */
export function fileAliases() {
  const a = {
    readme: ['about', 'home', 'me'],
    timeline: ['history', 'git', 'log', 'career'],
    approvals: ['testimonials', 'references', 'reviews'],
    stack: ['skills', 'languages', 'tools'],
    certs: ['certificates', 'licences', 'licenses'],
    contact: ['email', 'hire', 'linkedin', 'github', 'cv', 'resume'],
  };
  experience.forEach((xp) => { a[xp.id] = [xp.id, xp.org, xp.orgShort, xp.role]; });
  PROJECTS.forEach((p) => { a[`p_${p.id}`] = [p.sym, p.title, p.repo, ...p.skills]; });
  return a;
}

/* Terminal name lookup for `open <path>` */
export function openNames() {
  const names = {
    readme: 'readme.md',
    timeline: 'timeline.git',
    approvals: 'approvals.md',
    stack: 'stack.json',
    certs: 'certs.lock',
    contact: 'contact.me',
  };
  experience.forEach((xp) => (names[xp.id] = xp.tech.file.toLowerCase()));
  PROJECTS.forEach((p) => (names[`p_${p.id}`] = p.repo.toLowerCase()));
  return names;
}

/* Tree/tab icon per file type: a short coloured glyph, like an editor's
   file-icon theme. */
export function FileIcon({ ext }) {
  const map = { md: 'M↓', git: '⎇', json: '{}', lock: '⚿', me: '@', repo: '▤' };
  return <span className={`ico fi-${ext}`} aria-hidden="true">{map[ext] || '·'}</span>;
}
