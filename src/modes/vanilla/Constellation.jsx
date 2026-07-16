import { useEffect, useMemo, useRef, useState } from 'react';
import skills from '../../data/skills.json';
import { prefersReducedMotion } from '../../lib/hooks';

const { root: ROOT, hubs: HUBS, leaves: LEAVES, context: CTX, hubLinks } = skills;

/* Build the edge and node lists once — same layout maths as the prototype. */
function buildGraph() {
  const edges = [];
  const edge = (a, b, x, t, ia, ib) => edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, x, t, a: ia, b: ib });
  Object.entries(HUBS).forEach(([k, h], i) => edge(ROOT, h, false, 0.2 + i * 0.06, 'root', k));
  LEAVES.forEach((l, i) => edge(HUBS[l.cluster], l, false, 0.45 + (i / LEAVES.length) * 0.4, l.cluster, l.name));
  CTX.forEach((c) => {
    edge(HUBS[c.cluster], c, false, 0.7, c.cluster, c.name);
    edge(ROOT, c, true, 0.92, 'root', c.name);
  });
  hubLinks.forEach(([a, b]) => edge(HUBS[a], HUBS[b], true, 0.9, a, b));
  const leafByName = Object.fromEntries(LEAVES.map((l) => [l.name, l]));
  // Explicit skill↔skill links from the content doc's "Connects to" column.
  const seen = new Set();
  LEAVES.forEach((l) =>
    (l.connects_to || []).forEach((other) => {
      const key = [l.name, other].sort().join('|');
      if (seen.has(key) || !leafByName[other]) return;
      seen.add(key);
      edge(leafByName[l.name], leafByName[other], true, 0.95, l.name, other);
    })
  );

  const nodes = [
    { id: 'root', kind: 'rootn', x: ROOT.x, y: ROOT.y, r: 44, label: ROOT.label, fs: 12, t: 0, cap: ROOT.caption },
    ...Object.entries(HUBS).map(([k, h], i) => ({
      id: k, kind: 'hub', x: h.x, y: h.y, r: 31, label: h.label, fs: 9, t: 0.22 + i * 0.06,
      cap: `<b>${h.label}</b> cluster`,
    })),
    ...LEAVES.map((l, i) => ({
      id: l.name, kind: '', x: l.x, y: l.y, r: 7 + l.strength * 1.5, label: l.name,
      fs: 9 + l.strength * 0.9, t: 0.45 + (i / LEAVES.length) * 0.4,
      cap: `<b>${l.name}</b> · ${l.strength}/10 · ${l.evidence}`,
    })),
    ...CTX.map((c) => ({ id: c.name, kind: 'ctx', x: c.x, y: c.y, r: 16, label: c.name, fs: 10, t: 0.74, cap: c.caption })),
  ];
  return { edges, nodes };
}

const IDLE_CAP = 'scroll to expand · hover a node · click to pin its connections';

export default function Constellation({ header }) {
  const { edges, nodes } = useMemo(buildGraph, []);
  const outerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hotId, setHotId] = useState(null);
  const [pinned, setPinned] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const outer = outerRef.current;
      if (!outer) return;
      const reduced = prefersReducedMotion() || innerWidth < 768;
      const r = outer.getBoundingClientRect();
      const p = reduced ? 1 : Math.min(Math.max(-r.top / (r.height - innerHeight), 0), 1);
      setProgress(p);
    };
    onScroll();
    addEventListener('scroll', onScroll, { passive: true });
    addEventListener('resize', onScroll, { passive: true });
    return () => {
      removeEventListener('scroll', onScroll);
      removeEventListener('resize', onScroll);
    };
  }, []);

  const hot = useMemo(() => {
    if (!hotId) return null;
    const hotNodes = new Set([hotId]);
    const hotEdges = new Set();
    edges.forEach((e, i) => {
      if (e.a === hotId || e.b === hotId) {
        hotEdges.add(i);
        hotNodes.add(e.a === hotId ? e.b : e.a);
      }
    });
    return { nodes: hotNodes, edges: hotEdges };
  }, [hotId, edges]);

  const capNode = hotId ? nodes.find((n) => n.id === hotId) : null;
  const capHtml = capNode
    ? capNode.cap + (pinned ? ' <span style="opacity:.5">· pinned, click again to release</span>' : '')
    : IDLE_CAP;

  const ease = 1 - Math.pow(1 - progress, 2);
  const scale = 3.1 - 2.1 * ease;
  const fade = (t) => (progress >= t ? Math.min((progress - t) / 0.12, 1) : 0);

  // Nodes are still animating scale/opacity in until the scroll-driven zoom
  // finishes; hover/click before then reads as random flicker (mid-transition
  // nodes are oversized and only partially faded in), so gate interaction on
  // the constellation being fully zoomed out.
  const settled = progress >= 1;
  useEffect(() => {
    if (!settled) {
      setHotId(null);
      setPinned(false);
    }
  }, [settled]);

  const enter = (id) => { if (settled && !pinned) setHotId(id); };
  const leave = () => { if (!pinned) setHotId(null); };
  const click = (e, id) => {
    e.stopPropagation();
    if (!settled) return;
    if (pinned && hotId === id) { setPinned(false); setHotId(null); return; }
    setPinned(true);
    setHotId(id);
  };

  return (
    <section className="sk-outer" id="skills" ref={outerRef}>
      <div className="sk-sticky">
        <div className="sk-head">
          <div className="eyebrow">{header.eyebrow}</div>
          <h2 className="sec">{header.vanilla}</h2>
        </div>
        <svg
          id="constel"
          viewBox="0 0 1000 640"
          role="img"
          aria-label="Skills constellation"
          className={hotId ? 'dimmed' : ''}
          onClick={() => { if (pinned) { setPinned(false); setHotId(null); } }}
        >
          <g transform={`translate(${ROOT.x} ${ROOT.y}) scale(${scale}) translate(${-ROOT.x} ${-ROOT.y})`}>
            {edges.map((e, i) => (
              <line
                key={i}
                className={`cn-edge ${e.x ? 'x' : ''} ${hot && hot.edges.has(i) ? 'hot' : ''}`}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                style={{ opacity: fade(e.t) }}
              />
            ))}
            {nodes.map((n) => (
              <g
                key={n.id}
                className={`cn-node ${n.kind} ${hot && hot.nodes.has(n.id) ? 'hot' : ''}`}
                style={{ opacity: fade(n.t), pointerEvents: settled ? 'auto' : 'none' }}
                onMouseEnter={() => enter(n.id)}
                onMouseLeave={leave}
                onClick={(e) => click(e, n.id)}
              >
                <circle cx={n.x} cy={n.y} r={n.r} />
                <text
                  x={n.x}
                  y={n.kind === 'rootn' || n.kind === 'hub' ? n.y + 4 : n.kind === 'ctx' ? n.y - 30 : n.y - n.r - 12}
                  fontSize={n.fs}
                >
                  {n.label}
                </text>
              </g>
            ))}
          </g>
        </svg>
        <div className="sk-caption" dangerouslySetInnerHTML={{ __html: capHtml }} />
      </div>
    </section>
  );
}
