import { useEffect, useMemo, useRef, useState } from 'react';
import skills from '../../data/skills.json';
import { prefersReducedMotion } from '../../lib/hooks';

const { root: ROOT, hubs: HUBS, subhubs: SUBHUBS, leaves: LEAVES } = skills;

/* Canvas + ring radii for the radial tree. root → hub → sub-hub → leaf. */
const VIEW = { w: 1300, h: 1000, cx: 650, cy: 480 };
const RH = 155; // hub ring
const RS = 300; // sub-hub ring / direct-leaf ring
const RL = 415; // leaf-under-sub-hub ring
const STAG = 130; // every other leaf pushed out a ring, so close labels never collide
const D2R = Math.PI / 180;
const at = (r, deg) => [VIEW.cx + r * Math.cos(deg * D2R), VIEW.cy + r * Math.sin(deg * D2R)];

/* Compute node positions + edges from the hierarchy. Angular room for each
   branch is proportional to its leaf count, so dense clusters (TECH) fan wide
   and sparse ones (OPS) stay tight; labels are anchored outward at render time
   so text radiates away from the centre and never lands on the graph. */
function buildGraph() {
  const leafByParent = {};
  LEAVES.forEach((l) => { (leafByParent[l.parent] ||= []).push(l); });
  const subByHub = {};
  SUBHUBS.forEach((s) => { (subByHub[s.hub] ||= []).push(s); });
  const subWeight = (s) => (leafByParent[s.id] || []).length || 1;

  const nodes = [];
  const edges = [];
  const push = (n) => { nodes.push(n); return n; };
  const link = (a, b, dashed, t, ta, tb) =>
    edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y, x: dashed, t, a: ta, b: tb });

  const rootN = push({ id: 'root', kind: 'rootn', x: VIEW.cx, y: VIEW.cy, r: 42, label: ROOT.label, fs: 12, ang: 0, t: 0, cap: ROOT.caption });

  // Partition the full circle into non-overlapping sectors sized by each hub's
  // leaf count, so a dense cluster (TECH) gets a wide wedge and a sparse one
  // (OPS) a narrow one — and every descendant stays inside its hub's wedge, so
  // clusters never bleed into each other. START is tuned so AI lands at the top.
  const hubWeight = (h) =>
    (subByHub[h.id] || []).reduce((a, s) => a + subWeight(s), 0) + (leafByParent[h.id] || []).length;
  const hubById = Object.fromEntries(HUBS.map((h) => [h.id, h]));
  const ordered = ['ai', 'trade', 'media', 'pm', 'tech'].map((id) => hubById[id]).filter(Boolean);
  const totalHubW = ordered.reduce((a, h) => a + hubWeight(h), 0) || 1;
  const START = 236.25;
  const sector = {};
  let sc = START;
  ordered.forEach((h) => { const w = (360 * hubWeight(h)) / totalHubW; sector[h.id] = { start: sc, w }; sc += w; });

  ordered.forEach((h, hi) => {
    const sec = sector[h.id];
    const center = sec.start + sec.w / 2;
    const [hx, hy] = at(RH, center);
    const hubN = push({ id: h.id, kind: 'hub', x: hx, y: hy, r: 30, label: h.label, fs: 9, ang: center, t: 0.2 + hi * 0.04, cap: `<b>${h.label}</b> cluster` });
    link(rootN, hubN, false, 0.14 + hi * 0.03, 'root', h.id);

    const subs = subByHub[h.id] || [];
    const directLeaves = leafByParent[h.id] || [];
    const span = sec.w * 0.92; // small gutter between adjacent hubs' outer leaves

    // spread a set of leaves edge-to-edge across [a, a+w], with radius stagger
    const fanLeaves = (list, a, w, ring, parent, pid) => {
      const n = list.length;
      const a0 = a + (w - (n > 1 ? w : 0)) / 2;
      const step = n > 1 ? w / (n - 1) : 0;
      list.forEach((l, i) => {
        const lang = n > 1 ? a0 + step * i : a + w / 2;
        const [lx, ly] = at(ring + (i % 2) * STAG, lang);
        const leafN = push(leafNode(l, lx, ly, lang));
        link(parent, leafN, false, 0.5, pid, l.name);
      });
    };

    if (subs.length === 0) {
      // Pure-leaf hub: fan its leaves across the whole sector for max spacing.
      fanLeaves(directLeaves, center - span / 2, span, RS, hubN, h.id);
    } else {
      // Mixed hub: split the sector between sub-hubs and direct leaves by weight.
      const kids = [
        ...subs.map((s) => ({ type: 'sub', ref: s, w: subWeight(s) })),
        ...directLeaves.map((l) => ({ type: 'leaf', ref: l, w: 1 })),
      ];
      const totalW = kids.reduce((acc, k) => acc + k.w, 0) || 1;
      let cursor = center - span / 2;
      let di = 0;
      kids.forEach((k) => {
        const slice = (span * k.w) / totalW;
        const cAng = cursor + slice / 2;
        if (k.type === 'sub') {
          const s = k.ref;
          const [sx, sy] = at(RS, cAng);
          const subN = push({ id: s.id, kind: 'subhub', x: sx, y: sy, r: 16, label: s.label, fs: 9, ang: cAng, t: 0.38, cap: `<b>${s.label}</b> · ${h.label} sub-cluster` });
          link(hubN, subN, false, 0.34, h.id, s.id);
          fanLeaves(leafByParent[s.id] || [], cAng - (slice * 0.7) / 2, slice * 0.7, RL, subN, s.id);
        } else {
          const [lx, ly] = at(RS + (di % 2) * STAG, cAng);
          di += 1;
          const leafN = push(leafNode(k.ref, lx, ly, cAng));
          link(hubN, leafN, false, 0.5, h.id, k.ref.name);
        }
        cursor += slice;
      });
    }
  });

  // Cross-cluster links: "also" memberships + explicit skill↔skill "connects_to".
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const subByLabel = Object.fromEntries(SUBHUBS.map((s) => [s.label, s.id]));
  const resolve = (name) => byId[name] || byId[subByLabel[name]] || null;
  const seen = new Set();
  const xlink = (a, b) => {
    if (!a || !b || a.id === b.id) return;
    const key = [a.id, b.id].sort().join('|');
    if (seen.has(key)) return;
    seen.add(key);
    link(a, b, true, 0.64, a.id, b.id);
  };
  LEAVES.forEach((l) => {
    const self = byId[l.name];
    (l.also || []).forEach((sid) => xlink(self, byId[sid]));
    (l.connects_to || []).forEach((t) => xlink(self, resolve(t)));
  });

  return { edges, nodes };
}

function leafNode(l, x, y, ang) {
  return {
    id: l.name, kind: 'leaf', x, y, r: 6 + l.strength, label: l.name,
    fs: 9 + l.strength * 0.35, ang, t: 0.5,
    cap: `<b>${l.name}</b> · ${l.strength}/10 · ${l.evidence}`,
  };
}

/* Where a node's text sits: hubs/root centre their label; everything else
   radiates outward (left/right when off to the side, above/below at top/bottom)
   so labels lead away from the graph interior. */
function labelPos(n) {
  if (n.kind === 'rootn' || n.kind === 'hub') return { x: n.x, y: n.y + 4, anchor: 'middle' };
  // Sub-hubs sit at a fixed, fairly large radius with several lines converging
  // on them, so they need more breathing room than a small leaf dot does.
  const pad = n.kind === 'subhub' ? 15 : 8;
  const c = Math.cos(n.ang * D2R);
  const s = Math.sin(n.ang * D2R);
  if (Math.abs(c) > 0.1) {
    return c > 0
      ? { x: n.x + n.r + pad, y: n.y + 4, anchor: 'start' }
      : { x: n.x - n.r - pad, y: n.y + 4, anchor: 'end' };
  }
  return { x: n.x, y: s < 0 ? n.y - n.r - pad - 2 : n.y + n.r + pad + 7, anchor: 'middle' };
}

const IDLE_CAP = 'scroll to expand · hover a node · click to pin its connections';

export default function Constellation({ header }) {
  const { edges, nodes } = useMemo(buildGraph, []);
  const outerRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [hotId, setHotId] = useState(null);
  const [pinned, setPinned] = useState(false);
  const [hint, setHint] = useState(false); // one-shot "it's interactive" nudge
  const hintShown = useRef(false);

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

  // Gate interaction until the scroll-driven zoom finishes — mid-transition
  // nodes are oversized and only partially faded in, so hovering then flickers.
  const settled = progress >= 1;
  useEffect(() => {
    if (!settled) {
      setHotId(null);
      setPinned(false);
    }
  }, [settled]);

  // Once the zoom-in settles, the graph becomes interactive — but that's not
  // obvious, so flash a one-time nudge that auto-clears (or clears the moment
  // the user actually touches a node).
  useEffect(() => {
    if (settled && !hintShown.current) {
      hintShown.current = true;
      setHint(true);
      const t = setTimeout(() => setHint(false), 3200);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [settled]);
  const dismissHint = () => { if (hint) setHint(false); };

  const enter = (id) => { dismissHint(); if (settled && !pinned) setHotId(id); };
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
          <h2 className="sec">{header.paper}</h2>
        </div>
        <svg
          id="constel"
          viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
          role="img"
          aria-label="Skills constellation"
          className={hotId ? 'dimmed' : ''}
          onClick={() => { dismissHint(); if (pinned) { setPinned(false); setHotId(null); } }}
        >
          <g transform={`translate(${VIEW.cx} ${VIEW.cy}) scale(${scale}) translate(${-VIEW.cx} ${-VIEW.cy})`}>
            {edges.map((e, i) => (
              <line
                key={i}
                className={`cn-edge ${e.x ? 'x' : ''} ${hot && hot.edges.has(i) ? 'hot' : ''}`}
                x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2}
                style={{ opacity: fade(e.t) * (e.x ? 0.4 : 1) }}
              />
            ))}
            {nodes.map((n) => {
              const lp = labelPos(n);
              return (
                <g
                  key={n.id}
                  className={`cn-node ${n.kind} ${hot && hot.nodes.has(n.id) ? 'hot' : ''}`}
                  style={{ opacity: fade(n.t), pointerEvents: settled ? 'auto' : 'none' }}
                  onMouseEnter={() => enter(n.id)}
                  onMouseLeave={leave}
                  onClick={(e) => click(e, n.id)}
                >
                  <circle cx={n.x} cy={n.y} r={n.r} />
                  <text x={lp.x} y={lp.y} fontSize={n.fs} textAnchor={lp.anchor}>{n.label}</text>
                </g>
              );
            })}
          </g>
        </svg>
        <div className={`sk-nudge ${hint ? 'show' : ''}`} aria-hidden="true">hover a node to explore</div>
        <div className="sk-caption" dangerouslySetInnerHTML={{ __html: capHtml }} />
      </div>
    </section>
  );
}
