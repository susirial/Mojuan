import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],

  server: {
    proxy: {

      // 正则表达式写法
      '^/(test|testpost|stream|ragstream|msgstream|ingest|runs)': {
        target: 'http://127.0.0.1:8100 ',
        changeOrigin: true,

      },
    }
  }

})
