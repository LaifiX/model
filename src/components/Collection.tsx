import { useState } from 'react';
import { CreatureArt } from '../art/CreatureArt';
import { CREATURES, type CreatureId } from '../data/creatures';
import { RarityBadge } from './RarityBadge';

export function Collection({ owned }: { owned: CreatureId[] }) {
  const [lockedTip, setLockedTip] = useState<CreatureId | null>(null);
  const count = owned.length;

  return (
    <div className="page">
      <header className="page-head">
        <h1>Moja zbierka</h1>
        <p className="progress-text">
          {count === CREATURES.length ? 'Máš všetky bytosti! ' : ''}
          {count} / {CREATURES.length} bytostí
        </p>
        <div className="progress" aria-hidden="true">
          <span style={{ width: `${(count / CREATURES.length) * 100}%` }} />
        </div>
      </header>

      {count === 0 && (
        <div className="empty">
          <p>Zatiaľ tu nie je žiadna bytosť.</p>
          <p className="muted">Naskenuj čarovnú kartu a stiahni si prvú.</p>
          <a className="btn btn-primary" href="#/skenovat">
            Skenovať kartu
          </a>
        </div>
      )}

      <div className="collection-grid">
        {CREATURES.map((c, i) => {
          const has = owned.includes(c.id);
          if (has) {
            return (
              <a
                key={c.id}
                href={`#/bytost/${c.id}`}
                className="mini-card"
                style={{ ['--c' as string]: c.color, ['--tilt' as string]: `${i % 2 ? 1.5 : -1.5}deg` }}
              >
                <div className="mini-card-art">
                  <CreatureArt id={c.id} title={c.name} />
                </div>
                <div className="mini-card-body">
                  <strong>{c.name}</strong>
                  <RarityBadge rarity={c.rarity} />
                </div>
              </a>
            );
          }
          return (
            <button
              key={c.id}
              type="button"
              className="mini-card is-locked"
              onClick={() => setLockedTip(lockedTip === c.id ? null : c.id)}
              aria-label="Neobjavená bytosť"
            >
              <div className="mini-card-art">
                <CreatureArt id={c.id} silhouette />
                <span className="lock-mark" aria-hidden="true">?</span>
              </div>
              <div className="mini-card-body">
                <strong>{lockedTip === c.id ? 'Nájdi jej kartu' : '???'}</strong>
                <span className="muted small">{lockedTip === c.id ? 'a naskenuj ju' : 'neobjavená'}</span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
