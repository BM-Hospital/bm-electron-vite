import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    build: {
      bytecode: { protectedStrings: ['TOP_SECRET_KEY'] },
      rollupOptions: { output: { format: 'cjs' } }
    }
  },
  preload: {
    build: { bytecode: true, rollupOptions: { output: { format: 'cjs' } } }
  },
  renderer: {}
})
