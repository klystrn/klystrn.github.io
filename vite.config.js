import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// User/org root Pages site (klystrn.github.io) deploys from the domain root,
// so base MUST stay '/' — never a subpath.
export default defineConfig({
  base: '/',
  plugins: [react()],
});
