import { useMemo } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

/* ============================================================= *
 *  Textured screens: a live-looking candlestick chart + a night
 *  skyline, drawn once to a canvas and reused as emissive maps.
 * ============================================================= */
function canvasTexture(draw, w = 512, h = 320) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function useChartTexture() {
  return useMemo(
    () =>
      canvasTexture((g, w, h) => {
        g.fillStyle = '#0a0e15';
        g.fillRect(0, 0, w, h);
        // grid
        g.strokeStyle = 'rgba(120,140,170,.10)';
        g.lineWidth = 1;
        for (let x = 0; x <= w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
        for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
        // candles
        const n = 26, pad = 20, cw = (w - pad * 2) / n;
        let price = h * 0.55;
        const pts = [];
        for (let i = 0; i < n; i++) {
          const open = price;
          price += (Math.sin(i * 0.9) * 10) + (Math.random() - 0.48) * 26;
          price = Math.max(40, Math.min(h - 40, price));
          const close = price;
          const up = close < open; // lower y = higher price
          const hi = Math.min(open, close) - (6 + Math.random() * 14);
          const lo = Math.max(open, close) + (6 + Math.random() * 14);
          const cx = pad + cw * (i + 0.5);
          g.strokeStyle = up ? '#2fd17a' : '#f0524f';
          g.fillStyle = up ? '#2fd17a' : '#f0524f';
          g.lineWidth = 1.5;
          g.beginPath(); g.moveTo(cx, hi); g.lineTo(cx, lo); g.stroke();
          g.fillRect(cx - cw * 0.3, Math.min(open, close), cw * 0.6, Math.max(2, Math.abs(close - open)));
          pts.push([cx, (open + close) / 2]);
        }
        // moving-average line
        g.strokeStyle = 'rgba(245,185,66,.9)';
        g.lineWidth = 2;
        g.beginPath();
        pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
        g.stroke();
        // ticker header
        g.fillStyle = '#dfe6f2';
        g.font = '600 20px monospace';
        g.fillText('SPX  ·  1D', 20, 30);
        g.fillStyle = '#2fd17a';
        g.font = '600 16px monospace';
        g.fillText('▲ +1.24%', w - 130, 30);
      }),
    []
  );
}

export function useSkylineTexture() {
  return useMemo(
    () =>
      canvasTexture((g, w, h) => {
        const grd = g.createLinearGradient(0, 0, 0, h);
        grd.addColorStop(0, '#2a3350');
        grd.addColorStop(0.6, '#3d3a55');
        grd.addColorStop(1, '#5a4a5e');
        g.fillStyle = grd;
        g.fillRect(0, 0, w, h);
        // buildings
        for (let i = 0; i < 26; i++) {
          const bw = 22 + Math.random() * 40;
          const bh = 60 + Math.random() * 180;
          const x = (i / 26) * w + (Math.random() - 0.5) * 10;
          g.fillStyle = `rgba(12,16,26,${0.55 + Math.random() * 0.35})`;
          g.fillRect(x, h - bh, bw, bh);
          // lit windows
          for (let wy = h - bh + 8; wy < h - 6; wy += 12)
            for (let wx = x + 4; wx < x + bw - 4; wx += 9)
              if (Math.random() > 0.55) {
                g.fillStyle = Math.random() > 0.3 ? 'rgba(245,205,120,.9)' : 'rgba(120,180,255,.7)';
                g.fillRect(wx, wy, 3, 5);
              }
        }
      }, 512, 340),
    []
  );
}

/* ============================================================= *
 *  Reusable material shortcut
 * ============================================================= */
const M = (color, opts = {}) => <meshStandardMaterial color={color} roughness={opts.r ?? 0.85} metalness={opts.m ?? 0} {...opts} />;

/* ============================================================= *
 *  Set dressing (non-interactive)
 * ============================================================= */
export function Floor() {
  return (
    <group>
      {/* dark base slab -> the rim you see at the edges */}
      <mesh position={[0, -0.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[12.7, 0.6, 12.7]} />
        {M('#15181c', { r: 0.9 })}
      </mesh>
      {/* wood top */}
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[12, 0.22, 12]} />
        {M('#b98d55', { r: 0.7 })}
      </mesh>
      {/* plank seams */}
      {Array.from({ length: 7 }).map((_, i) => (
        <mesh key={i} position={[-5.5 + i * 1.7, 0.18, 0]}>
          <boxGeometry args={[0.03, 0.02, 12]} />
          {M('#9c743f', { r: 0.9 })}
        </mesh>
      ))}
    </group>
  );
}

export function Walls({ skyline }) {
  return (
    <group>
      {/* left wall (spans Z), inner face +X */}
      <mesh position={[-6, 3.4, 0]} receiveShadow>
        <boxGeometry args={[0.4, 7.4, 12]} />
        {M('#e9e3d7', { r: 0.95 })}
      </mesh>
      {/* back wall (spans X), inner face +Z */}
      <mesh position={[0, 3.4, -6]} receiveShadow>
        <boxGeometry args={[12, 7.4, 0.4]} />
        {M('#ded7c9', { r: 0.95 })}
      </mesh>
      {/* window on back wall with skyline (glass sits in FRONT of the frame) */}
      <group position={[2.6, 4.1, -5.7]}>
        {/* frame backing */}
        <mesh position={[0, 0, -0.05]}>
          <boxGeometry args={[4.5, 2.9, 0.1]} />
          <meshStandardMaterial color="#20242c" roughness={0.6} />
        </mesh>
        {/* skyline glass, in front so nothing occludes it */}
        <mesh position={[0, 0, 0.02]}>
          <planeGeometry args={[4.2, 2.6]} />
          <meshStandardMaterial map={skyline} emissiveMap={skyline} emissive="#ffffff" emissiveIntensity={0.9} roughness={1} toneMapped={false} />
        </mesh>
        {/* mullions in front of the glass */}
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[0.08, 2.6, 0.06]} />
          {M('#2a2f38')}
        </mesh>
        <mesh position={[0, 0, 0.05]}>
          <boxGeometry args={[4.2, 0.08, 0.06]} />
          {M('#2a2f38')}
        </mesh>
      </group>
      {/* framed prints on left wall */}
      {[-2.4, -0.2].map((z, i) => (
        <mesh key={i} position={[-5.78, 4.4, z]} rotation={[0, Math.PI / 2, 0]}>
          <boxGeometry args={[1.1, 1.4, 0.08]} />
          {M(i ? '#c94f46' : '#3a4a6a', { r: 0.7 })}
        </mesh>
      ))}
    </group>
  );
}

export function Desk() {
  const leg = (x, z) => (
    <mesh position={[x, 1.1, z]} castShadow>
      <boxGeometry args={[0.16, 2.1, 0.16]} />
      {M('#1b1e24', { r: 0.5, m: 0.3 })}
    </mesh>
  );
  return (
    <group position={[-4.1, 0, -1]}>
      <RoundedBox args={[3.1, 0.2, 5.2]} radius={0.05} smoothness={3} position={[0, 2.2, 0]} castShadow receiveShadow>
        {M('#5a4131', { r: 0.6 })}
      </RoundedBox>
      {leg(-1.3, -2.3)}{leg(1.3, -2.3)}{leg(-1.3, 2.3)}{leg(1.3, 2.3)}
    </group>
  );
}

export function Monitors({ chart }) {
  const screen = (
    <mesh position={[0.07, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[2, 1.15]} />
      <meshStandardMaterial map={chart} emissiveMap={chart} emissive="#ffffff" emissiveIntensity={1.15} roughness={0.4} side={THREE.DoubleSide} toneMapped={false} />
    </mesh>
  );
  const monitor = (z, ry = 0) => (
    <group position={[-5.1, 3.15, z]} rotation={[0, ry, 0]}>
      {/* bezel */}
      <RoundedBox args={[0.12, 1.35, 2.2]} radius={0.04} smoothness={2}>
        {M('#0e1116', { r: 0.5 })}
      </RoundedBox>
      {screen}
      {/* stand */}
      <mesh position={[-0.05, -0.9, 0]}><boxGeometry args={[0.1, 0.5, 0.12]} />{M('#15181c')}</mesh>
      <mesh position={[-0.05, -1.15, 0]}><boxGeometry args={[0.4, 0.06, 0.7]} />{M('#15181c')}</mesh>
    </group>
  );
  return (
    <group>
      {monitor(-2.2, 0.28)}
      {monitor(0.1, -0.12)}
    </group>
  );
}

export function DeskKit() {
  return (
    <group>
      {/* keyboard */}
      <RoundedBox args={[0.9, 0.06, 1.7]} radius={0.02} smoothness={2} position={[-3.7, 2.33, -1.4]} castShadow>
        {M('#1c2028', { r: 0.6 })}
      </RoundedBox>
      {/* mug (brand red) */}
      <group position={[-3.1, 2.45, -2.7]}>
        <mesh castShadow><cylinderGeometry args={[0.16, 0.14, 0.34, 20]} />{M('#d92b35', { r: 0.5 })}</mesh>
        <mesh position={[0.19, 0, 0]}><torusGeometry args={[0.1, 0.03, 8, 16]} />{M('#d92b35', { r: 0.5 })}</mesh>
      </group>
      {/* desk lamp */}
      <group position={[-5, 2.3, -3]}>
        <mesh><cylinderGeometry args={[0.22, 0.26, 0.08, 20]} />{M('#20242c', { m: 0.4, r: 0.4 })}</mesh>
        <mesh position={[0.35, 0.7, 0]} rotation={[0, 0, -0.5]}><cylinderGeometry args={[0.03, 0.03, 1.5, 10]} />{M('#20242c', { m: 0.4 })}</mesh>
        <mesh position={[0.8, 1.25, 0]} rotation={[0, 0, 1]}><coneGeometry args={[0.22, 0.34, 18, 1, true]} />{M('#2a2f38', { r: 0.4 })}</mesh>
      </group>
    </group>
  );
}

export function Chair() {
  return (
    <group position={[-2.2, 0, -0.6]}>
      <RoundedBox args={[1.1, 0.18, 1.1]} radius={0.06} smoothness={2} position={[0, 1.5, 0]} castShadow>{M('#262b34', { r: 0.7 })}</RoundedBox>
      <RoundedBox args={[0.18, 1.3, 1.1]} radius={0.06} smoothness={2} position={[0.5, 2.1, 0]} castShadow>{M('#2b313b', { r: 0.7 })}</RoundedBox>
      <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.07, 0.07, 1.2, 10]} />{M('#15181c', { m: 0.4 })}</mesh>
      <mesh position={[0, 0.3, 0]}><cylinderGeometry args={[0.5, 0.5, 0.08, 20]} />{M('#15181c', { m: 0.4 })}</mesh>
    </group>
  );
}

export function Shelf({ children }) {
  return (
    <group position={[-1.4, 3.8, -5.78]}>
      <mesh castShadow receiveShadow><boxGeometry args={[3.4, 0.16, 0.9]} />{M('#5a4131', { r: 0.6 })}</mesh>
      {children}
    </group>
  );
}

export function Plant({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow><cylinderGeometry args={[0.28, 0.22, 0.5, 18]} />{M('#b6543f', { r: 0.8 })}</mesh>
      <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.26, 0.26, 0.08, 18]} />{M('#3a2a20')}</mesh>
      {[[0, 0.6, 0, 1], [0.18, 0.5, 0.1, 0.8], [-0.16, 0.52, -0.08, 0.85], [0.05, 0.75, -0.12, 0.7]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], p[2]]} scale={p[3]} castShadow>
          <icosahedronGeometry args={[0.3, 0]} />
          {M(i % 2 ? '#3f7d4e' : '#4c9a5e', { r: 0.9 })}
        </mesh>
      ))}
    </group>
  );
}

export function FloorLamp() {
  return (
    <group position={[-5, 0, -5]}>
      <mesh><cylinderGeometry args={[0.35, 0.4, 0.1, 20]} />{M('#20242c', { m: 0.4 })}</mesh>
      <mesh position={[0, 2.4, 0]}><cylinderGeometry args={[0.05, 0.05, 4.8, 12]} />{M('#20242c', { m: 0.4 })}</mesh>
      <mesh position={[0, 4.7, 0]}>
        <coneGeometry args={[0.5, 0.7, 22, 1, true]} />
        <meshStandardMaterial color="#2a2f38" emissive="#ffd9a0" emissiveIntensity={0.6} side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
    </group>
  );
}

export function Rug() {
  return (
    <mesh position={[1.6, 0.19, 1.8]} rotation={[-Math.PI / 2, 0, 0.15]} receiveShadow>
      <planeGeometry args={[5, 4.2]} />
      {M('#c3cad6', { r: 1 })}
    </mesh>
  );
}

/* ============================================================= *
 *  Interactive prop VISUALS (Scene wraps these with hover/click).
 *  Each is modelled around its own local origin, upright.
 * ============================================================= */
export function CameraModel() {
  return (
    <group>
      <RoundedBox args={[1.1, 0.7, 0.5]} radius={0.08} smoothness={3} castShadow>{M('#23272e', { r: 0.5 })}</RoundedBox>
      <mesh position={[0, 0.5, 0]}><boxGeometry args={[0.5, 0.2, 0.4]} />{M('#2c313a', { r: 0.5 })}</mesh>
      <mesh position={[0, 0, 0.28]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.26, 0.3, 0.4, 28]} />{M('#14171c', { r: 0.4, m: 0.3 })}</mesh>
      <mesh position={[0, 0, 0.5]} rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.17, 0.17, 0.06, 28]} /><meshStandardMaterial color="#3a4a66" roughness={0.15} metalness={0.4} /></mesh>
      <mesh position={[0.33, 0.45, 0]}><sphereGeometry args={[0.055, 12, 12]} />{M('#d92b35', { r: 0.4 })}</mesh>
    </group>
  );
}

export function WatchModel() {
  return (
    <group rotation={[-Math.PI / 2, 0, 0]}>
      <mesh castShadow><cylinderGeometry args={[0.44, 0.44, 0.14, 36]} /><meshStandardMaterial color="#c9a86a" roughness={0.25} metalness={0.7} /></mesh>
      <mesh position={[0, 0.08, 0]}><cylinderGeometry args={[0.36, 0.36, 0.02, 36]} />{M('#f4f0e6', { r: 0.4 })}</mesh>
      {/* hands */}
      <mesh position={[0, 0.1, -0.12]}><boxGeometry args={[0.03, 0.02, 0.22]} />{M('#1c1a17')}</mesh>
      <mesh position={[0.09, 0.1, 0]}><boxGeometry args={[0.18, 0.02, 0.03]} />{M('#1c1a17')}</mesh>
      {/* strap hints */}
      <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.5, 0.5, 0.1]} />{M('#6b4a2f', { r: 0.8 })}</mesh>
      <mesh position={[0, 0.28, 0]}><boxGeometry args={[0.5, 0.5, 0.1]} />{M('#6b4a2f', { r: 0.8 })}</mesh>
    </group>
  );
}

export function CardDeckModel() {
  return (
    <group>
      <RoundedBox args={[0.62, 0.34, 0.9]} radius={0.04} smoothness={2} castShadow>{M('#fbfaf7', { r: 0.55 })}</RoundedBox>
      {/* a couple fanned cards on top */}
      <RoundedBox args={[0.6, 0.02, 0.88]} radius={0.03} smoothness={2} position={[0.12, 0.19, 0.05]} rotation={[0, 0.35, 0]}>{M('#ffffff', { r: 0.5 })}</RoundedBox>
      <mesh position={[0.2, 0.21, 0.08]} rotation={[Math.PI / 2, 0, 0.35]}>
        <planeGeometry args={[0.18, 0.18]} />
        <meshStandardMaterial color="#d92b35" roughness={0.6} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

export function NamecardModel() {
  return (
    <group>
      {/* holder */}
      <mesh castShadow><boxGeometry args={[0.9, 0.12, 0.5]} />{M('#20242c', { m: 0.3, r: 0.5 })}</mesh>
      {/* standing card */}
      <group position={[0, 0.35, 0]} rotation={[0.18, 0, 0]}>
        <RoundedBox args={[0.86, 0.52, 0.03]} radius={0.02} smoothness={2}>{M('#15181c', { r: 0.6 })}</RoundedBox>
        <mesh position={[-0.24, 0.08, 0.02]}><boxGeometry args={[0.28, 0.06, 0.005]} />{M('#e9ebe6', { r: 0.5 })}</mesh>
        <mesh position={[-0.28, -0.04, 0.02]}><boxGeometry args={[0.18, 0.035, 0.005]} />{M('#ff6b6e', { r: 0.5 })}</mesh>
        <mesh position={[0.28, 0.12, 0.02]}><sphereGeometry args={[0.05, 12, 12]} />{M('#d92b35', { r: 0.5 })}</mesh>
      </group>
    </group>
  );
}
