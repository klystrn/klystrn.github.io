import { useMemo, useLayoutEffect, useRef } from 'react';
import * as THREE from 'three';
import { RoundedBox } from '@react-three/drei';

/* ============================================================= *
 *  Screen textures: candlestick chart + night skyline, drawn to
 *  a canvas once and reused as emissive maps.
 * ============================================================= */
function canvasTexture(draw, w = 512, h = 320) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.anisotropy = 4;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function useChartTexture() {
  return useMemo(() => canvasTexture((g, w, h) => {
    g.fillStyle = '#0a0e15'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(120,140,170,.10)'; g.lineWidth = 1;
    for (let x = 0; x <= w; x += 40) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); }
    for (let y = 0; y <= h; y += 32) { g.beginPath(); g.moveTo(0, y); g.lineTo(w, y); g.stroke(); }
    const n = 26, pad = 20, cw = (w - pad * 2) / n; let price = h * 0.55; const pts = [];
    for (let i = 0; i < n; i++) {
      const open = price;
      price += Math.sin(i * 0.9) * 10 + (Math.random() - 0.48) * 26;
      price = Math.max(40, Math.min(h - 40, price));
      const close = price, up = close < open;
      const hi = Math.min(open, close) - (6 + Math.random() * 14);
      const lo = Math.max(open, close) + (6 + Math.random() * 14);
      const cx = pad + cw * (i + 0.5);
      g.strokeStyle = up ? '#2fd17a' : '#f0524f'; g.fillStyle = up ? '#2fd17a' : '#f0524f'; g.lineWidth = 1.5;
      g.beginPath(); g.moveTo(cx, hi); g.lineTo(cx, lo); g.stroke();
      g.fillRect(cx - cw * 0.3, Math.min(open, close), cw * 0.6, Math.max(2, Math.abs(close - open)));
      pts.push([cx, (open + close) / 2]);
    }
    g.strokeStyle = 'rgba(245,185,66,.9)'; g.lineWidth = 2; g.beginPath();
    pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.stroke();
    g.fillStyle = '#dfe6f2'; g.font = '600 20px monospace'; g.fillText('SPX  ·  1D', 20, 30);
    g.fillStyle = '#2fd17a'; g.font = '600 16px monospace'; g.fillText('▲ +1.24%', w - 130, 30);
  }), []);
}

export function useSkylineTexture() {
  return useMemo(() => canvasTexture((g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, '#20283f'); grd.addColorStop(0.6, '#2e2b45'); grd.addColorStop(1, '#48384c');
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 26; i++) {
      const bw = 22 + Math.random() * 40, bh = 60 + Math.random() * 180, x = (i / 26) * w + (Math.random() - 0.5) * 10;
      g.fillStyle = `rgba(10,13,22,${0.6 + Math.random() * 0.3})`; g.fillRect(x, h - bh, bw, bh);
      for (let wy = h - bh + 8; wy < h - 6; wy += 12)
        for (let wx = x + 4; wx < x + bw - 4; wx += 9)
          if (Math.random() > 0.55) { g.fillStyle = Math.random() > 0.3 ? 'rgba(245,205,120,.9)' : 'rgba(120,180,255,.7)'; g.fillRect(wx, wy, 3, 5); }
    }
  }, 512, 340), []);
}

const M = (color, opts = {}) => <meshStandardMaterial color={color} roughness={opts.r ?? 0.85} metalness={opts.m ?? 0} {...opts} />;

/* ============================================================= *
 *  Room shell — dark walls, wood-slat accent, warm LED, window
 * ============================================================= */
export function Floor() {
  return (
    <group>
      <mesh position={[0, -0.3, 0]} receiveShadow>
        <boxGeometry args={[12.7, 0.6, 12.7]} />
        {M('#0f1013', { r: 0.9 })}
      </mesh>
      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[12, 0.22, 12]} />
        {M('#8a6238', { r: 0.55 })}
      </mesh>
      {Array.from({ length: 9 }).map((_, i) => (
        <mesh key={i} position={[-5.4 + i * 1.35, 0.18, 0]}>
          <boxGeometry args={[0.025, 0.02, 12]} />
          {M('#6b4a2b', { r: 0.9 })}
        </mesh>
      ))}
    </group>
  );
}

export function Walls({ skyline }) {
  // vertical wood battens for the accent panel behind the desk (left wall)
  const slats = [];
  for (let i = 0; i < 12; i++) slats.push(-3.6 + i * 0.62);
  return (
    <group>
      {/* dark walls */}
      <mesh position={[-6, 3.4, 0]} receiveShadow>
        <boxGeometry args={[0.4, 7.4, 12]} />
        {M('#22232a', { r: 1 })}
      </mesh>
      <mesh position={[0, 3.4, -6]} receiveShadow>
        <boxGeometry args={[12, 7.4, 0.4]} />
        {M('#1d1e24', { r: 1 })}
      </mesh>

      {/* wood-slat accent panel on the left wall, behind the desk */}
      <group position={[-5.77, 3.7, -0.6]}>
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[0.08, 4.6, 7]} />
          {M('#3a2a1c', { r: 0.9 })}
        </mesh>
        {slats.map((z, i) => (
          <mesh key={i} position={[0.09, 0, z + 0.3]} castShadow>
            <boxGeometry args={[0.12, 4.4, 0.26]} />
            {M(i % 2 ? '#6f4d2e' : '#7a5734', { r: 0.75 })}
          </mesh>
        ))}
        {/* warm LED wash at the top of the slats */}
        <mesh position={[0.16, 2.2, 0]}>
          <boxGeometry args={[0.05, 0.09, 6.6]} />
          <meshStandardMaterial color="#ffb060" emissive="#ff9a44" emissiveIntensity={2.4} toneMapped={false} />
        </mesh>
      </group>

      {/* window with skyline on the back wall */}
      <group position={[-3.2, 4.1, -5.78]}>
        <mesh position={[0, 0, 0.03]}>
          <boxGeometry args={[3.4, 2.7, 0.1]} />
          {M('#15161b', { r: 0.6 })}
        </mesh>
        <mesh position={[0, 0, 0.09]}>
          <planeGeometry args={[3.1, 2.4]} />
          <meshStandardMaterial map={skyline} emissiveMap={skyline} emissive="#ffffff" emissiveIntensity={0.85} roughness={1} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0, 0.12]}>{/* mullions */}
          <boxGeometry args={[0.07, 2.4, 0.05]} />{M('#2a2f38')}
        </mesh>
        <mesh position={[0, 0, 0.12]}>
          <boxGeometry args={[3.1, 0.07, 0.05]} />{M('#2a2f38')}
        </mesh>
      </group>

      {/* framed prints on the back wall, right side */}
      {[[1.2, 4.4], [2.6, 4.6], [2.4, 3.4]].map((p, i) => (
        <mesh key={i} position={[p[0], p[1], -5.77]}>
          <boxGeometry args={[0.9, 1.1, 0.07]} />
          {M(['#8a5a3a', '#33405c', '#2b2b30'][i], { r: 0.7 })}
        </mesh>
      ))}
    </group>
  );
}

/* ============================================================= *
 *  Desk (longer, with a drawer unit) + workstation
 * ============================================================= */
export function Desk() {
  const leg = (z) => (
    <mesh position={[1.35, 1.1, z]} castShadow>
      <boxGeometry args={[0.14, 2.1, 0.14]} />
      {M('#141519', { r: 0.5, m: 0.4 })}
    </mesh>
  );
  return (
    <group position={[-4.0, 0, -0.5]}>
      <RoundedBox args={[3.2, 0.22, 7]} radius={0.05} smoothness={3} position={[0, 2.2, 0]} castShadow receiveShadow>
        {M('#4a3324', { r: 0.5 })}
      </RoundedBox>
      {leg(-3.2)}{leg(3.2)}
      {/* drawer unit under the right end */}
      <group position={[-0.2, 1.05, 2.4]}>
        <RoundedBox args={[2.2, 2.0, 1.6]} radius={0.04} smoothness={2} castShadow>{M('#20222a', { r: 0.6 })}</RoundedBox>
        {[-0.55, 0.05, 0.65].map((y, i) => (
          <mesh key={i} position={[1.12, y, 0]}><boxGeometry args={[0.04, 0.4, 1.3]} />{M('#15161b', { r: 0.5 })}</mesh>
        ))}
        {[-0.55, 0.05, 0.65].map((y, i) => (
          <mesh key={`h${i}`} position={[1.16, y, 0]}><boxGeometry args={[0.03, 0.05, 0.5]} />{M('#c9a86a', { m: 0.5, r: 0.3 })}</mesh>
        ))}
      </group>
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
  const monitor = (z, ry) => (
    <group position={[-5.0, 3.2, z]} rotation={[0, ry, 0]}>
      <RoundedBox args={[0.1, 1.36, 2.2]} radius={0.04} smoothness={2}>{M('#0c0f13', { r: 0.4 })}</RoundedBox>
      {screen}
      <mesh position={[-0.04, -0.9, 0]}><boxGeometry args={[0.1, 0.5, 0.12]} />{M('#15181c')}</mesh>
      <mesh position={[-0.04, -1.16, 0]}><boxGeometry args={[0.4, 0.06, 0.8]} />{M('#15181c')}</mesh>
    </group>
  );
  return <group>{monitor(-1.6, 0.24)}{monitor(0.7, -0.12)}</group>;
}

/* A typical custom-built mechanical keyboard: chunky aluminium case,
   instanced keycaps (cheap — one draw call), a few accent caps, a knob. */
export function CustomKeyboard() {
  const ref = useRef();
  const KW = 0.135, GAP = 0.028, COLS = 14, ROWS = 5;
  const keys = useMemo(() => {
    const arr = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      // spacebar row: skip middle to place a wide bar separately
      if (r === ROWS - 1 && c > 2 && c < 10) continue;
      arr.push([(c - (COLS - 1) / 2) * (KW + GAP), (r - (ROWS - 1) / 2) * (KW + GAP)]);
    }
    return arr;
  }, []);
  useLayoutEffect(() => {
    const m = new THREE.Matrix4();
    keys.forEach((k, i) => { m.makeTranslation(k[0], 0.05, k[1]); ref.current.setMatrixAt(i, m); });
    ref.current.instanceMatrix.needsUpdate = true;
  }, [keys]);
  const boardW = COLS * (KW + GAP) + 0.16, boardD = ROWS * (KW + GAP) + 0.16;
  return (
    <group position={[-3.55, 2.34, -0.3]} rotation={[0, 0.02, 0]}>
      {/* case */}
      <RoundedBox args={[boardD, 0.16, boardW]} radius={0.03} smoothness={3} castShadow>
        {M('#2b2e36', { r: 0.45, m: 0.3 })}
      </RoundedBox>
      <RoundedBox args={[boardD - 0.06, 0.1, boardW - 0.06]} radius={0.02} smoothness={2} position={[0, 0.06, 0]}>
        {M('#14161b', { r: 0.6 })}
      </RoundedBox>
      {/* keycaps (instanced) — rotate grid to lie on the board (x=rows, z=cols) */}
      <group rotation={[0, Math.PI / 2, 0]}>
        <instancedMesh ref={ref} args={[undefined, undefined, keys.length]} castShadow>
          <boxGeometry args={[KW, 0.08, KW]} />
          {M('#3a3f49', { r: 0.6 })}
        </instancedMesh>
      </group>
      {/* accent caps (esc + enter area) */}
      <mesh position={[boardD / 2 - 0.12, 0.11, -boardW / 2 + 0.12]}><boxGeometry args={[KW, 0.08, KW]} />{M('#d92b35', { r: 0.5 })}</mesh>
      <mesh position={[boardD / 2 - 0.12, 0.11, boardW / 2 - 0.2]}><boxGeometry args={[KW, 0.08, KW * 1.6]} />{M('#e0662f', { r: 0.5 })}</mesh>
      {/* spacebar */}
      <mesh position={[-boardD / 2 + 0.16, 0.11, 0]}><boxGeometry args={[KW, 0.08, KW * 6.2]} />{M('#2f333c', { r: 0.6 })}</mesh>
      {/* rotary knob */}
      <mesh position={[boardD / 2 - 0.02, 0.13, -boardW / 2 - 0.02]} castShadow><cylinderGeometry args={[0.09, 0.09, 0.16, 20]} />{M('#c9a86a', { m: 0.6, r: 0.3 })}</mesh>
    </group>
  );
}

export function DeskExtras() {
  return (
    <group>
      <group position={[-4.9, 2.45, 2.6]}>
        <mesh castShadow><cylinderGeometry args={[0.16, 0.14, 0.34, 20]} />{M('#d92b35', { r: 0.5 })}</mesh>
        <mesh position={[0.19, 0, 0]}><torusGeometry args={[0.1, 0.03, 8, 16]} />{M('#d92b35', { r: 0.5 })}</mesh>
      </group>
      <group position={[-5.0, 2.3, -2.6]}>
        <mesh><cylinderGeometry args={[0.22, 0.26, 0.08, 20]} />{M('#181a20', { m: 0.4, r: 0.4 })}</mesh>
        <mesh position={[0.3, 0.6, 0]} rotation={[0, 0, -0.5]}><cylinderGeometry args={[0.03, 0.03, 1.3, 10]} />{M('#181a20', { m: 0.4 })}</mesh>
        <mesh position={[0.7, 1.05, 0]} rotation={[0, 0, 1]}>
          <coneGeometry args={[0.2, 0.3, 18, 1, true]} />
          <meshStandardMaterial color="#20242c" emissive="#ffd9a0" emissiveIntensity={0.7} side={THREE.DoubleSide} roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export function Chair() {
  return (
    <group position={[-2.1, 0, -0.4]} rotation={[0, -0.3, 0]}>
      <RoundedBox args={[1.15, 0.2, 1.15]} radius={0.08} smoothness={3} position={[0, 1.5, 0]} castShadow>{M('#20242c', { r: 0.7 })}</RoundedBox>
      <RoundedBox args={[0.2, 1.5, 1.15]} radius={0.08} smoothness={3} position={[0.5, 2.2, 0]} castShadow>{M('#262b34', { r: 0.7 })}</RoundedBox>
      <mesh position={[0, 0.9, 0]}><cylinderGeometry args={[0.07, 0.07, 1.2, 12]} />{M('#101216', { m: 0.4 })}</mesh>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = (i / 5) * Math.PI * 2;
        return <mesh key={i} position={[Math.cos(a) * 0.5, 0.28, Math.sin(a) * 0.5]}><boxGeometry args={[0.5, 0.06, 0.1]} />{M('#101216', { m: 0.4 })}</mesh>;
      })}
    </group>
  );
}

/* Modern low sofa for the open floor area */
export function Sofa({ position = [0, 0, 0], rotation = [0, 0, 0] }) {
  const cushion = (x) => (
    <RoundedBox args={[1.5, 0.4, 1.4]} radius={0.14} smoothness={3} position={[x, 1.05, 0]} castShadow>{M('#8f8b81', { r: 0.95 })}</RoundedBox>
  );
  return (
    <group position={position} rotation={rotation}>
      <RoundedBox args={[3.4, 0.7, 1.7]} radius={0.12} smoothness={3} position={[0, 0.6, 0]} castShadow receiveShadow>{M('#6d6a62', { r: 0.95 })}</RoundedBox>
      {cushion(-0.8)}{cushion(0.8)}
      <RoundedBox args={[3.4, 1.1, 0.4]} radius={0.14} smoothness={3} position={[0, 1.1, -0.75]} castShadow>{M('#7a766d', { r: 0.95 })}</RoundedBox>
      <RoundedBox args={[0.4, 0.9, 1.7]} radius={0.14} smoothness={3} position={[-1.7, 1.0, 0]} castShadow>{M('#7a766d', { r: 0.95 })}</RoundedBox>
      <RoundedBox args={[0.4, 0.9, 1.7]} radius={0.14} smoothness={3} position={[1.7, 1.0, 0]} castShadow>{M('#7a766d', { r: 0.95 })}</RoundedBox>
      {/* throw cushion (brand accent) */}
      <RoundedBox args={[0.7, 0.7, 0.25]} radius={0.1} smoothness={3} position={[0.9, 1.3, 0.3]} rotation={[0.2, 0, 0.3]} castShadow>{M('#b23540', { r: 0.9 })}</RoundedBox>
      {/* feet */}
      {[[-1.5, 0.7], [1.5, 0.7], [-1.5, -0.7], [1.5, -0.7]].map((p, i) => (
        <mesh key={i} position={[p[0], 0.12, p[1]]}><cylinderGeometry args={[0.07, 0.07, 0.25, 10]} />{M('#c9a86a', { m: 0.5, r: 0.3 })}</mesh>
      ))}
    </group>
  );
}

/* Glass-front trophy cabinet with lit shelves + trophies/medals */
export function TrophyCabinet({ glow = 0 }) {
  const trophy = (x, s = 1) => (
    <group position={[x, 0, 0]} scale={s}>
      <mesh position={[0, 0.05, 0]}><boxGeometry args={[0.24, 0.1, 0.24]} />{M('#2a1c10', { r: 0.7 })}</mesh>
      <mesh position={[0, 0.16, 0]}><cylinderGeometry args={[0.02, 0.04, 0.14, 10]} /><meshStandardMaterial color="#e8c05a" metalness={0.8} roughness={0.25} /></mesh>
      <mesh position={[0, 0.3, 0]}><sphereGeometry args={[0.12, 16, 12, 0, Math.PI * 2, 0, Math.PI * 0.6]} /><meshStandardMaterial color="#f0cf6a" metalness={0.85} roughness={0.2} /></mesh>
      <mesh position={[-0.13, 0.28, 0]} rotation={[0, 0, 0.5]}><torusGeometry args={[0.06, 0.012, 8, 14, Math.PI]} /><meshStandardMaterial color="#e8c05a" metalness={0.8} roughness={0.25} /></mesh>
      <mesh position={[0.13, 0.28, 0]} rotation={[0, 0, -0.5]}><torusGeometry args={[0.06, 0.012, 8, 14, Math.PI]} /><meshStandardMaterial color="#e8c05a" metalness={0.8} roughness={0.25} /></mesh>
    </group>
  );
  const medal = (x, col) => (
    <group position={[x, 0.16, 0]}>
      <mesh rotation={[Math.PI / 2, 0, 0]}><cylinderGeometry args={[0.11, 0.11, 0.03, 20]} /><meshStandardMaterial color={col} metalness={0.7} roughness={0.3} /></mesh>
      <mesh position={[0, 0.22, -0.01]}><boxGeometry args={[0.08, 0.3, 0.02]} />{M('#b23540', { r: 0.8 })}</mesh>
    </group>
  );
  return (
    <group position={[0, 2.7, 0]}>
      {/* carcass */}
      {/* carcass shell: back panel + top/bottom/sides, hollow interior */}
      <mesh position={[0, 0, -0.38]} castShadow receiveShadow><boxGeometry args={[2.6, 5.4, 0.14]} /><meshStandardMaterial color="#2e2115" emissive="#3a2a1a" emissiveIntensity={0.4} roughness={0.8} /></mesh>
      <mesh position={[-1.28, 0, 0]}><boxGeometry args={[0.12, 5.4, 0.9]} />{M('#241a12', { r: 0.7 })}</mesh>
      <mesh position={[1.28, 0, 0]}><boxGeometry args={[0.12, 5.4, 0.9]} />{M('#241a12', { r: 0.7 })}</mesh>
      <mesh position={[0, 2.64, 0]}><boxGeometry args={[2.6, 0.14, 0.9]} />{M('#241a12', { r: 0.7 })}</mesh>
      <mesh position={[0, -2.64, 0]}><boxGeometry args={[2.6, 0.14, 0.9]} />{M('#241a12', { r: 0.7 })}</mesh>
      {/* lit shelves */}
      {[-1.8, -0.6, 0.6, 1.8].map((y, i) => (
        <group key={i} position={[0, y, 0.1]}>
          <mesh><boxGeometry args={[2.3, 0.06, 0.75]} />{M('#4a3524', { r: 0.7 })}</mesh>
          <mesh position={[0, 0.03, -0.36]}>
            <boxGeometry args={[2.2, 0.05, 0.05]} />
            <meshStandardMaterial color="#fff0d0" emissive="#ffcf87" emissiveIntensity={2.8 + glow} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* display: trophies + medals */}
      <group position={[0, -1.55, 0.16]}>{trophy(-0.6, 1.1)}{trophy(0.2, 0.85)}{medal(0.75, '#c9a86a')}</group>
      <group position={[0, -0.35, 0.16]}>{trophy(-0.55, 0.95)}{medal(0.1, '#dcdcdc')}{medal(0.5, '#e8c05a')}{medal(0.85, '#c9773a')}</group>
      <group position={[0, 0.85, 0.16]}>{trophy(-0.3, 1.25)}{trophy(0.6, 0.9)}</group>
      {/* glass front */}
      <mesh position={[0, 0, 0.46]}>
        <boxGeometry args={[2.3, 5.1, 0.04]} />
        <meshStandardMaterial color="#bcd0e4" transparent opacity={0.14} roughness={0.05} metalness={0.2} />
      </mesh>
      {/* frame edges */}
      <mesh position={[-1.15, 0, 0.46]}><boxGeometry args={[0.1, 5.3, 0.12]} />{M('#2a1c10', { r: 0.6 })}</mesh>
      <mesh position={[1.15, 0, 0.46]}><boxGeometry args={[0.1, 5.3, 0.12]} />{M('#2a1c10', { r: 0.6 })}</mesh>
    </group>
  );
}

export function Shelf({ children }) {
  return (
    <group position={[-1.2, 3.9, -5.77]}>
      <mesh castShadow receiveShadow><boxGeometry args={[3.0, 0.16, 0.85]} />{M('#3a2a1c', { r: 0.65 })}</mesh>
      {children}
    </group>
  );
}

export function Plant({ position = [0, 0, 0], scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow><cylinderGeometry args={[0.28, 0.22, 0.5, 18]} />{M('#7a4a34', { r: 0.8 })}</mesh>
      <mesh position={[0, 0.28, 0]}><cylinderGeometry args={[0.26, 0.26, 0.08, 18]} />{M('#241812')}</mesh>
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
      <mesh><cylinderGeometry args={[0.35, 0.4, 0.1, 20]} />{M('#181a20', { m: 0.4 })}</mesh>
      <mesh position={[0, 2.4, 0]}><cylinderGeometry args={[0.05, 0.05, 4.8, 12]} />{M('#181a20', { m: 0.4 })}</mesh>
      <mesh position={[0, 4.7, 0]}>
        <coneGeometry args={[0.5, 0.7, 22, 1, true]} />
        <meshStandardMaterial color="#20242c" emissive="#ffcf8a" emissiveIntensity={0.8} side={THREE.DoubleSide} roughness={0.5} />
      </mesh>
    </group>
  );
}

/* ============================================================= *
 *  Interactive hobby prop visuals
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
      <mesh position={[0, 0.1, -0.12]}><boxGeometry args={[0.03, 0.02, 0.22]} />{M('#1c1a17')}</mesh>
      <mesh position={[0.09, 0.1, 0]}><boxGeometry args={[0.18, 0.02, 0.03]} />{M('#1c1a17')}</mesh>
      <mesh position={[0, -0.28, 0]}><boxGeometry args={[0.5, 0.5, 0.1]} />{M('#6b4a2f', { r: 0.8 })}</mesh>
      <mesh position={[0, 0.28, 0]}><boxGeometry args={[0.5, 0.5, 0.1]} />{M('#6b4a2f', { r: 0.8 })}</mesh>
    </group>
  );
}

export function CardDeckModel() {
  return (
    <group>
      <RoundedBox args={[0.62, 0.34, 0.9]} radius={0.04} smoothness={2} castShadow>{M('#fbfaf7', { r: 0.55 })}</RoundedBox>
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
      <mesh castShadow><boxGeometry args={[0.9, 0.12, 0.5]} />{M('#20242c', { m: 0.3, r: 0.5 })}</mesh>
      <group position={[0, 0.35, 0]} rotation={[0.18, 0, 0]}>
        <RoundedBox args={[0.86, 0.52, 0.03]} radius={0.02} smoothness={2}>{M('#15181c', { r: 0.6 })}</RoundedBox>
        <mesh position={[-0.24, 0.08, 0.02]}><boxGeometry args={[0.28, 0.06, 0.005]} />{M('#e9ebe6', { r: 0.5 })}</mesh>
        <mesh position={[-0.28, -0.04, 0.02]}><boxGeometry args={[0.18, 0.035, 0.005]} />{M('#ff6b6e', { r: 0.5 })}</mesh>
        <mesh position={[0.28, 0.12, 0.02]}><sphereGeometry args={[0.05, 12, 12]} />{M('#d92b35', { r: 0.5 })}</mesh>
      </group>
    </group>
  );
}
