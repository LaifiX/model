import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import '@fontsource/grandstander/700.css';
import '@fontsource/grandstander/800.css';
import '@fontsource/nunito/400.css';
import '@fontsource/nunito/700.css';
import '@fontsource/nunito/800.css';

import './styles.css';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
