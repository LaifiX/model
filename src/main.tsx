import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/grandstander/700.css';
import '@fontsource/grandstander/800.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';

import './styles.css';
import { App } from './App';
import { unlockAudio } from './lib/sfx';

// Telefóny pustia zvuk až po prvom dotyku používateľa
window.addEventListener('pointerdown', unlockAudio, { once: true, capture: true });

// Offline režim a inštalácia na plochu (len v zverejnenej verzii)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  });
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
