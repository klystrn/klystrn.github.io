import identity from '../../data/identity.json';
import experience from '../../data/experience.json';
import timeline from '../../data/timeline.json';
import certs from '../../data/certs.json';
import testimonials from '../../data/testimonials.json';
import skills from '../../data/skills.json';
import { PROJECTS } from '../../lib/projects';

/*
 * Editor views. `ctx` = { openFile, openDir, gotoFinance, toast, cvClick }.
 * Every fact rendered here comes from src/data — components are furniture only.
 */

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
        <li>Career history: <code className="flink" onClick={() => ctx.openFile('timeline')}>timeline.git</code></li>
        <li>References: <code className="flink" onClick={() => ctx.openFile('approvals')}>APPROVALS.md</code></li>
        <li>
          Repos in <code className="flink" onClick={() => ctx.openDir('proj')}>projects/</code> · Reach me:{' '}
          <code className="flink" onClick={() => ctx.openFile('contact')}>CONTACT.me</code>
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
          <h2>{xp.id === 'saf' ? 'Notes' : 'Highlights'}</h2>
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

function StackFile() {
  const s = skills.stack;
  const arr = (a) => (
    <>
      <span className="p">[</span>
      {a.map((v, i) => (
        <span key={v}>
          <span className="s">"{v}"</span>
          {i < a.length - 1 && <span className="p">, </span>}
        </span>
      ))}
      <span className="p">]</span>
    </>
  );
  const keys = Object.entries(s).filter(([, v]) => Array.isArray(v));
  return (
    <div className="json">
      <span className="p">{'{'}</span>
      <br />
      {keys.map(([k, v]) => (
        <span key={k}>
          &nbsp;&nbsp;<span className="k">"{k}"</span>
          <span className="p">:</span> {arr(v)}
          <span className="p">,</span>
          <br />
        </span>
      ))}
      &nbsp;&nbsp;<span className="k">"years_writing_code"</span>
      <span className="p">:</span> <span className="n">{s.years_writing_code}</span>{' '}
      <span className="cm">// proprietary stacks (Athena, Hydra, Sigma) live in the repos</span>
      <br />
      <span className="p">{'}'}</span>
    </div>
  );
}

function CertsFile() {
  return (
    <div className="md">
      <h1>certs.lock</h1>
      <p style={{ opacity: 0.55 }}># verified dependencies, do not edit by hand</p>
      {certs.map((c) => (
        <div className="kv-line" key={c.slug}>
          <span className="k">{c.slug}</span>
          <span className="v">"{c.year}" ✓</span>
        </div>
      ))}
    </div>
  );
}

function TimelineFile() {
  const COMMITS = timeline.commits;
  const row = 44;
  const H = COMMITS.length * row;
  return (
    <div className="md">
      <h1>git log --graph --all</h1>
      <p style={{ opacity: 0.55 }}># branches: sst · np · work · saf · trade · xtra</p>
      <div className="graph-wrap">
        <svg className="graph-svg" width="60" height={H} viewBox={`0 0 60 ${H}`}>
          <line x1="26" y1={row / 2} x2="26" y2={H - row / 2} stroke="#56d4dd" strokeWidth="2" opacity=".35" />
          {COMMITS.map((c, i) => (
            <circle key={c.hash} cx="26" cy={i * row + row / 2} r="5.5" fill="#0b0e14" stroke={c.c} strokeWidth="2.5" />
          ))}
        </svg>
        <div className="commits">
          {COMMITS.map((c) => (
            <div className="commit" key={c.hash}>
              <span className="hash">{c.hash}</span>
              <span className="msg"><span className="tag">{c.tag}</span>{c.msg}</span>
              <span className="when">{c.when}</span>
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

function RepoFile({ p, ctx }) {
  return (
    <div className="md">
      <div className="repo-head">
        <h1>{p.repo}</h1>
        <span className="vis">public</span>
      </div>
      <div className="badges">
        <span className="badge b-gr">✓ {p.status}</span>
        <span className="badge b-vi">{p.year}</span>
        <span className="badge">{p.role}</span>
      </div>
      <p>{p.desc}</p>
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
      <h2>Stack</h2>
      <div className="badges">
        {p.skills.map((s) => (
          <span key={s} className="badge b-cy">{s}</span>
        ))}
      </div>
      <div className="repo-meta">
        <span>⎇ <b>main</b></span>
        <span className="flink" onClick={() => ctx.gotoFinance(p.sym)}>
          also listed as <b>${p.sym}</b> in Finance mode →
        </span>
      </div>
    </div>
  );
}

/* File registry: id → { label, render } */
export function buildFiles() {
  const files = {
    readme: { label: 'README.md', render: (ctx) => <Readme ctx={ctx} /> },
    timeline: { label: 'timeline.git', render: () => <TimelineFile /> },
    approvals: { label: 'APPROVALS.md', render: () => <ApprovalsFile /> },
    stack: { label: 'stack.json', render: () => <StackFile /> },
    certs: { label: 'certs.lock', render: () => <CertsFile /> },
    contact: { label: 'CONTACT.me', render: (ctx) => <ContactFile ctx={ctx} /> },
  };
  experience.forEach((xp) => {
    files[xp.id] = { label: xp.tech.file, render: () => <XpFile xp={xp} /> };
  });
  PROJECTS.forEach((p) => {
    files[`p_${p.id}`] = {
      label: p.repo.length > 18 ? `${p.repo.slice(0, 17)}…` : p.repo,
      render: (ctx) => <RepoFile p={p} ctx={ctx} />,
    };
  });
  return files;
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
