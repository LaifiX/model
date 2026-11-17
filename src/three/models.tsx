import { Sparkles } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import type { CreatureId } from '../data/creatures';

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
   DRAK ISKRÍK
   ------------------------------------------------------------------ */
function Drak() {
  const leftWing = useRef<THREE.Group>(null);
  const rightWing = useRef<THREE.Group>(null);
  const tail = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const sparks = useRef<THREE.Group>(null);

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
    const flap = Math.sin(t * 5) * 0.4;
    if (leftWing.current) leftWing.current.rotation.y = 0.75 + flap;
    if (rightWing.current) rightWing.current.rotation.y = -0.75 - flap;
    if (tail.current) tail.current.rotation.y = Math.sin(t * 1.6) * 0.35;
    if (head.current) head.current.rotation.z = Math.sin(t * 0.9) * 0.08;
    if (sparks.current) {
      sparks.current.children.forEach((child, i) => {
        const p = (t * 0.8 + i / 5) % 1;
        child.position.set(Math.sin(i * 2.3) * 0.15 * p, -0.08 + p * 0.45, 0.66 + p * 0.55);
        const sc = (1 - p) * 0.06 + 0.01;
        child.scale.setScalar(sc / 0.05);
      });
    }
  });

  const body = '#e8613c';
  const belly = '#ffcf7a';
  const wing = '#b8324a';

  return (
    <group position={[0, 0, 0]}>
      <Breathe speed={2.2}>
        {/* trup */}
        <Ball r={0.6} color={body} position={[0, 0.72, 0]} scale={[1, 0.9, 1.15]} />
        <Ball r={0.5} color={belly} position={[0, 0.66, 0.3]} scale={[0.8, 0.78, 0.6]} />
        {/* krk */}
        <mesh position={[0, 1.15, 0.22]} rotation={[0.35, 0, 0]}>
          <cylinderGeometry args={[0.2, 0.28, 0.45, 20]} />
          <Toon color={body} />
        </mesh>
        {/* hrebeň na chrbte */}
        {[0, 1, 2, 3, 4].map((i) => (
          <mesh key={i} position={[0, 1.18 - i * 0.16, -0.28 - i * 0.1]} rotation={[-0.6 - i * 0.12, 0, 0]}>
            <coneGeometry args={[0.08, 0.2, 4]} />
            <Toon color={belly} />
          </mesh>
        ))}
      </Breathe>

      {/* hlava */}
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
        {/* iskry z nozdier */}
        <group ref={sparks}>
          {[0, 1, 2, 3, 4].map((i) => (
            <mesh key={i}>
              <sphereGeometry args={[0.05, 10, 8]} />
              <meshBasicMaterial color={i % 2 ? '#ffd23f' : '#ff8a3d'} />
            </mesh>
          ))}
        </group>
      </group>

      {/* krídla */}
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

      {/* chvost */}
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

      {/* nohy */}
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
   VÍLA ROSIČKA
   ------------------------------------------------------------------ */
function Vila() {
  const root = useRef<THREE.Group>(null);
  const wings = useRef<THREE.Group[]>([]);
  const wand = useRef<THREE.Group>(null);

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
    if (root.current) root.current.position.y = 0.25 + Math.sin(t * 1.8) * 0.12;
    wings.current.forEach((w, i) => {
      if (!w) return;
      const side = i < 2 ? 1 : -1;
      w.rotation.y = side * (0.4 + Math.sin(t * 14) * 0.35);
    });
    if (wand.current) wand.current.rotation.z = -0.5 + Math.sin(t * 2.4) * 0.25;
  });

  const skin = '#ffe0c7';
  const dress = '#f08bb8';
  const hair = '#ffcc4d';

  return (
    <group ref={root}>
      {/* šaty */}
      <mesh position={[0, 0.55, 0]} castShadow>
        <coneGeometry args={[0.42, 0.9, 32]} />
        <Toon color={dress} />
      </mesh>
      {/* lupene na leme šiat */}
      {Array.from({ length: 8 }).map((_, i) => {
        const a = (i / 8) * Math.PI * 2;
        return (
          <Ball key={i} r={0.13} color="#ffb3d1" position={[Math.cos(a) * 0.38, 0.14, Math.sin(a) * 0.38]} scale={[1, 0.5, 1]} />
        );
      })}
      <Ball r={0.16} color={dress} position={[0, 1.02, 0]} scale={[1, 1.1, 0.85]} />

      {/* ruky */}
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

      {/* hlava */}
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

      {/* krídla — štyri lístky */}
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

      <Sparkles position={[0, 0.8, 0]} count={30} scale={[1.6, 1.8, 1.2]} size={2.5} speed={0.4} color="#ffd9ec" />
    </group>
  );
}

/* ------------------------------------------------------------------
   ŠKRIATOK MACHUĽA
   ------------------------------------------------------------------ */
function Skriatok() {
  const root = useRef<THREE.Group>(null);
  const hat = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (root.current) {
      root.current.position.y = Math.abs(Math.sin(t * 2.6)) * 0.08;
      root.current.rotation.z = Math.sin(t * 2.6) * 0.06;
    }
    if (hat.current) hat.current.rotation.z = 0.25 + Math.sin(t * 2.6 + 0.6) * 0.1;
  });

  const skin = '#f2c6a0';
  const coat = '#8a5a3b';
  const moss = '#5e8c3a';

  return (
    <group>
      <group ref={root}>
        {/* nohy */}
        <Ball r={0.16} color="#4a2f22" position={[-0.17, 0.08, 0.1]} scale={[1, 0.6, 1.5]} />
        <Ball r={0.16} color="#4a2f22" position={[0.17, 0.08, 0.1]} scale={[1, 0.6, 1.5]} />
        {/* telo */}
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
        {/* ruky */}
        <Ball r={0.11} color={skin} position={[-0.47, 0.5, 0.1]} />
        <Ball r={0.11} color={skin} position={[0.47, 0.5, 0.1]} />

        {/* hlava */}
        <group position={[0, 1.05, 0.02]}>
          <Ball r={0.3} color={skin} />
          <Ball r={0.13} color="#e8957a" position={[0, -0.03, 0.3]} />
          <Eye position={[-0.11, 0.08, 0.25]} size={0.065} />
          <Eye position={[0.11, 0.08, 0.25]} size={0.065} />
          {/* fúzy a brada */}
          <mesh position={[0, -0.28, 0.16]} rotation={[Math.PI + 0.25, 0, 0]}>
            <coneGeometry args={[0.24, 0.5, 24]} />
            <Toon color="#f3eee6" />
          </mesh>
          <Ball r={0.08} color="#f3eee6" position={[-0.1, -0.13, 0.27]} scale={[1.4, 0.7, 0.8]} />
          <Ball r={0.08} color="#f3eee6" position={[0.1, -0.13, 0.27]} scale={[1.4, 0.7, 0.8]} />
          {/* uši */}
          <Ball r={0.09} color={skin} position={[-0.3, 0.02, 0]} scale={[0.6, 1.2, 0.8]} />
          <Ball r={0.09} color={skin} position={[0.3, 0.02, 0]} scale={[0.6, 1.2, 0.8]} />
          {/* machová čiapka */}
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

      {/* hríbik vedľa */}
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
   VODNÍK BUBLINKA
   ------------------------------------------------------------------ */
function Vodnik() {
  const bubbles = useRef<THREE.Group>(null);
  const puddle = useRef<THREE.Mesh>(null);
  const drop = useRef<THREE.Mesh>(null);
  const body = useRef<THREE.Group>(null);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (body.current) body.current.rotation.y = Math.sin(t * 0.8) * 0.12;
    if (bubbles.current) {
      bubbles.current.children.forEach((child, i) => {
        const p = (t * 0.35 + i / 6) % 1;
        child.position.set(Math.sin(t * 2 + i) * 0.08, p * 0.9, Math.cos(i * 1.7) * 0.05);
        child.scale.setScalar(0.4 + p * 1.1);
        const mat = (child as THREE.Mesh).material as THREE.MeshStandardMaterial;
        mat.opacity = 0.75 * (1 - p);
      });
    }
    if (puddle.current) {
      const s = 1 + Math.sin(t * 2) * 0.04;
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
      {/* mláka */}
      <mesh ref={puddle} rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[0.62, 40]} />
        <meshStandardMaterial color="#5cc8e6" transparent opacity={0.4} />
      </mesh>
      <mesh ref={drop} position={[0.28, 0.4, -0.25]}>
        <sphereGeometry args={[0.035, 10, 8]} />
        <meshStandardMaterial color="#8fe3ff" transparent opacity={0.85} />
      </mesh>

      <group ref={body}>
        {/* nohy */}
        <Ball r={0.13} color={skin} position={[-0.15, 0.07, 0.08]} scale={[1.2, 0.5, 1.6]} />
        <Ball r={0.13} color={skin} position={[0.15, 0.07, 0.08]} scale={[1.2, 0.5, 1.6]} />
        {/* frak */}
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
        {/* ruky + fajka */}
        <mesh position={[-0.36, 0.62, 0.05]} rotation={[0, 0, 0.35]}>
          <capsuleGeometry args={[0.07, 0.32, 4, 10]} />
          <Toon color={coat} />
        </mesh>
        <mesh position={[0.32, 0.75, 0.16]} rotation={[0.9, 0, -0.6]}>
          <capsuleGeometry args={[0.07, 0.3, 4, 10]} />
          <Toon color={coat} />
        </mesh>
        <Ball r={0.07} color={skin} position={[0.24, 0.93, 0.3]} />

        {/* hlava */}
        <group position={[0, 1.2, 0.02]}>
          <Ball r={0.3} color={skin} scale={[1.05, 0.95, 1]} />
          <Eye position={[-0.12, 0.06, 0.24]} size={0.085} />
          <Eye position={[0.12, 0.06, 0.24]} size={0.085} />
          <Ball r={0.05} color="#4f9a6d" position={[0, -0.04, 0.3]} />
          <mesh position={[-0.04, -0.15, 0.27]} rotation={[0.2, 0, 0.15]}>
            <torusGeometry args={[0.07, 0.014, 6, 16, Math.PI]} />
            <meshBasicMaterial color="#1d1530" />
          </mesh>
          {/* fajka */}
          <mesh position={[0.12, -0.15, 0.32]} rotation={[0, 0, 1.3]}>
            <cylinderGeometry args={[0.018, 0.018, 0.26, 8]} />
            <Toon color="#6b4226" />
          </mesh>
          <mesh position={[0.26, -0.1, 0.34]}>
            <cylinderGeometry args={[0.055, 0.04, 0.1, 14]} />
            <Toon color="#6b4226" />
          </mesh>
          <group ref={bubbles} position={[0.26, -0.04, 0.34]}>
            {Array.from({ length: 6 }).map((_, i) => (
              <mesh key={i}>
                <sphereGeometry args={[0.04, 14, 10]} />
                <meshStandardMaterial color="#d8f6ff" transparent opacity={0.6} roughness={0.1} />
              </mesh>
            ))}
          </group>
          {/* klobúk */}
          <group position={[0, 0.25, -0.02]} rotation={[-0.08, 0, 0.08]}>
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
          {/* „vlasy“ s kvapkou */}
          <Ball r={0.07} color="#3e8f63" position={[-0.27, 0.1, -0.05]} scale={[0.7, 1.4, 1]} />
          <Ball r={0.07} color="#3e8f63" position={[0.27, 0.1, -0.05]} scale={[0.7, 1.4, 1]} />
        </group>
      </group>
    </group>
  );
}

export const CREATURE_MODELS: Record<CreatureId, () => React.JSX.Element> = {
  drak: Drak,
  vila: Vila,
  skriatok: Skriatok,
  vodnik: Vodnik,
};
