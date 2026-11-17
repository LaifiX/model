import type { CreatureId } from '../data/creatures';

/* Ploché ilustrácie s atramentovým obrysom — štýl obrázkovej knižky. */

const INK = '#2a1f3d';
const line = { stroke: INK, strokeWidth: 4, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const };

function Eyes({ x1, x2, y, r = 7 }: { x1: number; x2: number; y: number; r?: number }) {
  return (
    <g>
      {[x1, x2].map((x) => (
        <g key={x}>
          <circle cx={x} cy={y} r={r} fill="#fff" {...line} strokeWidth={3} />
          <circle cx={x + 1} cy={y + 1} r={r * 0.5} fill={INK} />
          <circle cx={x + 2.5} cy={y - 1.5} r={r * 0.18} fill="#fff" />
        </g>
      ))}
    </g>
  );
}

function Drak() {
  return (
    <g>
      {/* chvost */}
      <path d="M62 168 C 30 170, 18 150, 26 132 C 30 124, 40 126, 38 134" fill="none" {...line} strokeWidth={14} stroke={INK} />
      <path d="M62 168 C 30 170, 18 150, 26 132 C 30 124, 40 126, 38 134" fill="none" stroke="#e8613c" strokeWidth={8} strokeLinecap="round" />
      <path d="M33 128 l -10 -12 l 16 2 z" fill="#ffcf7a" {...line} strokeWidth={3} />
      {/* krídla */}
      <path d="M78 104 L 30 64 L 42 98 L 22 104 L 48 118 Z" fill="#b8324a" {...line} />
      <path d="M122 104 L 170 64 L 158 98 L 178 104 L 152 118 Z" fill="#b8324a" {...line} />
      {/* telo */}
      <ellipse cx="100" cy="150" rx="46" ry="42" fill="#e8613c" {...line} />
      <ellipse cx="100" cy="158" rx="28" ry="28" fill="#ffcf7a" {...line} strokeWidth={3} />
      <path d="M86 150 h28 M84 162 h32 M88 174 h24" stroke="#e0a54f" strokeWidth={3} strokeLinecap="round" />
      {/* nohy */}
      <ellipse cx="74" cy="190" rx="16" ry="9" fill="#e8613c" {...line} />
      <ellipse cx="126" cy="190" rx="16" ry="9" fill="#e8613c" {...line} />
      {/* rohy */}
      <path d="M78 58 L 70 32 L 88 52 Z" fill="#ffcf7a" {...line} strokeWidth={3} />
      <path d="M122 58 L 130 32 L 112 52 Z" fill="#ffcf7a" {...line} strokeWidth={3} />
      {/* hlava */}
      <circle cx="100" cy="80" r="32" fill="#e8613c" {...line} />
      <ellipse cx="100" cy="96" rx="22" ry="15" fill="#e8613c" {...line} strokeWidth={3} />
      <circle cx="93" cy="94" r="2.5" fill={INK} />
      <circle cx="107" cy="94" r="2.5" fill={INK} />
      <Eyes x1={87} x2={113} y={74} r={8} />
      {/* iskry */}
      <g fill="#ffd23f" {...line} strokeWidth={2.5}>
        <path d="M146 30 l4 7 l8 1 l-6 5 l2 8 l-8 -4 l-7 4 l2 -8 l-6 -5 l8 -1 z" />
        <circle cx="164" cy="44" r="4" />
        <circle cx="54" cy="40" r="3" />
      </g>
    </g>
  );
}

function Vila() {
  return (
    <g>
      {/* krídla */}
      <g fill="#c9f4ff" fillOpacity={0.85} {...line} strokeWidth={3}>
        <ellipse cx="62" cy="96" rx="34" ry="20" transform="rotate(-30 62 96)" />
        <ellipse cx="138" cy="96" rx="34" ry="20" transform="rotate(30 138 96)" />
        <ellipse cx="68" cy="126" rx="24" ry="14" transform="rotate(25 68 126)" />
        <ellipse cx="132" cy="126" rx="24" ry="14" transform="rotate(-25 132 126)" />
      </g>
      {/* šaty */}
      <path d="M100 98 L 62 182 Q 100 196 138 182 Z" fill="#f08bb8" {...line} />
      <path d="M62 182 q 9 10 19 2 q 9 10 19 2 q 9 10 19 2 q 9 10 19 -6" fill="#ffb3d1" {...line} strokeWidth={3} />
      <rect x="88" y="96" width="24" height="22" rx="10" fill="#f08bb8" {...line} />
      {/* ruka s prútikom */}
      <path d="M112 108 L 134 92" {...line} strokeWidth={7} stroke={INK} />
      <path d="M112 108 L 134 92" stroke="#ffe0c7" strokeWidth={3} strokeLinecap="round" />
      <path d="M134 92 L 152 58" stroke="#c48a3a" strokeWidth={4} strokeLinecap="round" />
      <path
        d="M154 38 l5 11 l12 1 l-9 8 l3 12 l-11 -6 l-11 6 l3 -12 l-9 -8 l12 -1 z"
        fill="#ffe14d"
        {...line}
        strokeWidth={3}
      />
      {/* hlava */}
      <circle cx="100" cy="70" r="30" fill="#ffcc4d" {...line} />
      <circle cx="100" cy="38" r="12" fill="#ffcc4d" {...line} strokeWidth={3} />
      <circle cx="100" cy="76" r="23" fill="#ffe0c7" {...line} />
      <path d="M78 66 q 22 -18 44 0" fill="#ffcc4d" {...line} strokeWidth={3} />
      <Eyes x1={91} x2={109} y={78} r={5.5} />
      <ellipse cx="84" cy="88" rx="5" ry="3" fill="#ffa8b8" />
      <ellipse cx="116" cy="88" rx="5" ry="3" fill="#ffa8b8" />
      <path d="M95 91 q 5 4 10 0" fill="none" {...line} strokeWidth={2.5} />
      {/* trblietky */}
      <g fill="#fff3a0" {...line} strokeWidth={2}>
        <path d="M40 54 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3 z" />
        <path d="M168 150 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2 z" />
      </g>
    </g>
  );
}

function Skriatok() {
  return (
    <g>
      {/* hríbik */}
      <rect x="148" y="166" width="14" height="26" rx="5" fill="#f6ecd9" {...line} strokeWidth={3} />
      <path d="M134 170 q 21 -34 42 0 z" fill="#d9382e" {...line} strokeWidth={3} />
      <circle cx="148" cy="160" r="3" fill="#fff" />
      <circle cx="160" cy="156" r="2.5" fill="#fff" />
      {/* nohy + telo */}
      <ellipse cx="82" cy="192" rx="16" ry="8" fill="#4a2f22" {...line} />
      <ellipse cx="114" cy="192" rx="16" ry="8" fill="#4a2f22" {...line} />
      <ellipse cx="98" cy="152" rx="40" ry="40" fill="#8a5a3b" {...line} />
      <rect x="58" y="148" width="80" height="10" fill="#3b2418" {...line} strokeWidth={3} />
      <rect x="90" y="145" width="16" height="16" rx="2" fill="#e8c14d" {...line} strokeWidth={3} />
      <circle cx="56" cy="150" r="10" fill="#f2c6a0" {...line} strokeWidth={3} />
      <circle cx="140" cy="150" r="10" fill="#f2c6a0" {...line} strokeWidth={3} />
      {/* hlava */}
      <ellipse cx="70" cy="92" rx="8" ry="12" fill="#f2c6a0" {...line} strokeWidth={3} />
      <ellipse cx="126" cy="92" rx="8" ry="12" fill="#f2c6a0" {...line} strokeWidth={3} />
      <circle cx="98" cy="92" r="28" fill="#f2c6a0" {...line} />
      {/* brada */}
      <path d="M72 100 Q 98 160 124 100 Q 112 112 98 108 Q 84 112 72 100 Z" fill="#f3eee6" {...line} />
      <Eyes x1={88} x2={108} y={86} r={5.5} />
      <circle cx="98" cy="100" r="9" fill="#e8957a" {...line} strokeWidth={3} />
      {/* machová čiapka */}
      <path d="M68 72 Q 96 -6 140 22 Q 116 34 128 72 Z" fill="#5e8c3a" {...line} />
      <path d="M66 72 Q 98 60 130 72" fill="none" stroke="#7fb04f" strokeWidth={10} strokeLinecap="round" />
      <path d="M66 72 Q 98 60 130 72" fill="none" {...line} strokeWidth={3} />
      <circle cx="140" cy="22" r="7" fill="#c9e27a" {...line} strokeWidth={3} />
      <g fill="#7fb04f">
        <circle cx="96" cy="40" r="3" />
        <circle cx="110" cy="52" r="2.5" />
        <circle cx="86" cy="58" r="2.5" />
      </g>
    </g>
  );
}

function Vodnik() {
  return (
    <g>
      {/* mláka */}
      <ellipse cx="100" cy="194" rx="70" ry="12" fill="#5cc8e6" fillOpacity={0.6} {...line} strokeWidth={3} />
      {/* nohy */}
      <ellipse cx="86" cy="190" rx="13" ry="6" fill="#6fbf8e" {...line} strokeWidth={3} />
      <ellipse cx="114" cy="190" rx="13" ry="6" fill="#6fbf8e" {...line} strokeWidth={3} />
      {/* frak */}
      <path d="M74 108 L 62 186 L 138 186 L 126 108 Z" fill="#2f6f7a" {...line} />
      <path d="M90 108 L 100 186 L 110 108 Z" fill="#e9e2c8" {...line} strokeWidth={3} />
      <g fill="#e8b84d">
        <circle cx="100" cy="132" r="3" />
        <circle cx="100" cy="148" r="3" />
        <circle cx="100" cy="164" r="3" />
      </g>
      {/* kvapky z fraku */}
      <g fill="#8fe3ff" {...line} strokeWidth={2}>
        <path d="M66 196 q -4 6 0 9 q 4 -3 0 -9 z" />
        <path d="M136 198 q -3 5 0 7 q 3 -2 0 -7 z" />
      </g>
      {/* ruka s fajkou */}
      <path d="M126 118 L 140 104" stroke={INK} strokeWidth={14} strokeLinecap="round" />
      <path d="M126 118 L 140 104" stroke="#2f6f7a" strokeWidth={8} strokeLinecap="round" />
      {/* hlava */}
      <ellipse cx="74" cy="80" rx="7" ry="13" fill="#3e8f63" {...line} strokeWidth={3} />
      <ellipse cx="126" cy="80" rx="7" ry="13" fill="#3e8f63" {...line} strokeWidth={3} />
      <circle cx="100" cy="82" r="28" fill="#6fbf8e" {...line} />
      <Eyes x1={89} x2={111} y={78} r={7.5} />
      <circle cx="100" cy="92" r="4" fill="#4f9a6d" />
      <path d="M104 100 L 128 96" stroke="#6b4226" strokeWidth={4} strokeLinecap="round" />
      <rect x="126" y="86" width="12" height="13" rx="3" fill="#6b4226" {...line} strokeWidth={3} />
      {/* bubliny */}
      <g fill="#d8f6ff" fillOpacity={0.8} {...line} strokeWidth={2.5}>
        <circle cx="136" cy="72" r="6" />
        <circle cx="146" cy="56" r="8" />
        <circle cx="140" cy="36" r="5" />
      </g>
      {/* klobúk */}
      <g transform="rotate(6 100 54)">
        <rect x="64" y="52" width="72" height="8" rx="4" fill="#20323a" {...line} strokeWidth={3} />
        <rect x="76" y="16" width="48" height="38" rx="4" fill="#20323a" {...line} />
        <rect x="76" y="40" width="48" height="9" fill="#c9463d" {...line} strokeWidth={3} />
      </g>
    </g>
  );
}

const ART: Record<CreatureId, () => React.JSX.Element> = {
  drak: Drak,
  vila: Vila,
  skriatok: Skriatok,
  vodnik: Vodnik,
};

export function CreatureArt({
  id,
  silhouette = false,
  className,
  title,
}: {
  id: CreatureId;
  silhouette?: boolean;
  className?: string;
  title?: string;
}) {
  const Art = ART[id];
  return (
    <svg
      viewBox="0 0 200 215"
      className={`${className ?? ''} ${silhouette ? 'art-silhouette' : ''}`}
      role="img"
      aria-label={title}
    >
      <Art />
    </svg>
  );
}
