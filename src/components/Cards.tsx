import QRCode from 'qrcode';
import { useEffect, useState } from 'react';
import { CreatureArt } from '../art/CreatureArt';
import { CREATURES, type CreatureId } from '../data/creatures';
import { cardUrl } from '../lib/collection';
import { RarityBadge } from './RarityBadge';

/** Čarovné karty na vytlačenie — QR kód obsahuje odkaz na bytosť. */
export function Cards() {
  const [qr, setQr] = useState<Partial<Record<CreatureId, string>>>({});

  useEffect(() => {
    let alive = true;
    Promise.all(
      CREATURES.map(async (c) => {
        const svg = await QRCode.toString(cardUrl(c.id), {
          type: 'svg',
          margin: 1,
          errorCorrectionLevel: 'M',
          color: { dark: '#2a1f3d', light: '#ffffff' },
        });
        return [c.id, svg] as const;
      })
    ).then((entries) => {
      if (alive) setQr(Object.fromEntries(entries));
    });
    return () => {
      alive = false;
    };
  }, []);

  const isLocal = /^(localhost|127\.|192\.168\.|10\.|172\.)/.test(location.hostname);

  return (
    <div className="page">
      <header className="page-head no-print">
        <h1>Čarovné karty</h1>
        <p className="muted">
          Vytlač si karty (alebo ich otvor na inom displeji) a naskenuj QR kód v aplikácii. Funguje aj obyčajný
          fotoaparát v telefóne — otvorí rovno zjavenie bytosti.
        </p>
        {isLocal && (
          <p className="note">
            QR kódy obsahujú adresu <code>{location.host}</code> — fungujú, kým beží spúšťač a telefón je na rovnakej
            Wi-Fi.
          </p>
        )}
        <button type="button" className="btn btn-primary" onClick={() => window.print()}>
          Vytlačiť karty
        </button>
      </header>

      <div className="cards-grid">
        {CREATURES.map((c) => (
          <article key={c.id} className="play-card" style={{ ['--c' as string]: c.color }}>
            <div className="play-card-top">
              <span className="play-card-name">{c.name}</span>
              <RarityBadge rarity={c.rarity} />
            </div>
            <div className="play-card-art">
              <CreatureArt id={c.id} title={c.name} />
            </div>
            <div className="play-card-bottom">
              <div
                className="play-card-qr"
                aria-label={`QR kód pre ${c.name}`}
                dangerouslySetInnerHTML={{ __html: qr[c.id] ?? '' }}
              />
              <p>
                <strong>{c.title}</strong>
                <br />
                Naskenuj ma v Čarokartách!
              </p>
            </div>
            <a className="link-btn no-print" href={`#/c/${c.id}`}>
              Vyskúšať bez kamery
            </a>
          </article>
        ))}
      </div>
    </div>
  );
}
