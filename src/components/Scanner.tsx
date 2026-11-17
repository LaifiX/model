import jsQR from 'jsqr';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CreatureId } from '../data/creatures';
import { parseCardPayload } from '../lib/collection';
import { preload3D } from '../three/LazyCreatureCanvas';
import { RevealView } from './RevealView';
import { SoundToggle } from './SoundToggle';

type Status = 'starting' | 'scanning' | 'found' | 'denied' | 'insecure' | 'unsupported';

interface Props {
  has: (id: CreatureId) => boolean;
  onCatch: (id: CreatureId) => void;
  onOpen: (id: CreatureId) => void;
}

export function Scanner({ has, onCatch, onOpen }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [status, setStatus] = useState<Status>('starting');
  const [foundId, setFoundId] = useState<CreatureId | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  // Spustenie kamery
  useEffect(() => {
    let cancelled = false;

    async function start() {
      preload3D();
      if (!window.isSecureContext) {
        setStatus('insecure');
        return;
      }
      if (!navigator.mediaDevices?.getUserMedia) {
        setStatus('unsupported');
        return;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play().catch(() => {});
        }
        setStatus('scanning');
      } catch {
        if (!cancelled) setStatus('denied');
      }
    }

    start();
    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };
  }, []);

  // Hľadanie QR kódu v obraze (každých ~180 ms, zmenšený snímok)
  useEffect(() => {
    if (status !== 'scanning') return;
    let timer = 0;
    let lastUnknown = '';

    const tick = () => {
      const video = videoRef.current;
      if (video && video.readyState >= 2 && video.videoWidth > 0) {
        const canvas = (canvasRef.current ??= document.createElement('canvas'));
        const w = 480;
        const h = Math.round((video.videoHeight / video.videoWidth) * w);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const img = ctx.getImageData(0, 0, w, h);
          const code = jsQR(img.data, w, h, { inversionAttempts: 'dontInvert' });
          if (code?.data) {
            const id = parseCardPayload(code.data);
            if (id) {
              navigator.vibrate?.([40, 30, 80]);
              setFoundId(id);
              setStatus('found');
              return;
            }
            if (code.data !== lastUnknown) {
              lastUnknown = code.data;
              setHint('Tento kód nie je čarovná karta. Skús inú kartu.');
            }
          }
        }
      }
      timer = window.setTimeout(tick, 180);
    };

    tick();
    return () => window.clearTimeout(timer);
  }, [status]);

  useEffect(() => {
    if (!hint) return;
    const t = window.setTimeout(() => setHint(null), 2600);
    return () => window.clearTimeout(t);
  }, [hint]);

  const scanAgain = useCallback(() => {
    setFoundId(null);
    setStatus('scanning');
  }, []);

  const blocked = status === 'denied' || status === 'insecure' || status === 'unsupported';

  return (
    <div className="scanner">
      <video ref={videoRef} className="scanner-video" playsInline muted autoPlay />
      <div className="scanner-vignette" aria-hidden="true" />

      {status !== 'found' && (
        <div className="reveal-topbar">
          <SoundToggle />
        </div>
      )}

      {status !== 'found' && !blocked && (
        <div className="scanner-ui">
          <div className="viewfinder" aria-hidden="true">
            <span className="corner tl" />
            <span className="corner tr" />
            <span className="corner bl" />
            <span className="corner br" />
            {status === 'scanning' && <span className="scanline" />}
          </div>
          <p className="scanner-hint" role="status">
            {status === 'starting' ? 'Zapínam kameru…' : hint ?? 'Namier kameru na QR kód čarovnej karty'}
          </p>
          <a className="link-btn" href="#/karty">
            Nemáš kartu? Vytlač si ju
          </a>
        </div>
      )}

      {blocked && (
        <div className="scanner-blocked">
          <div className="sheet">
            <h2>Kamera nie je dostupná</h2>
            {status === 'insecure' && (
              <p>
                Prehliadač púšťa kameru len cez zabezpečenú adresu <strong>https://</strong>. Otvor aplikáciu cez
                adresu „Network: https://…“, ktorú vypíše spúšťač.
              </p>
            )}
            {status === 'denied' && (
              <p>
                Prístup ku kamere bol zamietnutý. Povoľ ho v nastaveniach prehliadača (ikona zámku vedľa adresy) a
                obnov stránku.
              </p>
            )}
            {status === 'unsupported' && <p>Tento prehliadač nevie používať kameru. Skús Chrome alebo Safari.</p>}
            <p className="muted">Bytosti si môžeš vyskúšať aj bez kamery — na stránke s kartami.</p>
            <a className="btn btn-primary" href="#/karty">
              Zobraziť karty
            </a>
          </div>
        </div>
      )}

      {status === 'found' && foundId && (
        <RevealView
          id={foundId}
          owned={has(foundId)}
          video={videoRef.current}
          onCatch={onCatch}
          onOpen={onOpen}
          onScanAgain={scanAgain}
        />
      )}
    </div>
  );
}
