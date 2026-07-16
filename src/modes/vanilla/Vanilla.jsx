import { useEffect, useRef, useState } from 'react';
import identity from '../../data/identity.json';
import experience from '../../data/experience.json';
import timeline from '../../data/timeline.json';
import awards from '../../data/awards.json';
import certs from '../../data/certs.json';
import headers from '../../data/headers.json';
import { FLAGSHIP, SUPPLEMENTARY } from '../../lib/projects';
import { useMode } from '../../chrome/ModeContext';
import { useReveal, useCountUp } from '../../lib/hooks';
import Constellation from './Constellation';
import Modal from './Modal';
import { ProgressBar, SectionRail, TestimonialsCarousel } from './Furniture';

function Stat({ n, label }) {
  const ref = useCountUp(n);
  return (
    <div className="stat">
      <div className="n" ref={ref}>0</div>
      <div className="l">{label}</div>
    </div>
  );
}

const MailIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z" /></svg>
);
const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" /></svg>
);
const GitHubIcon = () => (
  <svg viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z" /></svg>
);

export default function Vanilla() {
  const { setMode, seenModes, toast } = useMode();
  const rootRef = useReveal();
  const [modal, setModal] = useState(null);
  const tlRef = useRef(null);
  const fillRef = useRef(null);
  const c = identity.contact;

  // Timeline spine: fill height + lit nodes track scroll (prototype behaviour).
  useEffect(() => {
    const onScroll = () => {
      const body = tlRef.current;
      const fill = fillRef.current;
      if (!body || !fill) return;
      const r = body.getBoundingClientRect();
      const vh = innerHeight;
      fill.style.height = `${Math.min(Math.max((vh * 0.75 - r.top) / r.height, 0), 1) * 100}%`;
      body.querySelectorAll('.tl-item').forEach((it) => {
        it.classList.toggle('lit', it.getBoundingClientRect().top < vh * 0.75);
      });
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    return () => removeEventListener('scroll', onScroll);
  }, []);

  const cvClick = (e) => {
    e.preventDefault();
    if (c.cvUrl) window.open(c.cvUrl, '_blank');
    else toast('Wire to CV PDF');
  };

  const openProject = (p) =>
    setModal({
      title: p.title,
      meta: `${p.year} · ${p.role} · ${p.status}`,
      body: p.desc,
      skills: p.skills,
      stats: p.stats,
      private: p.private,
    });

  const openXp = (x) =>
    setModal({
      title: x.orgShort,
      meta: x.detail.meta,
      body: x.detail.body,
      skills: x.detail.skills,
      stats: x.detail.stats,
      private: x.detail.private,
    });

  const openCerts = () => {
    if (c.driveUrl) {
      window.open(c.driveUrl, '_blank');
      return;
    }
    const stats = Object.fromEntries(certs.map((x) => [x.short, x.year]));
    setModal({
      title: 'Certificates',
      meta: `${certs.length} verified · name and year`,
      body: 'The full set. This view becomes a Google Drive link once provided (content doc §14).',
      skills: [],
      stats,
    });
  };

  const curatedAwards = awards.filter((a) => a.curated);
  const curatedCerts = certs.filter((x) => x.curated);
  const moreCount = certs.length - curatedCerts.length;
  const seenTech = seenModes.has('tech');
  const seenFin = seenModes.has('finance');
  const tryMsg = seenTech && seenFin
    ? <>You&rsquo;ve seen every <span>lens</span>. Completionist. Respect.</>
    : seenTech
      ? <>One <span>lens</span> left: the brokerage view awaits.</>
      : seenFin
        ? <>One <span>lens</span> left: the repo view awaits.</>
        : <>Same story, two more <span>lenses</span>. You haven&rsquo;t tried them yet.</>;

  return (
    <div className="mv" ref={rootRef}>
      <ProgressBar />
      <SectionRail />
      <header className="hero" id="home">
        <div className="hero-grid" aria-hidden="true" />
        <div className="wrap hero-in">
          <div className="eyebrow">{identity.eyebrow}</div>
          <h1 dangerouslySetInnerHTML={{ __html: identity.positioningHtml }} />
          <p className="lede">{identity.lede}</p>
          <div className="cta">
            <a className="btn solid" href={c.cvUrl || '#'} onClick={cvClick}>Download résumé</a>
            <a className="btn line" href="#contact">Get in touch</a>
          </div>
        </div>
        <div className="cue">SCROLL ↓</div>
      </header>

      <section id="about">
        <div className="wrap">
          <div className="eyebrow reveal">{headers.about.eyebrow}</div>
          <h2 className="sec reveal">{headers.about.vanilla}</h2>
          <div className="about-grid">
            <div className="about-copy reveal">
              {identity.aboutHtml.map((p, i) => (
                <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
              ))}
              <div className="goal">{identity.goal}</div>
            </div>
            <div className="stats reveal">
              {identity.stats.map((s) => (
                <Stat key={s.key} n={s.n} label={s.label} />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="tl-sec" id="journey">
        <div className="wrap">
          <div className="eyebrow reveal">{headers.timeline.eyebrow}</div>
          <h2 className="sec reveal">{headers.timeline.vanilla}</h2>
          <p className="sec-sub reveal">{headers.timeline.vanillaSub}</p>
          <div className="tl-body" ref={tlRef}>
            <div className="spine" />
            <div className="spine-fill" ref={fillRef} />
            {timeline.phases.map((ph) => (
              <div className="tl-item" key={ph.phase}>
                <div className="tl-node" />
                <div className="tl-when">{ph.when}</div>
                <div className="tl-phase">{ph.phase}</div>
                <p className="tl-desc">{ph.desc}</p>
                <div className="tl-miles">
                  {ph.miles.map((m, i) => (
                    <div className="tl-mile" key={i}>
                      <b>{m.b}</b>{m.text}
                      <span>{m.when}</span>
                    </div>
                  ))}
                </div>
                <span className="tl-tag">{ph.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="experience">
        <div className="wrap">
          <div className="eyebrow reveal">{headers.experience.eyebrow}</div>
          <h2 className="sec reveal">{headers.experience.vanilla}</h2>
          <div className="xp">
            {experience.map((x) => (
              <div className="xp-card reveal" key={x.id} onClick={() => openXp(x)}>
                <div className="xp-when">{x.when}</div>
                <div>
                  <div className="xp-role">{x.role}</div>
                  <div className="xp-org">{x.org}</div>
                  <p className="xp-desc">{x.vanillaDesc}</p>
                  <div className="xp-hint">details →</div>
                </div>
                <span className="xp-tag">{x.vanillaTag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="projects">
        <div className="wrap">
          <div className="eyebrow reveal">{headers.projects.eyebrow}</div>
          <h2 className="sec reveal">{headers.projects.vanilla}</h2>
          <p className="sec-sub reveal">{headers.projects.vanillaSub}</p>
          <div className="pj-grid">
            {FLAGSHIP.map((p) => (
              <div
                className={`pj reveal ${p.card?.feat ? 'feat' : ''}`}
                key={p.sym}
                data-sym={p.sym}
                onClick={() => openProject(p)}
              >
                <span className="yr">{p.card?.yr || p.year}</span>
                <h3>{p.card?.title || p.title}</h3>
                <p>{p.card?.blurb || p.desc}</p>
                <div className="tags">
                  {(p.card?.tags || p.skills).map((t) => (
                    <span className="tag" key={t}>{t}</span>
                  ))}
                </div>
                <div className="more">details →</div>
              </div>
            ))}
          </div>
          <div className="eyebrow reveal" style={{ marginTop: 48 }}>Supplementary</div>
          <div className="pj-minis reveal">
            {SUPPLEMENTARY.map((p) => (
              <div className="pj-mini" key={p.sym}>
                <span className="yr">{p.year}</span>
                <span>
                  <b>{p.title}</b> <span className="d">· {p.mini?.blurb || p.desc}</span>
                </span>
                <span className="tg">{p.mini?.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Constellation header={headers.skills} />

      <section id="certs" style={{ paddingTop: 20 }}>
        <div className="wrap">
          <div className="aw-grid">
            <div className="reveal">
              <div className="eyebrow">{headers.awards.eyebrow}</div>
              {curatedAwards.map((a) => (
                <div className="cert" key={a.name}>
                  <span>{a.name}</span>
                  <span className="cy">{a.year}</span>
                </div>
              ))}
            </div>
            <div className="reveal">
              <div className="eyebrow">{headers.awards.certsEyebrow}</div>
              {curatedCerts.map((x) => (
                <div className="cert" key={x.slug}>
                  <span>{x.short}</span>
                  <span className="cy">{x.year}</span>
                </div>
              ))}
              <div className="cert">
                <button className="cert-more" onClick={openCerts}>
                  …and {moreCount} more · view all ↗
                </button>
                <span className="cy" />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials">
        <div className="wrap">
          <div className="eyebrow reveal">{headers.testimonials.eyebrow}</div>
          <h2 className="sec reveal">{headers.testimonials.vanilla}</h2>
          <TestimonialsCarousel />
        </div>
      </section>

      {!(seenTech && seenFin) && (
        <section className="try-modes">
          <div className="try-box reveal">
            <div className="t">{tryMsg}</div>
            <div className="try-btns">
              <button className={`try-btn ${seenTech ? 'done' : ''}`} onClick={() => setMode('tech')}>
                ⌘ open Tech mode
              </button>
              <button className={`try-btn ${seenFin ? 'done' : ''}`} onClick={() => setMode('finance')}>
                ▲ open Finance mode
              </button>
            </div>
          </div>
        </section>
      )}

      <section className="contact" id="contact">
        <div className="icon-btns">
          <a className="ibtn" href={`mailto:${c.email}`} aria-label="Email Reginald" title="Email"><MailIcon /></a>
          <a className="ibtn" href={c.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn profile" title="LinkedIn"><LinkedInIcon /></a>
          <a className="ibtn" href={c.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub profile" title="GitHub"><GitHubIcon /></a>
          <a className="btn line" href={c.cvUrl || '#'} onClick={cvClick}>Résumé</a>
        </div>
      </section>

      <div className="credit">Built by <b>{identity.name}</b></div>

      <Modal data={modal} onClose={() => setModal(null)} />
    </div>
  );
}
