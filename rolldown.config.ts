import { createRequire } from 'node:module'
import { defineConfig } from 'rolldown'
import { dts } from 'rolldown-plugin-dts'

const require = createRequire(import.meta.url)
const pkg = require('./package.json')

const external = [...Object.keys(pkg.dependencies || {}), ...Object.keys(pkg.peerDependencies || {})]

export default defineConfig([
  {
    input: ['src/index.ts', 'src/cli.ts'],
    platform: 'node',
    output: {
      dir: 'dist',
      entryFileNames: '[name].js',
      chunkFileNames: 'chunks/lib-[hash].js',
      format: 'es',
      cleanDir: true
    },
    external,
    treeshake: {
      moduleSideEffects: false
    }
  },
  {
    input: 'src/index.ts',
    platform: 'node',
    output: { dir: 'dist', format: 'es' },
    external,
    plugins: [dts({ emitDtsOnly: true })]
  }
])
