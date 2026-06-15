import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// base must match the GitHub Pages subpath: drewhoover.com/meris-new-car/
export default defineConfig({
  base: '/meris-new-car/',
  plugins: [react()],
})
