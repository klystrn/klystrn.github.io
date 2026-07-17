/*
 * Hand-drawn SVG art for the four objects on the Life table. Kept as inline
 * SVG (like the constellation and finance charts) so they scale cleanly for
 * the click-to-zoom transition and need no image assets. Each art fills its
 * viewBox; the table places/sizes them via CSS.
 */

export function CameraArt(props) {
  return (
    <svg viewBox="0 0 200 150" {...props}>
      {/* strap hints */}
      <path d="M18 40 Q4 78 22 118" fill="none" stroke="#6b4a2b" strokeWidth="6" strokeLinecap="round" opacity=".7" />
      <path d="M182 40 Q196 78 178 118" fill="none" stroke="#6b4a2b" strokeWidth="6" strokeLinecap="round" opacity=".7" />
      {/* body */}
      <rect x="26" y="42" width="148" height="86" rx="14" fill="#232830" />
      <rect x="26" y="42" width="148" height="86" rx="14" fill="none" stroke="#0d0f13" strokeWidth="2" />
      {/* top plate + pentaprism */}
      <path d="M72 42 l10 -16 h36 l10 16 z" fill="#2c323c" />
      <rect x="34" y="34" width="26" height="12" rx="3" fill="#2c323c" />
      {/* shutter button */}
      <circle cx="47" cy="34" r="4.5" fill="#d92b35" />
      {/* flash */}
      <rect x="128" y="30" width="30" height="8" rx="2" fill="#3a414d" />
      {/* lens */}
      <circle cx="100" cy="88" r="38" fill="#14171c" />
      <circle cx="100" cy="88" r="38" fill="none" stroke="#3a414d" strokeWidth="3" />
      <circle cx="100" cy="88" r="27" fill="#1b1f26" stroke="#0a0c0f" strokeWidth="2" />
      <circle cx="100" cy="88" r="16" fill="#0f1216" />
      <circle cx="92" cy="80" r="6" fill="#4a5566" opacity=".55" />
      {/* aperture ring ticks */}
      <circle cx="100" cy="88" r="33" fill="none" stroke="#454d5a" strokeWidth="1.4" strokeDasharray="1.5 6" />
      {/* red accent bar */}
      <rect x="34" y="116" width="34" height="5" rx="2.5" fill="#d92b35" />
    </svg>
  );
}

export function WatchArt(props) {
  return (
    <svg viewBox="0 0 160 200" {...props}>
      {/* strap */}
      <path d="M58 30 L54 8 h52 l-4 22 z" fill="#5a3d28" />
      <path d="M58 170 L54 192 h52 l-4 -22 z" fill="#5a3d28" />
      <rect x="56" y="20" width="48" height="18" rx="4" fill="#6b4a2f" />
      <rect x="56" y="162" width="48" height="18" rx="4" fill="#6b4a2f" />
      {/* crown */}
      <rect x="126" y="94" width="12" height="14" rx="2" fill="#b08d57" />
      {/* case */}
      <circle cx="80" cy="100" r="52" fill="#c9a86a" />
      <circle cx="80" cy="100" r="52" fill="none" stroke="#8a6c3e" strokeWidth="3" />
      <circle cx="80" cy="100" r="44" fill="#f6f3ea" />
      <circle cx="80" cy="100" r="44" fill="none" stroke="#d8ccaf" strokeWidth="2" />
      {/* hour markers */}
      {Array.from({ length: 12 }).map((_, i) => {
        const a = (i / 12) * Math.PI * 2 - Math.PI / 2;
        const x1 = 80 + Math.cos(a) * 38;
        const y1 = 100 + Math.sin(a) * 38;
        const x2 = 80 + Math.cos(a) * 33;
        const y2 = 100 + Math.sin(a) * 33;
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#2a2622" strokeWidth={i % 3 === 0 ? 3 : 1.5} />;
      })}
      {/* hands */}
      <line x1="80" y1="100" x2="80" y2="72" stroke="#1c1a17" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="80" y1="100" x2="104" y2="108" stroke="#1c1a17" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="80" y1="100" x2="80" y2="120" stroke="#d92b35" strokeWidth="1.6" strokeLinecap="round" />
      <circle cx="80" cy="100" r="4" fill="#1c1a17" />
    </svg>
  );
}

export function CardsArt(props) {
  const suit = (
    <path d="M0 5 C-4 -2 -12 0 -12 6 C-12 12 -4 14 0 20 C4 14 12 12 12 6 C12 0 4 -2 0 5 Z" fill="#d92b35" />
  );
  return (
    <svg viewBox="0 0 200 160" {...props}>
      {/* fanned deck */}
      {[-26, -13, 0].map((rot, i) => (
        <g key={i} transform={`rotate(${rot} 100 150)`}>
          <rect x="70" y="34" width="60" height="86" rx="8" fill="#fbfaf7" stroke="#d6d2c8" strokeWidth="1.5" />
        </g>
      ))}
      {/* top face-up card */}
      <g transform="rotate(13 100 150)">
        <rect x="70" y="34" width="60" height="86" rx="8" fill="#ffffff" stroke="#d92b35" strokeWidth="1.6" />
        <text x="78" y="52" fontFamily="Fraunces Variable, Georgia, serif" fontWeight="700" fontSize="16" fill="#d92b35">A</text>
        <g transform="translate(100 74) scale(1.1)">{suit}</g>
        <g transform="translate(122 104) rotate(180) scale(1.1)">{suit}</g>
      </g>
    </svg>
  );
}

export function NamecardArt(props) {
  return (
    <svg viewBox="0 0 200 130" {...props}>
      <rect x="14" y="20" width="172" height="100" rx="10" fill="#15181c" />
      <rect x="14" y="20" width="172" height="100" rx="10" fill="none" stroke="#2b2f36" strokeWidth="1.5" />
      {/* monogram */}
      <text x="30" y="58" fontFamily="Fraunces Variable, Georgia, serif" fontStyle="italic" fontWeight="700" fontSize="26" fill="#ff6b6e">R.</text>
      {/* name + title lines */}
      <rect x="30" y="74" width="86" height="7" rx="3.5" fill="#e9ebe6" />
      <rect x="30" y="88" width="60" height="5" rx="2.5" fill="#6d7683" />
      <rect x="30" y="100" width="72" height="4" rx="2" fill="#4a515b" />
      {/* corner mark */}
      <circle cx="162" cy="46" r="10" fill="none" stroke="#d92b35" strokeWidth="1.6" />
      <circle cx="162" cy="46" r="3" fill="#d92b35" />
    </svg>
  );
}

/*
 * Registry: order = left-to-right placement on the table. `theme` is the
 * backdrop colour the click-zoom washes to. `art` is the component above.
 * `pos` is the object's resting spot / size on the table surface (%).
 */
export const OBJECTS = [
  {
    id: 'cards',
    art: CardsArt,
    theme: '#7d1620',
    pos: { left: '13%', top: '46%', w: 200, rot: -6, delay: 0 },
  },
  {
    id: 'camera',
    art: CameraArt,
    theme: '#171a1f',
    pos: { left: '37%', top: '52%', w: 250, rot: 3, delay: 0.6 },
  },
  {
    id: 'watch',
    art: WatchArt,
    theme: '#3a2c14',
    pos: { left: '64%', top: '44%', w: 150, rot: -4, delay: 1.2 },
  },
  {
    id: 'namecard',
    art: NamecardArt,
    theme: '#0f1114',
    pos: { left: '82%', top: '56%', w: 200, rot: 7, delay: 1.8 },
  },
];
