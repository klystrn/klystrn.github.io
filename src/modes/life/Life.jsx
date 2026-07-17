import { Component, Suspense, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import life from '../../data/life.json';
import { prefersReducedMotion } from '../../lib/hooks';
import Scene, { PROPS } from './room/Scene';

const ROUTE = {
  photography: '/life/photography',
  watch: '/life/watch',
  cards: '/life/cards',
  professional: '/',
};
const routeFor = (id) => ROUTE[life.objects[id].route] || '/';

function hasWebGL() {
  try {
    const c = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (c.getContext('webgl') || c.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

/* If WebGL throws (unsupported GPU, blocked context), fall back to a plain
   list of the same destinations instead of a blank canvas. */
class GLBoundary extends Component {
  constructor(p) { super(p); this.state = { dead: false }; }
  static getDerivedStateFromError() { return { dead: true }; }
  render() { return this.state.dead ? this.props.fallback : this.props.children; }
}

function Fallback() {
  return (
    <div className="room-fallback">
      <div className="life-eyebrow">{life.intro.eyebrow}</div>
      <h1>{life.intro.title}</h1>
      <p>{life.intro.sub}</p>
      <div className="room-fallback-links">
        {['camera', 'watch', 'cards', 'namecard'].map((id) => (
          <Link key={id} to={routeFor(id)} className="room-fallback-link">
            <b>{life.objects[id].label}</b>
            <span>{life.objects[id].cta} →</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Life() {
  const navigate = useNavigate();
  const [hovered, setHovered] = useState(null);
  const [zoomId, setZoomId] = useState(null);
  const reduced = prefersReducedMotion();

  const onPick = useCallback(
    (id) => {
      if (reduced) { navigate(routeFor(id)); return; }
      setHovered(null);
      setZoomId(id);
    },
    [navigate, reduced]
  );

  const onArrived = useCallback((id) => navigate(routeFor(id)), [navigate]);

  if (!hasWebGL()) return <div className="room-scene"><Fallback /></div>;

  return (
    <div className="room-scene">
      <div className={`room-head ${zoomId ? 'gone' : ''}`}>
        <div className="life-eyebrow">{life.intro.eyebrow}</div>
        <h1>{life.intro.title}</h1>
        <p>{life.intro.sub}</p>
      </div>

      <GLBoundary fallback={<Fallback />}>
        <Canvas
          className="room-canvas"
          shadows
          orthographic
          frameloop="demand"
          dpr={[1, 1.6]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance', preserveDrawingBuffer: false }}
          camera={{ position: [13, 11, 13], zoom: 46, near: 0.1, far: 200 }}
        >
          <Suspense fallback={null}>
            <Scene
              hovered={hovered}
              setHovered={setHovered}
              onPick={onPick}
              zoomId={zoomId}
              onArrived={onArrived}
              reduced={reduced}
            />
          </Suspense>
        </Canvas>
      </GLBoundary>

      {/* wash to the prop's theme colour as the camera dives in */}
      <div
        className="room-zoom-overlay"
        style={{ background: zoomId ? PROPS[zoomId].theme : 'transparent', opacity: zoomId ? 1 : 0 }}
      />

      <div className={`room-hint ${zoomId ? 'gone' : ''}`}>Hover to inspect · click to step inside</div>
    </div>
  );
}
