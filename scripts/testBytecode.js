// End-to-end check for bytecode protection: packs this package, installs it into
// test/bytecode-app, builds with `build.bytecode`, then runs the app in Electron.
// Run `pnpm build` first. Set ELECTRON_VERSION to pin the Electron version.

import colors from 'picocolors'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fixture = path.join(root, 'test/bytecode-app')
const workDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bm-electron-vite-bytecode-'))
const appDir = path.join(workDir, 'app')
const electronVersion = process.env.ELECTRON_VERSION || 'latest'

// npm/npx/pnpm are .cmd shims on Windows and need a shell; build one quoted command line.
const quote = arg => (/[\s"]/.test(arg) ? `"${arg.replace(/"/g, '\\"')}"` : arg)

function run(cmd, args, cwd, options = {}) {
  const command = [cmd, ...args].map(quote).join(' ')
  console.log(colors.dim(`$ ${command}`))
  const result = spawnSync(command, {
    cwd,
    encoding: 'utf-8',
    shell: true,
    stdio: options.capture ? 'pipe' : 'inherit',
    timeout: options.timeout
  })
  if (result.status !== 0) {
    if (options.capture) console.error(result.stdout, result.stderr)
    fail(`command failed (exit ${result.status}): ${cmd} ${args.join(' ')}`)
  }
  return result.stdout || ''
}

function fail(message) {
  console.error(`\n  ${colors.bgRed(colors.white(' FAIL '))} ${colors.red(message)}\n`)
  console.error(colors.dim(`  Work directory kept for inspection: ${workDir}\n`))
  process.exit(1)
}

function check(label, ok) {
  console.log(`  ${ok ? colors.green('✓') : colors.red('✗')} ${label}`)
  if (!ok) failures++
}

if (!fs.existsSync(path.join(root, 'dist/index.js'))) fail('dist/ not found, run `pnpm build` first')

fs.cpSync(fixture, appDir, { recursive: true })
run('pnpm', ['pack', '--pack-destination', workDir], root, { capture: true })
const tarball = fs.readdirSync(workDir).find(file => file.endsWith('.tgz'))
run(
  'npm',
  ['install', '--no-audit', '--no-fund', path.join(workDir, tarball), 'vite@8', `electron@${electronVersion}`],
  appDir
)
run('npx', ['electron-vite', 'build'], appDir)

let failures = 0
const out = path.join(appDir, 'out')
console.log('\nBuild output:')
for (const scope of ['main', 'preload']) {
  const files = fs.readdirSync(path.join(out, scope))
  const jsc = files.filter(file => file.endsWith('.jsc'))
  check(`${scope}: compiled to bytecode (${jsc.join(', ')})`, jsc.length > 0)
  check(`${scope}: bytecode loader emitted`, files.includes('bytecode-loader.cjs'))
  const entry = fs.readFileSync(path.join(out, scope, 'index.js'), 'utf-8')
  check(`${scope}: entry only loads bytecode`, entry.includes('require("./index.jsc")') && entry.length < 200)
  for (const file of jsc) {
    check(
      `${scope}/${file}: protected string not readable`,
      !fs.readFileSync(path.join(out, scope, file)).includes('TOP_SECRET_KEY')
    )
  }
}
check(
  'main: dynamic import chunk compiled',
  fs.readdirSync(path.join(out, 'main')).filter(f => f.endsWith('.jsc')).length >= 2
)

console.log('\nRuntime:')
const stdout = run('npx', ['electron', '.'], appDir, { capture: true, timeout: 120_000 })
const line = stdout.split(/\r?\n/).find(l => l.startsWith('RESULT '))
const result = line ? JSON.parse(line.slice('RESULT '.length)) : {}
check('app reported a result', !!line)
check('static import works', result.add === 5)
check('protected string still equal at runtime', result.secretMatches === true)
check('dynamic import chunk loads', result.lazy === 'lazy-chunk-ok')
check('__dirname is defined', result.dirname === true)
check('preload bytecode runs', result.preload?.square === 49)

if (failures) fail(`${failures} check(s) failed`)
fs.rmSync(workDir, { recursive: true, force: true })
console.log(
  `\n  ${colors.bgGreen(colors.black(' PASS '))} ${colors.green('bytecode build and runtime checks passed')}\n`
)
