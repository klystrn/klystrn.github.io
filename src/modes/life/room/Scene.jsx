import { useRef, useEffect, useMemo } from 'react';
import * as THREE from 'three';
import { useThree, useFrame } from '@react-three/fiber';
import { ContactShadows, Html, useCursor } from '@react-three/drei';
import life from '../../../data/life.json';
import {
  Floor, Walls, Desk, Monitors, DeskKit, Chair, Shelf, Plant, FloorLamp, Rug,
  CameraModel, WatchModel, CardDeckModel, NamecardModel,
  useChartTexture, useSkylineTexture,
} from './parts';

/* Interactive prop layout. `pos` is the world position of each prop. */
export const PROPS = {
  watch:    { pos: [-4.5, 2.38, 0.0], rot: [0, 0.25, 0], scale: 1.25, Model: WatchModel,    theme: '#3a2c14' },
  cards:    { pos: [-3.55, 2.52, 0.75],rot: [0, 0.4, 0], scale: 1.2,  Model: CardDeckModel, theme: '#7d1620' },
  namecard: { pos: [-2.65, 2.4, 1.4], rot: [0, 0.7, 0],  scale: 1.35, Model: NamecardModel, theme: '#0f1114' },
  camera:   { pos: [-1.5, 4.28, -5.55],rot: [0, 0.55, 0],scale: 1.15, Model: CameraModel,   theme: '#171a1f' },
};

function Prop({ id, hovered, onHover, onPick }) {
  const { pos, rot, scale, Model, theme } = PROPS[id];
  const grp = useRef();
  const light = useRef();
  const active = hovered === id;
  useCursor(active);

  useFrame((_, dt) => {
    const k = 1 - Math.pow(0.001, dt);
    const s = (active ? scale * 1.13 : scale);
    if (grp.current) {
      grp.current.scale.lerp(new THREE.Vector3(s, s, s), k);
      grp.current.position.y += ((active ? pos[1] + 0.12 : pos[1]) - grp.current.position.y) * k;
    }
    if (light.current) light.current.intensity += ((active ? 2.4 : 0) - light.current.intensity) * k;
  });

  return (
    <group>
      <group
        ref={grp}
        position={pos}
        rotation={rot}
        scale={scale}
        onPointerOver={(e) => { e.stopPropagation(); onHover(id); }}
        onPointerOut={(e) => { e.stopPropagation(); onHover(null); }}
        onClick={(e) => { e.stopPropagation(); onPick(id); }}
      >
        <Model />
      </group>
      <pointLight ref={light} position={[pos[0], pos[1] + 0.8, pos[2]]} color={theme === '#171a1f' ? '#ffffff' : '#ffd9a0'} intensity={0} distance={4} decay={2} />
    </group>
  );
}

/* Orthographic isometric camera: idle pointer-parallax, dive-to-prop on pick. */
function CameraRig({ zoomId, onArrived, reduced }) {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const basePos = useMemo(() => new THREE.Vector3(13, 11, 13), []);
  const look = useMemo(() => new THREE.Vector3(0, 3.2, 0), []);
  const pointer = useRef({ x: 0, y: 0 });
  const prog = useRef(0);
  const zoomBase = useRef(48);

  useEffect(() => {
    zoomBase.current = Math.max(28, Math.min(size.width, size.height) / 16.8);
    camera.position.copy(basePos);
    camera.zoom = zoomBase.current;
    camera.up.set(0, 1, 0);
    camera.lookAt(look);
    camera.updateProjectionMatrix();
  }, [camera, size, basePos, look]);

  useEffect(() => {
    if (reduced) return undefined;
    const on = (e) => {
      pointer.current.x = e.clientX / window.innerWidth - 0.5;
      pointer.current.y = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('pointermove', on);
    return () => window.removeEventListener('pointermove', on);
  }, [reduced]);

  useFrame((_, dt) => {
    if (zoomId) {
      prog.current = Math.min(prog.current + dt / (reduced ? 0.12 : 0.85), 1);
      const p = prog.current < 0.5 ? 4 * prog.current ** 3 : 1 - Math.pow(-2 * prog.current + 2, 3) / 2;
      const pv = new THREE.Vector3(...PROPS[zoomId].pos);
      const dir = basePos.clone().sub(look).normalize();
      const target = pv.clone().addScaledVector(dir, 6.5);
      camera.position.lerpVectors(basePos, target, p);
      camera.zoom = zoomBase.current + (zoomBase.current * 3.4) * p;
      const lk = look.clone().lerp(pv, p);
      camera.lookAt(lk);
      camera.updateProjectionMatrix();
      if (prog.current >= 1) onArrived(zoomId);
      return;
    }
    // idle parallax
    const tx = basePos.x + pointer.current.x * 1.6;
    const ty = basePos.y - pointer.current.y * 1.1;
    const k = 1 - Math.pow(0.02, dt);
    camera.position.x += (tx - camera.position.x) * k;
    camera.position.y += (ty - camera.position.y) * k;
    camera.lookAt(look);
    camera.updateProjectionMatrix();
  });
  return null;
}

function Tooltip({ id }) {
  const { pos } = PROPS[id];
  const d = life.objects[id];
  return (
    <Html position={[pos[0], pos[1] + 1.15, pos[2]]} center distanceFactor={undefined} zIndexRange={[40, 0]} style={{ pointerEvents: 'none' }}>
      <div className="room-tip">
        <div className="room-tip-title">{d.hoverTitle}</div>
        <p>{d.blurb}</p>
        <div className="room-tip-foot">
          <span className="room-tip-tag">{d.tag}</span>
          <span className="room-tip-cta">{d.cta} →</span>
        </div>
      </div>
    </Html>
  );
}

export default function Scene({ hovered, setHovered, onPick, zoomId, onArrived, reduced }) {
  const chart = useChartTexture();
  const skyline = useSkylineTexture();

  return (
    <>
      <CameraRig zoomId={zoomId} onArrived={onArrived} reduced={reduced} />

      {/* lighting */}
      <ambientLight intensity={0.75} color="#fff2e2" />
      <directionalLight
        castShadow
        position={[9, 15, 11]}
        intensity={2.1}
        color="#ffe9cf"
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0004}
      >
        <orthographicCamera attach="shadow-camera" args={[-14, 14, 14, -14, 0.1, 60]} />
      </directionalLight>
      <directionalLight position={[-8, 7, -3]} intensity={0.4} color="#aec4ff" />

      {/* soft ground blob under the whole room */}
      <ContactShadows position={[0, -0.58, 0]} scale={26} blur={2.6} far={9} opacity={0.55} color="#241708" resolution={1024} />

      {/* room + dressing */}
      <Floor />
      <Walls skyline={skyline} />
      <Desk />
      <Monitors chart={chart} />
      <DeskKit />
      <Chair />
      <FloorLamp />
      <Rug />
      <Shelf>
        <Plant position={[1.1, 0.35, 0]} scale={0.7} />
      </Shelf>
      <Plant position={[4.6, 0.2, 3.4]} scale={1.25} />

      {/* interactive props */}
      {Object.keys(PROPS).map((id) => (
        <Prop key={id} id={id} hovered={hovered} onHover={setHovered} onPick={onPick} />
      ))}

      {hovered && !zoomId && <Tooltip id={hovered} />}
    </>
  );
}
