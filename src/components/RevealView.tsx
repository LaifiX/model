import { useEffect, useMemo, useRef, useState } from 'react';
import { CreatureArt } from '../art/CreatureArt';
import { CREATURE_BY_ID, type CreatureId } from '../data/creatures';
import { sfxCatch, sfxFound, sfxVoice } from '../lib/sfx';
import { LazyCreatureCanvas } from '../three/LazyCreatureCanvas';
import { PhotoButton } from './PhotoButton';
import { RarityBadge } from './RarityBadge';
import { SoundToggle } from './SoundToggle';

interface Props {
  id: CreatureId;
  owned: boolean;
  /** Obraz z kamery — keď je k dispozícii, bytosť sa vznáša nad ním a dá sa odfotiť */
  video?: HTMLVideoElement | null;
  onCatch: (id: CreatureId) => void;
  onOpen: (id: CreatureId) => void;
  onScanAgain: () => void;
}

const CONFETTI_COLORS = ['#ffc94d', '#ff8fb1', '#6ee7c5', '#8fb8ff', '#ffffff'];

/** Bytosť sa zjaví v 3D a dá sa stiahnuť do zbierky. */
export function RevealView({ id, owned, video, onCatch, onOpen, onScanAgain }: Props) {
  const creature = CREATURE_BY_ID[id];
  const overlay = Boolean(video);
  const [justCaught, setJustCaught] = useState(false);
  const [celebrate, setCelebrate] = useState(0);
  const stageRef = useRef<HTMLDivElement>(null);
  const flyRef = useRef<HTMLDivElement>(null);
  const inCollection = owned || justCaught;

  // Zvuk zjavenia a „pozdrav“ bytosti
  useEffect(() => {
    sfxFound();
    const t = window.setTimeout(() => sfxVoice(id), 650);
    return () => window.clearTimeout(t);
  }, [id]);

  const confetti = useMemo(
    () =>
      Array.from({ length: 30 }).map((_, i) => {
        const angle = (i / 30) * Math.PI * 2 + Math.random() * 0.3;
        const dist = 110 + Math.random() * 120;
        return {
          x: Math.cos(angle) * dist,
          y: Math.sin(angle) * dist - 60,
          r: Math.random() * 720 - 360,
          d: 0.9 + Math.random() * 0.5,
          c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
          round: i % 3 === 0,
        };
      }),
    // nová dávka konfiet pri každej oslave
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [celebrate]
  );

  // Karta odletí zo stredu bytosti do záložky Zbierka
  useEffect(() => {
    if (!celebrate || !flyRef.current || !stageRef.current) return;
    const stage = stageRef.current.getBoundingClientRect();
    const tab = document.querySelector<HTMLElement>('.tabbar a[href="#/zbierka"]');
    const target = tab?.getBoundingClientRect();
    const fromX = stage.left + stage.width / 2 - 60;
    const fromY = stage.top + stage.height / 2 - 70;
    const toX = target ? target.left + target.width / 2 - 60 : fromX;
    const toY = target ? target.top + target.height / 2 - 70 : fromY + 400;
    const anim = flyRef.current.animate(
      [
        { transform: `translate(${fromX}px, ${fromY}px) scale(0.3) rotate(0deg)`, opacity: 0 },
        { transform: `translate(${fromX}px, ${fromY - 30}px) scale(1.1) rotate(-6deg)`, opacity: 1, offset: 0.3 },
        { transform: `translate(${fromX}px, ${fromY - 20}px) scale(1) rotate(-4deg)`, opacity: 1, offset: 0.5 },
        { transform: `translate(${toX}px, ${toY}px) scale(0.12) rotate(14deg)`, opacity: 0.6 },
      ],
      { duration: 1300, easing: 'cubic-bezier(.55,0,.4,1)', fill: 'forwards' }
    );
    anim.onfinish = () => {
      tab?.classList.remove('bump');
      void tab?.offsetWidth;
      tab?.classList.add('bump');
    };
    return () => anim.cancel();
  }, [celebrate]);

  const handleCatch = () => {
    onCatch(id);
    setJustCaught(true);
    setCelebrate((n) => n + 1);
    sfxCatch();
    navigator.vibrate?.([30, 40, 120]);
  };

  return (
    <div className={`reveal ${overlay ? 'is-overlay' : 'is-standalone'}`}>
      <div className="reveal-burst" aria-hidden="true" style={{ ['--c' as string]: creature.color }} />

      <div className="reveal-topbar">
        {overlay && <PhotoButton video={video!} stageRef={stageRef} creatureName={creature.name} />}
        <SoundToggle />
      </div>

      <div className="reveal-stage" ref={stageRef}>
        <LazyCreatureCanvas id={id} overlay={overlay} />
        <p className="tap-hint">Ťukni na bytosť</p>
        {celebrate > 0 && (
          <div className="confetti" key={celebrate} aria-hidden="true">
            {confetti.map((p, i) => (
              <span
                key={i}
                className={p.round ? 'round' : ''}
                style={{
                  ['--x' as string]: `${p.x}px`,
                  ['--y' as string]: `${p.y}px`,
                  ['--r' as string]: `${p.r}deg`,
                  ['--d' as string]: `${p.d}s`,
                  background: p.c,
                }}
              />
            ))}
          </div>
        )}
      </div>

      {celebrate > 0 && (
        <div className="fly-card" ref={flyRef} key={`fly-${celebrate}`} aria-hidden="true" style={{ ['--c' as string]: creature.color }}>
          <CreatureArt id={id} />
        </div>
      )}

      <div className="sheet reveal-sheet">
        <div className="reveal-head">
          <div>
            <p className="reveal-kicker">Zjavila sa ti bytosť</p>
            <h2 className="reveal-name">{creature.name}</h2>
            <p className="muted">{creature.title}</p>
          </div>
          <RarityBadge rarity={creature.rarity} />
        </div>

        {justCaught && (
          <p className="caught-msg" role="status">
            Hotovo! {creature.name} je v tvojej zbierke.
          </p>
        )}

        <div className="reveal-actions">
          {inCollection ? (
            <button type="button" className="btn btn-primary" onClick={() => onOpen(id)}>
              Otvoriť v zbierke
            </button>
          ) : (
            <button type="button" className="btn btn-primary btn-glow" onClick={handleCatch}>
              <DownloadIcon /> Stiahnuť do zbierky
            </button>
          )}
          <button type="button" className="btn btn-ghost" onClick={onScanAgain}>
            Skenovať ďalšiu
          </button>
        </div>
        {owned && !justCaught && <p className="muted small">Túto bytosť už v zbierke máš.</p>}
      </div>
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 4v11M7 10l5 5 5-5M5 20h14" />
    </svg>
  );
}
