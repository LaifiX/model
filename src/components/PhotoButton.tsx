import { useEffect, useState, type RefObject } from 'react';
import { sfxShutter } from '../lib/sfx';

interface Props {
  video: HTMLVideoElement;
  stageRef: RefObject<HTMLDivElement | null>;
  creatureName: string;
}

interface Photo {
  url: string;
  file: File;
}

/** Spojí obraz z kamery a 3D bytosť do jednej fotky. */
async function composePhoto(video: HTMLVideoElement, glCanvas: HTMLCanvasElement, label: string): Promise<File | null> {
  const W = window.innerWidth;
  const H = window.innerHeight;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const out = document.createElement('canvas');
  out.width = Math.round(W * dpr);
  out.height = Math.round(H * dpr);
  const ctx = out.getContext('2d');
  if (!ctx) return null;
  ctx.scale(dpr, dpr);

  // kamera — rovnaký orez ako na obrazovke (object-fit: cover)
  const vw = video.videoWidth || W;
  const vh = video.videoHeight || H;
  const s = Math.max(W / vw, H / vh);
  ctx.drawImage(video, (W - vw * s) / 2, (H - vh * s) / 2, vw * s, vh * s);

  // bytosť
  const r = glCanvas.getBoundingClientRect();
  ctx.drawImage(glCanvas, r.left, r.top, r.width, r.height);

  // podpis
  await document.fonts?.ready;
  ctx.font = '800 20px Grandstander, sans-serif';
  const text = `✦ ${label} · Čarokarty`;
  const tw = ctx.measureText(text).width;
  const x = 16;
  const y = H - 30;
  ctx.fillStyle = 'rgba(31, 24, 56, 0.78)';
  ctx.beginPath();
  ctx.roundRect(x, y - 24, tw + 28, 38, 19);
  ctx.fill();
  ctx.fillStyle = '#ffc94d';
  ctx.fillText(text, x + 14, y + 2);

  const blob = await new Promise<Blob | null>((res) => out.toBlob(res, 'image/jpeg', 0.92));
  if (!blob) return null;
  const safe = label.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-').toLowerCase();
  return new File([blob], `carokarty-${safe}.jpg`, { type: 'image/jpeg' });
}

export function PhotoButton({ video, stageRef, creatureName }: Props) {
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [flash, setFlash] = useState(false);

  useEffect(() => () => {
    if (photo) URL.revokeObjectURL(photo.url);
  }, [photo]);

  const take = async () => {
    const canvas = stageRef.current?.querySelector('canvas');
    if (!canvas) return;
    sfxShutter();
    setFlash(true);
    window.setTimeout(() => setFlash(false), 350);
    const file = await composePhoto(video, canvas, creatureName);
    if (file) setPhoto({ file, url: URL.createObjectURL(file) });
  };

  const canShare = photo && typeof navigator.canShare === 'function' && navigator.canShare({ files: [photo.file] });

  const share = async () => {
    if (!photo) return;
    try {
      await navigator.share({ files: [photo.file], title: `${creatureName} — Čarokarty` });
    } catch {
      // používateľ zdieľanie zrušil
    }
  };

  return (
    <>
      <button type="button" className="round-btn" onClick={take} aria-label="Odfotiť sa s bytosťou" title="Odfotiť sa s bytosťou">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M4 8.5A1.5 1.5 0 0 1 5.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0 1 20 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5z" />
          <circle cx="12" cy="13" r="3.5" />
        </svg>
      </button>

      {flash && <div className="shutter-flash" aria-hidden="true" />}

      {photo && (
        <div className="photo-modal" role="dialog" aria-modal="true" aria-label="Fotka s bytosťou">
          <div className="photo-frame">
            <img src={photo.url} alt={`Fotka s bytosťou ${creatureName}`} />
          </div>
          <div className="photo-actions">
            {canShare && (
              <button type="button" className="btn btn-primary" onClick={share}>
                Zdieľať
              </button>
            )}
            <a className={`btn ${canShare ? 'btn-ghost' : 'btn-primary'}`} href={photo.url} download={photo.file.name}>
              Uložiť fotku
            </a>
            <button type="button" className="btn btn-ghost" onClick={() => setPhoto(null)}>
              Zavrieť
            </button>
          </div>
        </div>
      )}
    </>
  );
}
