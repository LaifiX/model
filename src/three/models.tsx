import { Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { createContext, useContext, useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import type { CreatureId } from '../data/creatures';

/* ------------------------------------------------------------------
   Reakcia na ťuknutie — čas posledného ťuknutia (performance.now / 1000)
   ------------------------------------------------------------------ */
export const REACTION_SECONDS = 1.3;
export const ReactionContext = createContext<{ current: number }>({ current: -1e9 });

/** Vráti funkciu → priebeh reakcie 0..1, alebo -1 keď bytosť práve nereaguje. */
export function useReaction() {
  const ref = useContext(ReactionContext);
  return () => {
    const p = (performance.now() / 1000 - ref.current) / REACTION_SECONDS;
    return p >= 0 && p < 1 ? p : -1;
  };
}

/** Plynulý oblúk 0 → 1 → 0 počas reakcie. */
const arc = (p: number) => (p < 0 ? 0 : Math.sin(p * Math.PI));
const easeInOut = (p: number) => (p < 0 ? 0 : p < 0.5 ? 2 * p * p : 1 - Math.pow(-2 * p + 2, 2) / 2);

/* ------------------------------------------------------------------
   Spoločné: „rozprávkové“ toon tieňovanie v troch stupňoch
   ------------------------------------------------------------------ */
let gradientMap: THREE.DataTexture | null = null;
function getGradient() {
  if (!gradientMap) {
    const data = new Uint8Array([90, 170, 255]);
    gradientMap = new THREE.DataTexture(data, data.length, 1, THREE.RedFormat);
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;
    gradientMap.needsUpdate = true;
  }
  return gradientMap;
}

function Toon({ color, emissive }: { color: string; emissive?: string }) {
  return (
    <meshToonMaterial
      color={color}
      gradientMap={getGradient()}
      emissive={emissive ?? '#000000'}
      emissiveIntensity={emissive ? 0.6 : 0}
    />
  );
}

function Ball({
  r = 1,
  color,
  position,
  scale,
  emissive,
}: {
  r?: number;
  color: string;
  position?: [number, number, number];
  scale?: [number, number, number];
  emissive?: string;
}) {
  return (
    <mesh position={position} scale={scale} castShadow>
      <sphereGeometry args={[r, 32, 24]} />
      <Toon color={color} emissive={emissive} />
    </mesh>
  );
}

/** Oko so zrenicou a odleskom — pozerá dopredu (+z). */
function Eye({ position, size = 0.1 }: { position: [number, number, number]; size?: number }) {
  return (
    <group position={position}>
      <Ball r={size} color="#ffffff" />
      <Ball r={size * 0.55} color="#1d1530" position={[0, 0, size * 0.62]} />
      <Ball r={size * 0.18} color="#ffffff" position={[size * 0.2, size * 0.22, size * 0.95]} emissive="#ffffff" />
    </group>
  );
}

/** Nekonečné mierne pohupovanie — dýchanie. */
function Breathe({ children, speed = 2, amount = 0.03 }: { children: ReactNode; speed?: number; amount?: number }) {
  const ref = useRef<THREE.Group>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    const s = 1 + Math.sin(clock.elapsedTime * speed) * amount;
    ref.current.scale.set(1, s, 1);
  });
  return <group ref={ref}>{children}</group>;
}

/* ------------------------------------------------------------------
   DRAK ISKRÍK — po ťuknutí zakloní hlavu a vyfúkne veľký oblak iskier
   ------------------------------------------------------------------ */
function Drak() {
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const sparks = useRef<THREE.Group>(null);
  const reaction = useReaction();

  const wingShape = useMemo(() => {
    const s = new THREE.Shape();
    s.moveTo(0, 0);
    s.lineTo(0.35, 0.55);
    s.lineTo(1.05, 0.75);
    s.quadraticCurveTo(0.95, 0.45, 1.1, 0.2);
    s.quadraticCurveTo(0.8, 0.25, 0.75, 0.0);
    s.quadraticCurveTo(0.5, 0.1, 0.4, -0.2);
    s.quadraticCurveTo(0.25, -0.05, 0, 0);
    return s;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const r = reaction();
    const a = arc(r);
    const flap = Math.sin(t * (5 + a * 9)) * (0.4 + a * 0.25);
    if (leftWing.current) leftWing.current.rotation.y = 0.75 + flap;
    if (rightWing.current) rightWing.current.rotation.y = -0.75 - flap;
    if (tail.current) tail.current.rotation.y = Math.sin(t * (1.6 + a * 6)) * 0.35;
    if (head.current) {
      head.current.rotation.z = Math.sin(t * 0.9) * 0.08;
      head.current.rotation.x = -a * 0.45;
    }
    if (sparks.current) {
      const n = sparks.current.children.length;
      sparks.current.children.forEach((child, i) => {
        const big = r >= 0;
        // pri reakcii letia všetky iskry naraz ďaleko dopredu
        const p = big ? Math.min(r * 1.6 + (i / n) * 0.25, 1) : (t * 0.8 + i / n) % 1;
        const spread = big ? 0.55 : 0.15;
        const reach = big ? 1.4 : 0.55;
        child.position.set(Math.sin(i * 2.3) * spread * p, -0.08 + p * (big ? 0.7 : 0.45) + Math.cos(i * 1.7) * spread * p * 0.4, 0.66 + p * reach);
        const sc = big ? (1 - p) * 2.6 + 0.2 : (1 - p) * 1.2 + 0.2;
        child.scale.setScalar(i < 5 || big ? sc : 0.0001);
      });
    }
  });

  const body = '#e8613c';
  const belly = '#ffcf7a';
  const wing = '#b8324a';

  return (
    <group>
      <Breathe speed={2.2}>
        <Ball r={0.6} color={body} position={[0, 0.72, 0]} scale={[1, 0.9, 1.15]} />
        <Ball r={0.5} color={belly} position={[0, 0.66, 0.3]} scale={[0.8, 0.78, 0.6]} />
        <mesh position={[0, 1.15, 0.22]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.28, 0.45, 20]} />
          <Toon color={body} />
        </mesh>
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 1.18 - i * 0.16, -0.28 - i * 0.1]} rotation={[-0.6 - i * 0.12, 0, 0]}>
            <coneGeometry args={[0.08, 0.2, 4]} />
            <Toon color={belly} />
          </mesh>
        ))}
      </Breathe>

      <group ref={head} position={[0, 1.5, 0.38]}>
        <Ball r={0.42} color={body} />
        <Ball r={0.27} color={body} position={[0, -0.1, 0.33]} scale={[1.05, 0.78, 1.1]} />
        <Ball r={0.04} color="#5a1f14" position={[-0.09, -0.04, 0.6]} />
        <Ball r={0.04} color="#5a1f14" position={[0.09, -0.04, 0.6]} />
        <Eye position={[-0.17, 0.1, 0.3]} size={0.12} />
        <Eye position={[0.17, 0.1, 0.3]} size={0.12} />
        {[-1, 1].map((side) => (
          <mesh key={side} position={[side * 0.2, 0.36, -0.08]} rotation={[-0.5, 0, side * -0.3]}>
            <coneGeometry args={[0.07, 0.32, 12]} />
            <Toon color={belly} />
          </mesh>
        ))}
        <group ref={sparks}>
          {Array.from({ length: 12 }).map((_, i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.05, 10, 8]} />
              <meshBasicMaterial color={i % 3 === 0 ? '#ffd23f' : i % 3 === 1 ? '#ff8a3d' : '#ffef9a'} />
            </mesh>
          ))}
        </group>
      </group>

      <group ref={leftWing} position={[-0.3, 1.0, -0.25]}>
        <mesh scale={[-0.78, 0.78, 0.78]} castShadow>
          <shapeGeometry args={[wingShape]} />
          <meshToonMaterial color={wing} gradientMap={getGradient()} side={THREE.DoubleSide} />
        </mesh>
      </group>
      <group ref={rightWing} position={[0.3, 1.0, -0.25]}>
        <mesh scale={0.78} castShadow>
          <shapeGeometry args={[wingShape]} />
          <meshToonMaterial color={wing} gradientMap={getGradient()} side={THREE.DoubleSide} />
        </mesh>
      </group>

      <group ref={tail} position={[0, 0.45, -0.55]}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Ball
            key={i}
            r={0.2 - i * 0.025}
            color={body}
            position={[Math.sin(i * 0.7) * 0.12 * i, -0.06 * i + i * i * 0.02, -0.2 * i]}
          />
        ))}
        <mesh position={[0.45, 0.2, -1.25]} rotation={[-1.2, 0, 0]}>
          <coneGeometry args={[0.12, 0.26, 4]} />
          <Toon color={belly} />
        </mesh>
      </group>

      {[
        [-0.35, 0.14, 0.32],
        [0.35, 0.14, 0.32],
        [-0.38, 0.14, -0.3],
        [0.38, 0.14, -0.3],
      ].map((p, i) => (
        <group key={i} position={p as [number, number, number]}>
          <mesh>
            <capsuleGeometry args={[0.13, 0.18, 6, 16]} />
            <Toon color={body} />
          </mesh>
          <Ball r={0.14} color={body} position={[0, -0.14, 0.06]} scale={[1, 0.6, 1.3]} />
        </group>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------
   VÍLA ROSIČKA — po ťuknutí sa zatočí a rozsype trblietky
   ------------------------------------------------------------------ */
function Vila() {
  const root = useRef<THREE.Group>(null);
  const wings = useRef<THREE.Group[]>([]);
  const wand = useRef<THREE.Group>(null);
  const burst = useRef<THREE.Group>(null);
  const reaction = useReaction();

  const wingShape = useMemo(() => {
    const s = new THREE.Shape();
    s.absellipse(0.38, 0, 0.42, 0.24, 0, Math.PI * 2, false, 0);
    return s;
  }, []);

  const starShape = useMemo(() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i += 1) {
      const r = i % 2 === 0 ? 0.13 : 0.055;
      const a = (i / 10) * Math.PI * 2 + Math.PI / 2;
      if (i === 0) s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
      else s.lineTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    s.closePath();
    return s;
  }, []);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const r = reaction();
    if (root.current) {
      root.current.position.y = 0.25 + Math.sin(t * 1.8) * 0.12 + arc(r) * 0.35;
      root.current.rotation.y = easeInOut(r) * Math.PI * 2;
    }
    wings.current.forEach((w, i) => {
      if (!w) return;
      const side = i < 2 ? 1 : -1;
      w.rotation.y = side * (0.4 + Math.sin(t * (14 + arc(r) * 10)) * 0.35);
    });
    if (wand.current) wand.current.rotation.z = -0.5 + Math.sin(t * 2.4) * 0.25 - arc(r) * 0.6;
    if (burst.current) {
      burst.current.visible = r >= 0;
      burst.current.children.forEach((c, i) => {
        const a = (i / burst.current!.children.length) * Math.PI * 2;
        const d = 0.2 + r * 1.1;
        c.position.set(Math.cos(a) * d, 0.9 + Math.sin(a * 2) * 0.2 + r * 0.4, Math.sin(a) * d);
        c.scale.setScalar(Math.max(1 - r, 0.01));
      });
    }
  });

  const skin = '#ffe0c7';
  const dress = '#f08bb8';
  const hair = '#ffcc4d';

  return (
    <group>
      <group ref={burst} visible={false}>
        {Array.from({ length: 14 }).map((_, i) => (
          <mesh key={i}>
            <octahedronGeometry args={[0.05]} />
            <meshBasicMaterial color={i % 2 ? '#fff3a0' : '#ffd1e8'} />
          </mesh>
        ))}
      </group>
      <group ref={root}>
        <mesh position={[0, 0.55, 0]} castShadow>
          <coneGeometry args={[0.42, 0.9, 32]} />
          <Toon color={dress} />
        </mesh>
        {Array.from({ length: 8 }).map((_, i) => {
          const a = (i / 8) * Math.PI * 2;
          return (
            <Ball key={i} r={0.13} color="#ffb3d1" position={[Math.cos(a) * 0.38, 0.14, Math.sin(a) * 0.38]} scale={[1, 0.5, 1]} />
          );
        })}
        <Ball r={0.16} color={dress} position={[0, 1.02, 0]} scale={[1, 1.1, 0.85]} />

        <mesh position={[-0.2, 0.9, 0.04]} rotation={[0, 0, 0.7]}>
          <capsuleGeometry args={[0.04, 0.26, 4, 10]} />
          <Toon color={skin} />
        </mesh>
        <group ref={wand} position={[0.18, 0.95, 0.08]}>
          <mesh position={[0.1, 0.05, 0]} rotation={[0, 0, -0.9]}>
            <capsuleGeometry args={[0.04, 0.22, 4, 10]} />
            <Toon color={skin} />
          </mesh>
          <mesh position={[0.25, 0.25, 0.02]} rotation={[0, 0, -0.3]}>
            <cylinderGeometry args={[0.012, 0.012, 0.42, 8]} />
            <Toon color="#c48a3a" />
          </mesh>
          <mesh position={[0.31, 0.47, 0.03]}>
            <extrudeGeometry args={[starShape, { depth: 0.03, bevelEnabled: false }]} />
            <meshBasicMaterial color="#ffe14d" />
          </mesh>
          <Sparkles position={[0.31, 0.47, 0.05]} count={14} scale={0.5} size={3} speed={0.6} color="#fff3a0" />
        </group>

        <group position={[0, 1.36, 0]}>
          <Ball r={0.27} color={skin} />
          <Ball r={0.3} color={hair} position={[0, 0.06, -0.07]} scale={[1.05, 1, 0.95]} />
          <Ball r={0.13} color={hair} position={[0, 0.3, -0.12]} />
          <Ball r={0.06} color="#ff9ec4" position={[0.02, 0.38, -0.02]} />
          <Eye position={[-0.09, 0.0, 0.22]} size={0.065} />
          <Eye position={[0.09, 0.0, 0.22]} size={0.065} />
          <Ball r={0.04} color="#ffa8b8" position={[-0.16, -0.08, 0.2]} scale={[1, 0.6, 0.5]} />
          <Ball r={0.04} color="#ffa8b8" position={[0.16, -0.08, 0.2]} scale={[1, 0.6, 0.5]} />
        </group>

        {[
          { x: 0.06, y: 1.12, rz: 0.45, s: 1 },
          { x: 0.06, y: 0.92, rz: -0.35, s: 0.75 },
          { x: -0.06, y: 1.12, rz: Math.PI - 0.45, s: 1 },
          { x: -0.06, y: 0.92, rz: Math.PI + 0.35, s: 0.75 },
        ].map((w, i) => (
          <group
            key={i}
            ref={(el) => {
              if (el) wings.current[i] = el;
            }}
            position={[w.x, w.y, -0.12]}
          >
            <mesh rotation={[0, 0, w.rz]} scale={w.s}>
              <shapeGeometry args={[wingShape]} />
              <meshStandardMaterial
                color="#bdf3ff"
                emissive="#7fd8ff"
                emissiveIntensity={0.35}
                transparent
                opacity={0.62}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          </group>
        ))}
      </group>

      <Sparkles position={[0, 1, 0]} count={30} scale={[1.6, 1.8, 1.2]} size={2.5} speed={0.4} color="#ffd9ec" />
    </group>
  );
}

/* ------------------------------------------------------------------
   ŠKRIATOK MACHUĽA — po ťuknutí vyskočí a čiapka sa mu zatočí
   ------------------------------------------------------------------ */
function Skriatok() {
  const root = useRef<THREE.Group>(null);
  const hat = useRef<THREE.Group>(null);
  const reaction = useReaction();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const r = reaction();
    if (root.current) {
      root.current.position.y = Math.abs(Math.sin(t * 2.6)) * 0.08 + arc(r) * 0.75;
      root.current.rotation.z = Math.sin(t * 2.6) * 0.06;
      root.current.rotation.y = easeInOut(r) * Math.PI * 2;
    }
    if (hat.current) {
      hat.current.rotation.z = 0.25 + Math.sin(t * 2.6 + 0.6) * 0.1 + Math.sin(r * Math.PI * 4) * 0.4 * arc(r);
      hat.current.position.y = 0.2 + arc(r) * 0.25;
    }
  });

  const skin = '#f2c6a0';
  const coat = '#8a5a3b';
  const moss = '#5e8c3a';

  return (
    <group>
      <group ref={root}>
        <Ball r={0.16} color="#4a2f22" position={[-0.17, 0.08, 0.1]} scale={[1, 0.6, 1.5]} />
        <Ball r={0.16} color="#4a2f22" position={[0.17, 0.08, 0.1]} scale={[1, 0.6, 1.5]} />
        <Breathe speed={2.6} amount={0.025}>
          <Ball r={0.45} color={coat} position={[0, 0.52, 0]} scale={[1, 1.05, 0.9]} />
          <mesh position={[0, 0.45, 0]}>
            <torusGeometry args={[0.43, 0.05, 10, 32]} />
            <Toon color="#3b2418" />
          </mesh>
          <mesh position={[0, 0.45, 0.43]}>
            <boxGeometry args={[0.14, 0.12, 0.05]} />
            <Toon color="#e8c14d" />
          </mesh>
        </Breathe>
        <Ball r={0.11} color={skin} position={[-0.47, 0.5, 0.1]} />
        <Ball r={0.11} color={skin} position={[0.47, 0.5, 0.1]} />

        <group position={[0, 1.05, 0.02]}>
          <Ball r={0.3} color={skin} />
          <Ball r={0.13} color="#e8957a" position={[0, -0.03, 0.3]} />
          <Eye position={[-0.11, 0.08, 0.25]} size={0.065} />
          <Eye position={[0.11, 0.08, 0.25]} size={0.065} />
          <mesh position={[0, -0.28, 0.16]} rotation={[Math.PI + 0.25, 0, 0]}>
            <coneGeometry args={[0.24, 0.5, 24]} />
            <Toon color="#f3eee6" />
          </mesh>
          <Ball r={0.08} color="#f3eee6" position={[-0.1, -0.13, 0.27]} scale={[1.4, 0.7, 0.8]} />
          <Ball r={0.08} color="#f3eee6" position={[0.1, -0.13, 0.27]} scale={[1.4, 0.7, 0.8]} />
          <Ball r={0.09} color={skin} position={[-0.3, 0.02, 0]} scale={[0.6, 1.2, 0.8]} />
          <Ball r={0.09} color={skin} position={[0.3, 0.02, 0]} scale={[0.6, 1.2, 0.8]} />
          <group ref={hat} position={[0, 0.2, -0.02]}>
            <mesh position={[0, 0.4, 0]} castShadow>
              <coneGeometry args={[0.34, 0.85, 28]} />
              <Toon color={moss} />
            </mesh>
            <mesh position={[0, 0.02, 0]}>
              <torusGeometry args={[0.31, 0.07, 10, 28]} />
              <Toon color="#7fb04f" />
            </mesh>
            <Ball r={0.08} color="#c9e27a" position={[0, 0.86, 0]} />
          </group>
        </group>
      </group>

      <group position={[0.75, 0, 0.25]}>
        <mesh position={[0, 0.14, 0]}>
          <cylinderGeometry args={[0.07, 0.09, 0.28, 16]} />
          <Toon color="#f6ecd9" />
        </mesh>
        <mesh position={[0, 0.28, 0]} scale={[1, 0.65, 1]}>
          <sphereGeometry args={[0.2, 24, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <Toon color="#d9382e" />
        </mesh>
        <Ball r={0.03} color="#ffffff" position={[0.06, 0.39, 0.08]} />
        <Ball r={0.025} color="#ffffff" position={[-0.09, 0.36, 0.05]} />
        <Ball r={0.025} color="#ffffff" position={[0.02, 0.4, -0.09]} />
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------
   VODNÍK BUBLINKA — po ťuknutí nadvihne klobúk a vypustí oblak bublín
   ------------------------------------------------------------------ */
function Vodnik() {
  const bubbles = useRef<THREE.Group>(null);
  const puddle = useRef<THREE.Mesh>(null);
  const drop = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);
  const hat = useRef<THREE.Group>(null);
  const reaction = useReaction();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const r = reaction();
    const a = arc(r);
    if (body.current) body.current.rotation.y = Math.sin(t * 0.8) * 0.12;
    if (hat.current) {
      hat.current.position.y = 0.25 + a * 0.32;
      hat.current.rotation.z = 0.08 + a * 0.35;
    }
    if (bubbles.current) {
      const n = bubbles.current.children.length;
      bubbles.current.children.forEach((child, i) => {
        const big = r >= 0;
        const p = big ? Math.min(r + (i / n) * 0.3, 1) : (t * 0.35 + i / 6) % 1;
        const spread = big ? 0.5 : 0.08;
        child.position.set(Math.sin(t * 2 + i) * spread * (big ? p : 1), p * (big ? 1.4 : 0.9), Math.cos(i * 1.7) * (big ? spread * p : 0.05));
        child.scale.setScalar(i < 6 || big ? 0.4 + p * (big ? 1.8 : 1.1) : 0.0001);
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.opacity = 0.75 * (1 - p);
      });
    }
    if (puddle.current) {
      const s = 1 + Math.sin(t * 2) * 0.04 + a * 0.25;
      puddle.current.scale.set(s, s, 1);
    }
    if (drop.current) {
      const p = (t * 0.7) % 1;
      drop.current.position.y = 0.42 - p * 0.42;
      drop.current.visible = p < 0.95;
    }
  });

  const skin = '#6fbf8e';
  const coat = '#2f6f7a';

  return (
    <group>
      <mesh ref={puddle} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.62, 40]} />
        <meshStandardMaterial color="#5cc8e6" transparent opacity={0.4} />
      </mesh>
      <mesh ref={drop} position={[0.28, 0.4, -0.25]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#8fe3ff" transparent opacity={0.85} />
      </mesh>

      <group ref={body}>
        <Ball r={0.13} color={skin} position={[-0.15, 0.07, 0.08]} scale={[1.2, 0.5, 1.6]} />
        <Ball r={0.13} color={skin} position={[0.15, 0.07, 0.08]} scale={[1.2, 0.5, 1.6]} />
        <Breathe speed={1.6} amount={0.02}>
          <mesh position={[0, 0.55, 0]} castShadow>
            <cylinderGeometry args={[0.28, 0.42, 0.85, 28]} />
            <Toon color={coat} />
          </mesh>
          <mesh position={[0, 0.6, 0.19]} scale={[0.5, 1, 0.5]}>
            <cylinderGeometry args={[0.27, 0.38, 0.7, 28]} />
            <Toon color="#e9e2c8" />
          </mesh>
          {[0.72, 0.56, 0.4].map((y) => (
            <Ball key={y} r={0.03} color="#e8b84d" position={[0, y, 0.33 + (0.72 - y) * 0.2]} />
          ))}
        </Breathe>
        <mesh position={[-0.36, 0.62, 0.05]} rotation={[0, 0, 0.35]}>
          <capsuleGeometry args={[0.07, 0.32, 4, 10]} />
          <Toon color={coat} />
        </mesh>
        <mesh position={[0.32, 0.75, 0.16]} rotation={[0.9, 0, -0.6]}>
          <capsuleGeometry args={[0.07, 0.3, 4, 10]} />
          <Toon color={coat} />
        </mesh>
        <Ball r={0.07} color={skin} position={[0.24, 0.93, 0.3]} />

        <group position={[0, 1.2, 0.02]}>
          <Ball r={0.3} color={skin} scale={[1.05, 0.95, 1]} />
          <Eye position={[-0.12, 0.06, 0.24]} size={0.085} />
          <Eye position={[0.12, 0.06, 0.24]} size={0.085} />
          <Ball r={0.05} color="#4f9a6d" position={[0, -0.04, 0.3]} />
          <mesh position={[-0.04, -0.15, 0.27]} rotation={[0.2, 0, 0.15]}>
            <torusGeometry args={[0.07, 0.014, 6, 16, Math.PI]} />
            <meshBasicMaterial color="#1d1530" />
          </mesh>
          <mesh position={[0.12, -0.15, 0.32]} rotation={[0, 0, 1.3]}>
            <cylinderGeometry args={[0.018, 0.018, 0.26, 8]} />
            <Toon color="#6b4226" />
          </mesh>
          <mesh position={[0.26, -0.1, 0.34]}>
            <cylinderGeometry args={[0.055, 0.04, 0.1, 14]} />
            <Toon color="#6b4226" />
          </mesh>
          <group ref={bubbles} position={[0.26, -0.04, 0.34]}>
            {Array.from({ length: 14 }).map((_, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.04, 14, 10]} />
                <meshStandardMaterial color="#d8f6ff" transparent opacity={0.6} roughness={0.1} />
              </mesh>
            ))}
          </group>
          <group ref={hat} position={[0, 0.25, -0.02]} rotation={[-0.08, 0, 0.08]}>
            <mesh>
              <cylinderGeometry args={[0.38, 0.38, 0.04, 32]} />
              <Toon color="#20323a" />
            </mesh>
            <mesh position={[0, 0.2, 0]}>
              <cylinderGeometry args={[0.23, 0.25, 0.38, 32]} />
              <Toon color="#20323a" />
            </mesh>
            <mesh position={[0, 0.06, 0]}>
              <cylinderGeometry args={[0.255, 0.255, 0.08, 32]} />
              <Toon color="#c9463d" />
            </mesh>
          </group>
          <Ball r={0.07} color="#3e8f63" position={[-0.27, 0.1, -0.05]} scale={[0.7, 1.4, 1]} />
          <Ball r={0.07} color="#3e8f63" position={[0.27, 0.1, -0.05]} scale={[0.7, 1.4, 1]} />
        </group>
      </group>
    </group>
  );
}

/* ------------------------------------------------------------------
   JEDNOROŽEC LÚČIK — po ťuknutí sa vzopne a roh sa rozžiari
   ------------------------------------------------------------------ */
const RAINBOW = ['#ff8fb1', '#ffc94d', '#6ee7c5', '#8fb8ff', '#b99bff'];

function Jednorozec() {
  const rear = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const horn = useRef<THREE.MeshToonMaterial>(null);
  const legsFront = useRef<THREE.Group>(null);
  const reaction = useReaction();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const r = reaction();
    const a = arc(r);
    if (rear.current) rear.current.rotation.x = -a * 0.42;
    if (legsFront.current) legsFront.current.rotation.x = -a * 0.7;
    if (head.current) {
      head.current.rotation.x = Math.sin(t * 1.4) * 0.06 - a * 0.25;
      head.current.rotation.z = Math.sin(t * 0.7) * 0.05;
    }
    if (tail.current) tail.current.rotation.y = Math.sin(t * 2.2) * 0.4;
    if (horn.current) horn.current.emissiveIntensity = 0.35 + a * 1.4 + Math.sin(t * 3) * 0.1;
  });

  const white = '#fbf7ff';
  const gold = '#e8b84d';

  return (
    <group>
      {/* zadné nohy stoja na zemi, zvyšok tela sa vzpína okolo nich */}
      {[-0.17, 0.17].map((x) => (
        <group key={x} position={[x, 0, -0.32]}>
          <mesh position={[0, 0.3, 0]}>
            <cylinderGeometry args={[0.075, 0.07, 0.56, 14]} />
            <Toon color={white} />
          </mesh>
          <mesh position={[0, 0.04, 0]}>
            <cylinderGeometry args={[0.085, 0.09, 0.08, 14]} />
            <Toon color={gold} />
          </mesh>
        </group>
      ))}

      <group ref={rear} position={[0, 0.62, -0.32]}>
        <group position={[0, -0.62, 0.32]}>
          {/* telo */}
          <mesh position={[0, 0.74, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
            <capsuleGeometry args={[0.3, 0.55, 10, 24]} />
            <Toon color={white} />
          </mesh>
          {/* predné nohy */}
          <group ref={legsFront} position={[0, 0.58, 0.32]}>
            {[-0.17, 0.17].map((x) => (
              <group key={x} position={[x, -0.28, 0]}>
                <mesh>
                  <cylinderGeometry args={[0.075, 0.07, 0.56, 14]} />
                  <Toon color={white} />
                </mesh>
                <mesh position={[0, -0.26, 0]}>
                  <cylinderGeometry args={[0.085, 0.09, 0.08, 14]} />
                  <Toon color={gold} />
                </mesh>
              </group>
            ))}
          </group>
          {/* krk */}
          <mesh position={[0, 1.06, 0.36]} rotation={[0.55, 0, 0]}>
            <cylinderGeometry args={[0.13, 0.19, 0.55, 18]} />
            <Toon color={white} />
          </mesh>
          {/* hriva */}
          {Array.from({ length: 8 }).map((_, i) => {
            // hriva sedí na zadnej strane krku (krk je naklonený o 0.55 rad)
            const y = 1.46 - (i / 7) * 0.6;
            const axisZ = 0.36 + (y - 1.06) * 0.61;
            return (
              <Ball
                key={i}
                r={0.115 - (i / 7) * 0.025}
                color={RAINBOW[i % RAINBOW.length]}
                position={[i % 2 ? 0.04 : -0.04, y + 0.08, axisZ - 0.14]}
              />
            );
          })}
          {/* hlava */}
          <group ref={head} position={[0, 1.38, 0.52]}>
            <Ball r={0.21} color={white} scale={[0.9, 0.95, 1.15]} />
            <Ball r={0.14} color="#ffe6f1" position={[0, -0.08, 0.2]} scale={[1, 0.85, 1]} />
            <Ball r={0.022} color="#c88aa8" position={[-0.05, -0.06, 0.33]} />
            <Ball r={0.022} color="#c88aa8" position={[0.05, -0.06, 0.33]} />
            <Eye position={[-0.11, 0.05, 0.15]} size={0.06} />
            <Eye position={[0.11, 0.05, 0.15]} size={0.06} />
            {[-1, 1].map((s) => (
              <mesh key={s} position={[s * 0.11, 0.2, -0.04]} rotation={[0, 0, s * -0.3]}>
                <coneGeometry args={[0.05, 0.14, 10]} />
                <Toon color={white} />
              </mesh>
            ))}
            {/* roh */}
            <group position={[0, 0.27, 0.07]} rotation={[0.35, 0, 0]}>
              <mesh>
                <coneGeometry args={[0.05, 0.38, 16]} />
                <meshToonMaterial ref={horn} color={gold} emissive="#ffcf4d" emissiveIntensity={0.35} gradientMap={getGradient()} />
              </mesh>
              {[-0.1, 0, 0.1].map((y, i) => (
                <mesh key={y} position={[0, y, 0]} rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.04 - i * 0.012, 0.008, 6, 16]} />
                  <Toon color="#fff1b8" />
                </mesh>
              ))}
              <Sparkles position={[0, 0.2, 0]} count={10} scale={0.4} size={3} speed={0.6} color="#fff3a0" />
            </group>
          </group>
          {/* chvost */}
          <group ref={tail} position={[0, 0.82, -0.5]}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ball key={i} r={0.1 - i * 0.008} color={RAINBOW[(i + 2) % RAINBOW.length]} position={[0, -i * 0.11, -0.05 - i * 0.06]} />
            ))}
          </group>
        </group>
      </group>

      <Sparkles position={[0, 0.9, 0]} count={18} scale={[1.6, 1.4, 1.6]} size={2} speed={0.3} color="#e6dcff" />
    </group>
  );
}

export const CREATURE_MODELS: Record<CreatureId, () => React.JSX.Element> = {
  drak: Drak,
  vila: Vila,
  skriatok: Skriatok,
  vodnik: Vodnik,
  jednorozec: Jednorozec,
};
