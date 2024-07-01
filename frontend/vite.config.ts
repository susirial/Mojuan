import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from 'tailwindcss';
import autoprefixer from 'autoprefixer';

export default defineConfig({
  plugins: [react()],
  css: {
    postcss: {
      plugins: [
        tailwindcss(),
        autoprefixer(),
       
      ],
    },
  },
  server: {
    watch: {
      usePolling: true
    },
    proxy: {
      "^/(assistants|threads|ingest|runs|register|login|listusers|vemail|order)": {
        target: "http://127.0.0.1:8100",
        changeOrigin: true,
      },
    },
  },

})
