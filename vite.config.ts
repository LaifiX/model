import basicSsl from '@vitejs/plugin-basic-ssl';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// Kamera v mobile funguje len cez HTTPS — basicSsl vytvorí lokálny certifikát.
export default defineConfig({
  plugins: [react(), basicSsl()],
  base: './',
  server: { host: true, port: 5180 },
  preview: { host: true, port: 5180 },
});
