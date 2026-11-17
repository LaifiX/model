import { useState } from 'react';
import { CreatureArt } from '../art/CreatureArt';
import { CREATURE_BY_ID, type CreatureId } from '../data/creatures';
import { LazyCreatureCanvas } from '../three/LazyCreatureCanvas';
import { SoundToggle } from './SoundToggle';
import { RarityBadge } from './RarityBadge';

export function Detail({ id }: { id: CreatureId }) {
  const c = CREATURE_BY_ID[id];
  const [view, setView] = useState<'3d' | '2d'>('3d');

  return (
    <div className="page detail" style={{ ['--c' as string]: c.color }}>
      <div className="detail-top">
        <a className="back-link" href="#/zbierka">
          ‹ Zbierka
        </a>
        <SoundToggle className="is-flat" />
      </div>

      <section className="detail-stage">
        {view === '3d' ? (
          <>
            <LazyCreatureCanvas id={id} />
            <p className="stage-hint">Ťukni na bytosť · otáčaj prstom · priblíž dvoma prstami</p>
          </>
        ) : (
          <div className="detail-2d">
            <CreatureArt id={id} title={c.name} />
          </div>
        )}
        <div className="segmented" role="group" aria-label="Zobrazenie">
          <button type="button" aria-pressed={view === '3d'} onClick={() => setView('3d')}>
            3D
          </button>
          <button type="button" aria-pressed={view === '2d'} onClick={() => setView('2d')}>
            2D
          </button>
        </div>
      </section>

      <header className="detail-head">
        <div>
          <h1>{c.name}</h1>
          <p className="muted">{c.title}</p>
        </div>
        <RarityBadge rarity={c.rarity} />
      </header>

      <section className="detail-section">
        {c.story.map((p) => (
          <p key={p.slice(0, 20)}>{p}</p>
        ))}
      </section>

      <section className="detail-section">
        <h2>Vlastnosti</h2>
        <ul className="stats">
          {c.stats.map((s) => (
            <li key={s.label}>
              <span>{s.label}</span>
              <span className="stat-dots" aria-label={`${s.value} z 5`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={i < s.value ? 'on' : ''} />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="detail-section">
        <h2>Čo dokáže</h2>
        <ul className="chips">
          {c.abilities.map((a) => (
            <li key={a}>{a}</li>
          ))}
        </ul>
      </section>

      <section className="detail-section facts">
        <dl>
          <dt>Kde žije</dt>
          <dd>{c.habitat}</dd>
          <dt>Veľkosť</dt>
          <dd>{c.size}</dd>
          <dt>Čo papá</dt>
          <dd>{c.food}</dd>
          <dt>Povaha</dt>
          <dd>{c.traits.join(', ')}</dd>
        </dl>
      </section>

      <aside className="fun-fact">
        <strong>Vedel si, že…</strong>
        <p>{c.funFact}</p>
      </aside>
    </div>
  );
}
