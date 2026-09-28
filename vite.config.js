import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// base relativa: funciona igual en local y en GitHub Pages (subcarpeta del repositorio)
export default defineConfig({
  plugins: [react()],
  base: './',
});
