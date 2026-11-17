import { useState } from 'react';
import { CREATURE_BY_ID, type CreatureId } from '../data/creatures';
import { CreatureCanvas } from '../three/CreatureCanvas';
import { RarityBadge } from './RarityBadge';

interface Props {
  id: CreatureId;
  owned: boolean;
  overlay?: boolean;
  onCatch: (id: CreatureId) => void;
  onOpen: (id: CreatureId) => void;
  onScanAgain: () => void;
}

/** Bytosť sa zjaví v 3D a dá sa stiahnuť do zbierky. */
export function RevealView({ id, owned, overlay = false, onCatch, onOpen, onScanAgain }: Props) {
  const creature = CREATURE_BY_ID[id];
  const [justCaught, setJustCaught] = useState(false);
  const inCollection = owned || justCaught;

  const handleCatch = () => {
    onCatch(id);
    setJustCaught(true);
    navigator.vibrate?.(120);
  };

  return (
    <div className={`reveal ${overlay ? 'is-overlay' : 'is-standalone'}`}>
      <div className="reveal-burst" aria-hidden="true" style={{ ['--c' as string]: creature.color }} />
      <div className="reveal-stage">
        <CreatureCanvas id={id} overlay={overlay} />
      </div>

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
