<p align="center">
  <img src="https://alex8088.github.io/assets/electron-vite.svg" width="150px" height="150px">
</p>

<div align="center">
  <h1>bm-electron-vite</h1>
</div>
<p align="center">Next generation Electron build tooling based on Vite</p>

<p align="center">
<img src="https://img.shields.io/npm/v/bm-electron-vite?color=6988e6&label=version">
<img src="https://img.shields.io/github/license/BM-Hospital/bm-electron-vite?color=blue" alt="license" />
</p>

<p align="center">
<a href="https://electron-vite.org">Documentation (upstream)</a> |
<a href="https://electron-vite.org/guide">Getting Started</a> |
<a href="https://github.com/BM-Hospital/bm-electron-vite/issues">Issues</a>
</p>

<p align="center">
<b>English</b> | <a href="./README.md">Tiếng Việt</a>
</p>

<br />

> `bm-electron-vite` is a fork of [alex8088/electron-vite](https://github.com/alex8088/electron-vite) maintained by BM-Hospital. Config, plugins and CLI behave the same as upstream, so the [upstream documentation](https://electron-vite.org) applies. See [Differences from upstream](#differences-from-upstream).

## Features

- ⚡️ [Vite](https://vitejs.dev) powered and use the same way.
- 🛠 Pre-configure with sensible defaults optimized for Electron.
- 💡 Optimize asset handling for Electron main process.
- 🚀 Fast HMR & hot reloading.
- 🔥 Isolated build for multi-entry application development.
- ✨ Simplify multi-threading development.
- 🔒 Compile code to v8 bytecode to protect source code.
- 🔌 Easy to debug in IDEs such as VSCode or WebStorm.
- 📦 Out-of-the-box support for TypeScript, Vue, React, Svelte, SolidJS and more.

## Differences from upstream

- Published as `bm-electron-vite`. The CLI command is still `electron-vite`, so existing npm scripts keep working.
- Supports Electron 42+, which downloads its binary on the first `require('electron')` instead of in a `postinstall` script.
- Build targets for Electron 45.
- Bytecode compilation locates its helper scripts relative to the installed package, so it works under any package name.

## Usage

### Install

```sh
npm i bm-electron-vite -D
```

Requires Node.js `^20.19.0 || >=22.12.0` and `vite` 6, 7 or 8.

### Development & Build

In a project where `bm-electron-vite` is installed, you can use the `electron-vite` binary directly with `npx electron-vite` or add the npm scripts to your `package.json` file like this:

```json
{
  "scripts": {
    "start": "electron-vite preview",
    "dev": "electron-vite dev",
    "prebuild": "electron-vite build"
  }
}
```

### Configuration

When running `electron-vite` from the command line, it will automatically try to resolve a config file named `electron.vite.config.js` (or `.ts`, `.mjs`, `.cjs`, `.mts`, `.cts`) inside the project root. The most basic config file looks like this:

```ts
// electron.vite.config.ts
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    // vite config options
  },
  preload: {
    // vite config options
  },
  renderer: {
    // vite config options
  }
})
```

For the special import suffixes (`?asset`, `?modulePath`, `?nodeWorker`, ...), add the client types to your `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["bm-electron-vite/node"]
  }
}
```

### Source code protection

Set `build.bytecode` on `main` and/or `preload` to compile their output to V8 bytecode during `electron-vite build`. The output format must be CommonJS. Bytecode is tied to the Electron version and CPU architecture it was built with, so rebuild for each target.

```ts
export default defineConfig({
  main: {
    build: { bytecode: { protectedStrings: ['MY_SECRET'] } }
  },
  preload: {
    build: { bytecode: true }
  }
})
```

See [Source Code Protection](https://electron-vite.org/guide/source-code-protection) for all options.

### Getting Started

Scaffold a project with [create-electron](https://github.com/alex8088/quick-start/tree/master/packages/create-electron), then replace the `electron-vite` dev dependency with `bm-electron-vite` and change config imports from `'electron-vite'` to `'bm-electron-vite'`.

```bash
npm create @quick-start/electron@latest
```

## Contribution

See [Contributing Guide](CONTRIBUTING.md).

## License

[MIT](./LICENSE) © alex.wei. Fork maintained by [BM-Hospital](https://github.com/BM-Hospital).
