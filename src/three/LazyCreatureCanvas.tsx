import { lazy, Suspense } from 'react';
import type { CreatureCanvasProps } from './CreatureCanvas';

/* 3D knižnica je veľká — načíta sa až vtedy, keď je naozaj treba. */
const load = () => import('./CreatureCanvas');
const Canvas3D = lazy(load);

/** Začne sťahovať 3D na pozadí (napr. keď sa zapne skener). */
export const preload3D = () => {
  void load();
};

export function LazyCreatureCanvas(props: CreatureCanvasProps) {
  return (
    <Suspense
      fallback={
        <div className="stage-loading" role="status">
          <span className="stage-loading-star" aria-hidden="true">✦</span>
          Bytosť sa zjavuje…
        </div>
      }
    >
      <Canvas3D {...props} />
    </Suspense>
  );
}
