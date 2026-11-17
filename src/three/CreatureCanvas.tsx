import { ContactShadows, OrbitControls } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Suspense, useRef } from 'react';
import type * as THREE from 'three';
import type { CreatureId } from '../data/creatures';
import { CREATURE_MODELS } from './models';

interface Props {
  id: CreatureId;
  /** Priehľadné pozadie — bytosť sa vznáša nad obrazom z kamery */
  overlay?: boolean;
  /** Dá sa otáčať prstom a priblížiť */
  interactive?: boolean;
}

/** Zjavenie: bytosť „vyrastie“ zo zeme s malým odrazom. */
function Appear({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null);
  const start = useRef<number | null>(null);
  useFrame(({ clock }) => {
    if (!ref.current) return;
    if (start.current === null) start.current = clock.elapsedTime;
    const p = Math.min((clock.elapsedTime - start.current) / 0.9, 1);
    // ease-out-back
    const c = 1.7;
    const s = 1 + (c + 1) * Math.pow(p - 1, 3) + c * Math.pow(p - 1, 2);
    ref.current.scale.setScalar(Math.max(s, 0.001));
    ref.current.rotation.y = (1 - p) * Math.PI * 1.2;
  });
  return <group ref={ref}>{children}</group>;
}

export function CreatureCanvas({ id, overlay = false, interactive = true }: Props) {
  const Model = CREATURE_MODELS[id];

  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [1.9, 1.5, 4.6], fov: 38 }}
      gl={{ alpha: true, antialias: true }}
      style={{ touchAction: interactive ? 'none' : 'auto' }}
    >
      <ambientLight intensity={1.1} />
      <hemisphereLight args={['#fff4dc', '#5a4a8a', 0.9]} />
      <directionalLight position={[3, 5, 4]} intensity={2.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.7} color="#a9b8ff" />

      <Suspense fallback={null}>
        <group position={[0, -0.85, 0]}>
          <Appear key={id}>
            <Model />
          </Appear>
          <ContactShadows position={[0, 0, 0]} opacity={overlay ? 0.55 : 0.4} scale={4} blur={2.4} far={2} />
        </group>
      </Suspense>

      <OrbitControls
        key={id}
        enabled={interactive}
        enablePan={false}
        minDistance={2.6}
        maxDistance={7}
        minPolarAngle={0.35}
        maxPolarAngle={Math.PI / 2 - 0.05}
        target={[0, 0.05, 0]}
        autoRotate={!overlay}
        autoRotateSpeed={1.2}
      />
    </Canvas>
  );
}
