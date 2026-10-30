# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`bm-electron-vite` (repo: https://github.com/BM-Hospital/bm-electron-vite) is BM-Hospital's fork of [alex8088/electron-vite](https://github.com/alex8088/electron-vite). The npm package is `bm-electron-vite`, but the CLI binary is still named `electron-vite`. Never resolve files by package name (e.g. `require.resolve('electron-vite/...')`), because the package can be installed under a different name; locate them relative to `import.meta.url` instead.

It is a build tool and CLI (not an app). It wraps Vite so a single `electron.vite.config.*` file can configure three separate Vite builds: Electron **main**, **preload**, and **renderer**. It is published as an ESM package with `dist/index.js` (API) and `dist/cli.js` (CLI, loaded by `bin/electron-vite.js`). Peer deps: `vite` 6–8, plus optional `@swc/core`.

## Commands

pnpm is required (`pnpm install`).

- `pnpm lint`: Oxlint (config in `.oxlintrc.json`)
- `pnpm typecheck`: `tsc --noEmit`. TypeScript is 7.x, the native (Go) compiler: it has no JavaScript API, so `require('typescript')` cannot be used in scripts. `rolldown-plugin-dts` uses its `tsgo` backend.
- `pnpm format`: Oxfmt write (`pnpm format:check` to check only)
- `pnpm build`: runs lint, then Rolldown (`rolldown.config.ts`). This outputs `dist/index.js`, `dist/cli.js`, shared chunks in `dist/chunks/`, and one bundled `dist/index.d.ts` (via `rolldown-plugin-dts`).

- `pnpm test:bytecode`: end-to-end bytecode check (`scripts/testBytecode.js`). Run `pnpm build` first. It packs the package, installs it into a temp copy of `test/bytecode-app`, builds with `build.bytecode`, runs the app in Electron, and checks the output. It downloads Electron (`ELECTRON_VERSION` pins the version, default `latest`) and needs a display. CI runs it on `windows-latest`, which has one.
- `pnpm docs:dev` / `docs:build` / `docs:preview`: the VitePress docs site, a separate workspace package in `docs/` (see `pnpm-workspace.yaml`).

There is no unit test suite. CI (`.github/workflows/ci.yml`) runs `format:check`, `typecheck`, `build` (with lint) and `docs:build` on ubuntu, then `test:bytecode` on windows. Before a PR, run `pnpm format:check && pnpm lint && pnpm typecheck`, and run `pnpm test:bytecode` when touching bytecode, `src/electron.ts` or the build config. To check other behavior, build and then run the CLI against a separate Electron project (for example by installing a `pnpm pack` tarball).

Git hooks (simple-git-hooks) run lint-staged (oxlint + oxfmt) on pre-commit. They also check commit messages with `scripts/verifyCommit.js`, which expects `type(scope): subject` matching `^(revert: )?(feat|fix|docs|dx|style|refactor|perf|test|workflow|build|ci|chore|types|wip|release)(\(.+\))?!?: .{1,50}`. See `.github/commit-convention.md`.

## Architecture

**Config resolution (`src/config.ts`, `src/load.ts`)**: this is the core. `load.ts` finds `electron.vite.config.{js,ts,mjs,cjs,mts,cts}` in the root, bundles it with rolldown, and evaluates it. Files named `vite.config.*` are rejected. `resolveConfig()` then turns each of `main` / `preload` / `renderer` into a plain Vite config through `MainConfigFactory`, `PreloadConfigFactory` and `RendererConfigFactory`. Each factory merges the user section with the CLI inline config and **prepends** the built-in plugins to the user's plugins. If you add a built-in plugin, register it in that factory's `resolveBuiltinPlugins`. There is also a `cleanMode` plugin list, used when plugins re-bundle entries (`modulePath`, `isolateEntries`). `rollupOptions` is aliased to `rolldownOptions`.

**Config-driven plugins**: `build.externalizeDeps` (default `true`) and `build.bytecode` on main/preload automatically add `externalizeDepsPlugin` / `bytecodePlugin`. They are skipped if the user already added a plugin with the same name (`vite:externalize-deps`, `vite:bytecode`).

**Presets and validators (`src/plugins/electron.ts`)**: these set per-process defaults:

- Entries: `src/<scope>/index.*` or `src/<scope>/<scope>.*`, and `src/renderer/index.html`.
- Output dirs: `out/main`, `out/preload`, `out/renderer`.
- Node or Chrome targets, taken from the installed Electron version (`src/electron.ts`).
- CJS/ESM output format; preload ESM output uses `.mjs`.
- Renderer `base` of `./` in production.

Validator plugins check required options such as entry points.

**Commands**:

- `src/server.ts` (`dev`/`serve`): builds main, then preload, with `vite.build` (in watch mode if `-w`). It then starts the renderer Vite dev server, sets `ELECTRON_RENDERER_URL`, and spawns Electron. When main is rebuilt, Electron restarts. When preload is rebuilt, the renderer does a full reload.
- `src/build.ts`: builds main → preload → renderer in order and turns off watch mode.
- `src/preview.ts`: builds and then launches Electron.

**State passed through env vars**: modules share state through environment variables, including `NODE_ENV_ELECTRON_VITE` (development/production), `ELECTRON_RENDERER_URL`, `ELECTRON_ENTRY`, `ELECTRON_CLI_ARGS`, `ELECTRON_EXEC_PATH` and `ELECTRON_MAJOR_VER`.

**Bytecode protection**: `bytecodePlugin` (`src/plugins/bytecode.ts`) compiles output to V8 bytecode. During `build`, `src/bytecodeCompiler.ts` starts one long-lived Electron process (`bin/electron-bytecode-main.cjs`, which uses `bin/rpc-peer.cjs`, `bin/bytecode-compiler.cjs` and `bin/electron-bytecode-preload.cjs`) and sends it compile requests over RPC. It finds `bin/` by walking up from its own file to the package root. The compiler instance reaches the plugins through a dummy plugin named `vite:electron-bytecode-build` with `api.compiler`. Babel is loaded only when bytecode is in use. The `bin/*.cjs` files ship as-is and are not built by Rolldown.

**Other built-in plugins (`src/plugins/`)**: these handle the special import suffixes declared in `node.d.ts`, which consumers use as `bm-electron-vite/node` types:

- `asset`: `?asset`, `?asset&asarUnpack`, and native `.node` files
- `worker`: `?nodeWorker`
- `modulePath`: `?modulePath`, which bundles a separate entry and returns its path
- `importMeta`: `import.meta` env and paths
- `esmShim`: `__dirname` / `require` shims for ESM output
- `isolateEntries`: builds each entry as its own standalone bundle
- `swc`: an exported, opt-in transform for decorators

## Docs

User-facing docs come in English and Vietnamese: `README.md` / `README.vi.md` and `CONTRIBUTING.md` / `CONTRIBUTING.vi.md`. When you change one, update the other in the same change. GitHub templates under `.github/` and `CHANGELOG.md` are English only.

The docs site lives in `docs/`: config in `docs/.vitepress/config.ts`, pages under `docs/docs/` (`srcDir`). It has `en` (root) and `vi` locales, and Vietnamese pages go under `docs/docs/vi/` with the same paths as the English ones. Sidebar and nav entries are defined once, with both labels, in `config.ts`. If you add a page, register it there and write both language versions.

## Code style

Oxfmt (a Prettier-compatible formatter) is configured in `.oxfmtrc.json`: no semicolons, single quotes, a 120-character print width, no trailing commas, and no parentheses around a single arrow-function argument. Oxlint (migrated from ESLint + typescript-eslint) requires explicit return types on functions, which is why the code has `(): void =>` annotations.
