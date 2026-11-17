import { useSyncExternalStore } from 'react';
import type { CreatureId } from '../data/creatures';

/* Zvuky sa skladajú priamo cez Web Audio — žiadne súbory na stiahnutie. */

const KEY = 'carokarty_zvuk_v1';
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let enabled = (() => {
  try {
    return localStorage.getItem(KEY) !== 'off';
  } catch {
    return true;
  }
})();
const listeners = new Set<() => void>();

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) {
    ctx = new Ctor();
    master = ctx.createGain();
    master.gain.value = 0.7;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  return ctx;
}

/** Telefóny pustia zvuk až po prvom dotyku — zavolá sa pri prvom ťuknutí kdekoľvek. */
export function unlockAudio() {
  const a = audio();
  if (!a) return;
  // krátke ticho „odomkne“ zvuk v Safari
  const buf = a.createBuffer(1, 1, 22050);
  const src = a.createBufferSource();
  src.buffer = buf;
  src.connect(a.destination);
  src.start(0);
}

export function setSoundEnabled(value: boolean) {
  enabled = value;
  try {
    localStorage.setItem(KEY, value ? 'on' : 'off');
  } catch {
    // ignore
  }
  listeners.forEach((l) => l());
}

export function useSoundEnabled(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => enabled
  );
}

interface ToneOpts {
  freq: number;
  at?: number;
  dur?: number;
  type?: OscillatorType;
  gain?: number;
  slideTo?: number;
  attack?: number;
}

function tone({ freq, at = 0, dur = 0.2, type = 'sine', gain = 0.2, slideTo, attack = 0.01 }: ToneOpts) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + at;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain, t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(g).connect(master);
  osc.start(t);
  osc.stop(t + dur + 0.05);
}

function noise({ at = 0, dur = 0.2, gain = 0.15, freq = 1200, type = 'bandpass' as BiquadFilterType }) {
  const a = audio();
  if (!a || !master) return;
  const t = a.currentTime + at;
  const len = Math.ceil(a.sampleRate * dur);
  const buf = a.createBuffer(1, len, a.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i += 1) data[i] = Math.random() * 2 - 1;
  const src = a.createBufferSource();
  src.buffer = buf;
  const filter = a.createBiquadFilter();
  filter.type = type;
  filter.frequency.value = freq;
  const g = a.createGain();
  g.gain.setValueAtTime(gain, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(filter).connect(g).connect(master);
  src.start(t);
}

const play = (fn: () => void) => {
  if (enabled) fn();
};

/** Karta nájdená — trblietavé arpeggio. */
export const sfxFound = () =>
  play(() => {
    [1047, 1319, 1568, 2093].forEach((f, i) => tone({ freq: f, at: i * 0.07, dur: 0.35, type: 'triangle', gain: 0.12 }));
    [2637, 3136].forEach((f, i) => tone({ freq: f, at: 0.3 + i * 0.09, dur: 0.6, gain: 0.05 }));
  });

/** Bytosť stiahnutá do zbierky — malá fanfára. */
export const sfxCatch = () =>
  play(() => {
    const notes = [392, 523, 659, 784];
    notes.forEach((f, i) => tone({ freq: f, at: i * 0.09, dur: 0.18, type: 'square', gain: 0.06 }));
    [523, 659, 784, 1047].forEach((f) => tone({ freq: f, at: 0.4, dur: 0.9, type: 'triangle', gain: 0.07 }));
    noise({ at: 0.4, dur: 0.5, gain: 0.04, freq: 6000, type: 'highpass' });
  });

/** Spúšť fotoaparátu. */
export const sfxShutter = () =>
  play(() => {
    noise({ dur: 0.06, gain: 0.25, freq: 3000 });
    noise({ at: 0.08, dur: 0.05, gain: 0.18, freq: 2000 });
  });

export const sfxTap = () => play(() => tone({ freq: 660, dur: 0.08, type: 'triangle', gain: 0.06 }));

const VOICES: Record<CreatureId, () => void> = {
  drak: () => {
    tone({ freq: 140, dur: 0.55, type: 'sawtooth', gain: 0.12, slideTo: 70, attack: 0.05 });
    tone({ freq: 210, dur: 0.4, type: 'square', gain: 0.03, slideTo: 100, attack: 0.05 });
    for (let i = 0; i < 6; i += 1) noise({ at: 0.15 + i * 0.06, dur: 0.05, gain: 0.08, freq: 2500 + Math.random() * 2500 });
  },
  vila: () => {
    [1568, 2093, 2637, 3136].forEach((f, i) => tone({ freq: f, at: i * 0.11, dur: 1.1, gain: 0.07 }));
    tone({ freq: 4186, at: 0.45, dur: 0.8, gain: 0.03 });
  },
  skriatok: () => {
    [880, 1040, 820, 980, 760].forEach((f, i) =>
      tone({ freq: f, at: i * 0.085, dur: 0.07, type: 'triangle', gain: 0.1, slideTo: f * 0.8 })
    );
  },
  vodnik: () => {
    for (let i = 0; i < 6; i += 1) {
      const f = 260 + Math.random() * 200;
      tone({ freq: f, at: i * 0.09 + Math.random() * 0.04, dur: 0.12, gain: 0.12, slideTo: f * 2.6 });
    }
  },
  jednorozec: () => {
    tone({ freq: 523, dur: 0.7, gain: 0.08, slideTo: 1568, attack: 0.05 });
    [1319, 1760, 2093, 2637].forEach((f, i) => tone({ freq: f, at: 0.35 + i * 0.08, dur: 0.9, gain: 0.05 }));
  },
};

export const sfxVoice = (id: CreatureId) => play(VOICES[id]);
