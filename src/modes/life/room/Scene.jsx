import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame, invalidate } from '@react-three/fiber';
import { ContactShadows, Html, useCursor } from '@react-three/drei';
import life from '../../../data/life.json';
import {
  Floor, Walls, Desk, Monitors, CustomKeyboard, DeskExtras, Chair, Sofa, TrophyCabinet,
  Shelf, Plant, FloorLamp,
  CameraModel, WatchModel, CardDeckModel, NamecardModel,
  useChartTexture, useSkylineTexture,
} from './parts';

/* Interactive elements. kind:'nav' navigates on click; kind:'info' is
   hover-only. `tipAt` overrides where the tooltip floats. */
export const PROPS = {
  work:     { pos: [-4.6, 3.3, -0.4], hit: [2.5, 2.6, 3.6], theme: '#141821', kind: 'nav', tipAt: [-4.7, 4.7, -0.5] },
  camera:   { pos: [-1.7, 4.3, -5.45], rot: [0, 0.5, 0], scale: 1.15, Model: CameraModel, theme: '#171a1f', kind: 'nav' },
  watch:    { pos: [-2.55, 2.42, 2.0], rot: [0, 0.25, 0], scale: 1.25, Model: WatchModel, theme: '#3a2c14', kind: 'nav' },
  cards:    { pos: [-2.55, 2.56, 0.9], rot: [0, 0.4, 0], scale: 1.2, Model: CardDeckModel, theme: '#7d1620', kind: 'nav' },
  namecard: { pos: [-2.55, 2.42, -0.2], rot: [0, 0.7, 0], scale: 1.3, Model: NamecardModel, theme: '#0f1114', kind: 'nav' },
  trophy:   { pos: [3.4, 0, -5.35], cabinet: true, theme: '#241a12', kind: 'info', tipAt: [3.4, 5.6, -5.1] },
};

const HOVER_LIGHT = { work: '#8fb4ff', camera: '#ffffff', watch: '#ffd9a0', cards: '#ff9aa0', namecard: '#ffffff', trophy: '#ffcf87' };

function Prop({ id, hovered, onHover, onPick }) {
  const cfg = PROPS[id];
  const active = hovered === id;
  useCursor(active);
  const grp = useRef();

  useFrame((_, dt) => {
    if (!grp.current || !cfg.Model) return;
    const k = 1 - Math.pow(0.0016, dt);
    const target = active ? cfg.scale * 1.14 : cfg.scale;
    const ns = grp.current.scale.x + (target - grp.current.scale.x) * k;
    grp.current.scale.setScalar(ns);
    const ty = active ? cfg.pos[1] + 0.14 : cfg.pos[1];
    grp.current.position.y += (ty - grp.current.position.y) * k;
    if (Math.abs(target - ns) > 0.001 || Math.abs(ty - grp.current.position.y) > 0.001) invalidate();
  });

  const events = {
    onPointerOver: (e) => { e.stopPropagation(); onHover(id); },
    onPointerOut: (e) => { e.stopPropagation(); onHover(null); },
    onClick: (e) => { e.stopPropagation(); if (cfg.kind === 'nav') onPick(id); },
  };

  if (cfg.Model) {
    const Model = cfg.Model;
    return <group ref={grp} position={cfg.pos} rotation={cfg.rot} scale={cfg.scale} {...events}><Model /></group>;
  }
  if (cfg.cabinet) {
    return <group position={cfg.pos} {...events}><TrophyCabinet glow={active ? 1.4 : 0} /></group>;
  }
  // invisible click/hover volume over the monitors + keyboard
  return (
    <mesh position={cfg.pos} {...events}>
      <boxGeometry args={cfg.hit} />
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}

/* Freeze the shadow map after the first render — the room is static, so
   re-computing shadows every frame is pure waste on low-end GPUs. */
function StaticShadows() {
  const gl = useThree((s) => s.gl);
  useEffect(() => {
    gl.shadowMap.autoUpdate = false;
    gl.shadowMap.needsUpdate = true;
    invalidate();
  }, [gl]);
  return null;
}

function CameraRig({ zoomId, onArrived, reduced }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const basePos = useMemo(() => new THREE.Vector3(13, 11, 13), []);
  const look = useMemo(() => new THREE.Vector3(0, 3.2, 0), []);
  const pointer = useRef({ x: 0, y: 0 });
  const prog = useRef(0);
  const zoomBase = useRef(46);

  useEffect(() => {
    zoomBase.current = Math.max(26, Math.min(size.width, size.height) / 17.5);
    camera.position.copy(basePos);
    camera.zoom = zoomBase.current;
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.updateProjectionMatrix();
    invalidate();
  }, [camera, size, basePos, look]);

  useEffect(() => {
    if (reduced) return undefined;
    const on = (e) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
      invalidate();
    };
    window.addEventListener('pointermove', on);
    return () => window.removeEventListener('pointermove', on);
  }, [reduced]);

  useFrame((_, dt) => {
    if (zoomId) {
      prog.current = Math.min(prog.current + dt / (reduced ? 0.12 : 0.85), 1);
      const p = prog.current < 0.5 ? 4 * prog.current ** 3 : 1 - Math.pow(-2 * prog.current + 2, 3) / 2;
      const pv = new THREE.Vector3(...(PROPS[zoomId].tipAt || PROPS[zoomId].pos));
      const dir = basePos.clone().sub(look).normalize();
      const target = pv.clone().addScaledVector(dir, 6.5);
      camera.position.lerpVectors(basePos, target, p);
      camera.zoom = zoomBase.current + zoomBase.current * 3.4 * p;
      camera.lookAt(look.clone().lerp(pv, p));
      camera.updateProjectionMatrix();
      if (prog.current >= 1) onArrived(zoomId); else invalidate();
      return;
    }
    const tx = basePos.x + pointer.current.x * 1.6;
    const ty = basePos.y - pointer.current.y * 1.1;
    const k = 1 - Math.pow(0.02, dt);
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.lookAt(look);
    camera.updateProjectionMatrix();
    if (Math.abs(tx - camera.position.x) > 0.002 || Math.abs(ty - camera.position.y) > 0.002) invalidate();
  });
  return null;
}

function BlurbTip({ d }) {
  return (
    <div className="room-tip">
      <div className="room-tip-title">{d.hoverTitle}</div>
      <p>{d.blurb}</p>
      <div className="room-tip-foot">
        <span className="room-tip-tag">{d.tag}</span>
        <span className="room-tip-cta">{d.cta} →</span>
      </div>
    </div>
  );
}

function AwardsTip({ d }) {
  const t = life.trophies;
  const col = (title, list) => (
    <div className="room-awards-col">
      <div className="room-awards-h">{title}</div>
      {list.map((a, i) => (
        <div className="room-awards-row" key={i}><span className="yr">{a.year}</span><span>{a.name}</span></div>
      ))}
    </div>
  );
  return (
    <div className="room-tip room-tip-wide">
      <div className="room-tip-title">{d.hoverTitle}</div>
      <div className="room-awards">{col('Taekwondo', t.taekwondo)}{col('Diving', t.diving)}</div>
    </div>
  );
}

function Tooltip({ id }) {
  const cfg = PROPS[id];
  const anchor = cfg.tipAt || [cfg.pos[0], cfg.pos[1] + 1.15, cfg.pos[2]];
  const d = life.objects[id];
  return (
    <Html position={anchor} center zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
      {id === 'trophy' ? <AwardsTip d={d} /> : <BlurbTip d={d} />}
    </Html>
  );
}

export default function Scene({ hovered, setHovered, onPick, zoomId, onArrived, reduced }) {
  const chart = useChartTexture();
  const skyline = useSkylineTexture();

  // nudge one render when hover/zoom state changes (demand mode)
  useEffect(() => { invalidate(); }, [hovered, zoomId]);

  return (
    <>
      <StaticShadows />
      <CameraRig zoomId={zoomId} onArrived={onArrived} reduced={reduced} />

      <ambientLight intensity={0.72} color="#ffe6c8" />
      <directionalLight
        castShadow position={[9, 15, 11]} intensity={2.15} color="#ffdcae"
        shadow-mapSize={[1024, 1024]} shadow-bias={-0.0005}
      >
        <orthographicCamera attach="shadow-camera" args={[-14, 14, 14, -14, 0.1, 60]} />
      </directionalLight>
      <directionalLight position={[-8, 7, -3]} intensity={0.32} color="#8aa0d0" />

      <ContactShadows position={[0, -0.58, 0]} scale={26} blur={2.5} far={9} opacity={0.5} color="#0a0602" resolution={512} frames={1} />

      <Floor />
      <Walls skyline={skyline} />
      <Desk />
      <Monitors chart={chart} />
      <CustomKeyboard />
      <DeskExtras />
      <Chair />
      <Sofa position={[2.7, 0, 2.5]} rotation={[0, -0.55, 0]} />
      <FloorLamp />
      <Shelf><Plant position={[1.05, 0.35, 0]} scale={0.62} /></Shelf>

      {Object.keys(PROPS).map((id) => (
        <Prop key={id} id={id} hovered={hovered} onHover={setHovered} onPick={onPick} />
      ))}

      {hovered && !zoomId && <pointLight position={PROPS[hovered].pos} color={HOVER_LIGHT[hovered]} intensity={2.2} distance={4.5} decay={2} />}
      {hovered && !zoomId && <Tooltip id={hovered} />}
    </>
  );
}
