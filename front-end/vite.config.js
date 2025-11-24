import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // 👈 AQUI É ONDE VOCÊ DEFINE A PORTA
    port: 3000, 
    // Você também pode adicionar um hostname se necessário:
    // host: '0.0.0.0'
  }
});