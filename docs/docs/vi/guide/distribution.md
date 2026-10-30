# Phân phối {#distribution}

## Giới hạn của ASAR archive {#limitations-of-asar-archives}

Mã nguồn của app Electron thường được đóng gói vào một ASAR archive, một định dạng lưu trữ đơn giản được thiết kế cho app Electron.

Nhưng ASAR archive có một số giới hạn:

- Một số Node API cần giải nén thêm ra file tạm và truyền đường dẫn file tạm đó cho API thì mới hoạt động. Việc này gây thêm chút chi phí cho các API đó, ví dụ `child_process.execFile`, `fs.open`, `process.dlopen`, v.v.
- Một số Node API không hỗ trợ thực thi binary nằm trong ASAR archive, như `child_process.exec`, `child_process.spawn`.

Như đã nêu ở trên, cách làm tốt nhất là không đóng gói các asset này vào ASAR archive.

Những binary không nên đóng gói gồm:

- Một số native node module như `sqlite`, `fluent-ffmpeg`, v.v.
- Các binary được tham chiếu như `*.node`, `*.app`, `*.exe`, v.v.

Ví dụ, trong `electron-builder` bạn có thể cấu hình như sau:

```yaml
asarUnpack:
  - node_modules/sqlite3
  - out/main/chunks/*.node
  - resources/**
```

Tìm hiểu thêm về [ASAR Archives](https://www.electronjs.org/docs/latest/tutorial/asar-archives).

::: tip Ghi chú
Bạn nên đặt các asset này trong thư mục public, nhờ đó dễ cấu hình loại trừ để không đóng gói chúng vào asar archive.
:::

## Phân phối app với Electron Builder {#distributing-apps-with-electron-builder}

`electron-builder` là giải pháp hoàn chỉnh để đóng gói ứng dụng Electron có thể phân phối cho macOS, Windows và Linux.

1. Bạn có thể tạo file cấu hình `electron-builder.yml` cho electron-builder với nội dung dưới đây.

```yaml
appId: com.electron.app
productName: vue-ts
directories:
  buildResources: build
files:
  - '!**/.vscode/*'
  - '!src/*'
  - '!electron.vite.config.{js,ts,mjs,cjs}'
  - '!{.eslintignore,.eslintrc.cjs,.prettierignore,.prettierrc.yaml,dev-app-update.yml,CHANGELOG.md,README.md}'
  - '!{.env,.env.*,.npmrc,pnpm-lock.yaml}'
  - '!{tsconfig.json,tsconfig.node.json,tsconfig.web.json}'
asarUnpack:
  - resources/**
afterSign: build/notarize.js
win:
  executableName: vue-ts
nsis:
  artifactName: ${name}-${version}-setup.${ext}
  shortcutName: ${productName}
  uninstallDisplayName: ${productName}
  createDesktopShortcut: always
mac:
  entitlementsInherit: build/entitlements.mac.plist
  extendInfo:
    - NSCameraUsageDescription: Application requests access to the device's camera.
    - NSMicrophoneUsageDescription: Application requests access to the device's microphone.
    - NSDocumentsFolderUsageDescription: Application requests access to the user's Documents folder.
    - NSDownloadsFolderUsageDescription: Application requests access to the user's Downloads folder.
dmg:
  artifactName: ${name}-${version}.${ext}
linux:
  target:
    - AppImage
    - snap
    - deb
  maintainer: electronjs.org
  category: Utility
appImage:
  artifactName: ${name}-${version}.${ext}
npmRebuild: false
publish:
  provider: generic
  url: https://example.com/auto-updates
```

2. Thêm khoá scripts vào `package.json`:

```json
"scripts": {
  "build:win": "npm run build && electron-builder --win --config",
  "build:mac": "npm run build && electron-builder --mac --config",
  "build:linux": "npm run build && electron-builder --linux --config"
}
```

## Phân phối app với Electron Forge {#distributing-apps-with-electron-forge}

Electron Forge là công cụ để đóng gói và phát hành ứng dụng Electron.

1. Bạn có thể tạo file cấu hình `forge.config.cjs` cho Electron Forge với nội dung dưới đây.

```js
module.exports = {
  packagerConfig: {
    ignore: [/^\/src/, /(.eslintrc.json)|(.gitignore)|(electron.vite.config.ts)|(forge.config.cjs)|(tsconfig.*)/]
  },
  rebuildConfig: {},
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {}
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin']
    },
    {
      name: '@electron-forge/maker-deb',
      config: {}
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {}
    }
  ]
}
```

2. Thêm scripts và dependencies vào `package.json`:

```json
"main": "./dist/main/index.js",
"scripts": {
  "start": "electron-vite preview --outDir=dist",
  "dev": "electron-vite dev --outDir=dist",
  "package": "electron-vite build --outDir=dist && electron-forge package",
  "make ": "electron-vite build --outDir=dist && electron-forge make"
},
"devDependencies": {
  "@electron-forge/cli": "^6.2.1",
  "@electron-forge/maker-deb": "^6.2.1",
  "@electron-forge/maker-rpm": "^6.2.1",
  "@electron-forge/maker-squirrel": "^6.2.1",
  "@electron-forge/maker-zip": "^6.2.1",
}
```

::: warning Lưu ý
Thư mục output mặc định của Electron Forge là `out` và không cho phép ghi đè, điều này xung đột với electron-vite. Vì vậy bạn có thể đặt `outDir` thành `dist`.
:::

## Github Action CI/CD {#github-action-ci-cd}

Bạn có thể tạo file workflow `.github/workflows/release.yml` ở thư mục gốc project với nội dung dưới đây. Workflow này sẽ giúp bạn build và đóng gói app Electron trên Windows, MacOS và Linux.

```yaml
name: Build/release Electron app

on:
  push:
    tags:
      - v*.*.*

jobs:
  release:
    runs-on: ${{ matrix.os }}

    strategy:
      matrix:
        os: [ubuntu-latest, macos-latest, windows-latest]

    steps:
      - name: Check out Git repository
        uses: actions/checkout@v3

      - name: Install Node.js
        uses: actions/setup-node@v3
        with:
          node-version: 16

      - name: Install Dependencies
        run: npm install

      - name: build-linux
        if: matrix.os == 'ubuntu-latest'
        run: npm run build:linux

      - name: build-mac
        if: matrix.os == 'macos-latest'
        run: npm run build:mac

      - name: build-win
        if: matrix.os == 'windows-latest'
        run: npm run build:win

      - name: release
        uses: softprops/action-gh-release@v1
        with:
          draft: true
          files: |
            dist/*.exe
            dist/*.zip
            dist/*.dmg
            dist/*.AppImage
            dist/*.snap
            dist/*.deb
            dist/*.rpm
            dist/*.tar.gz
            dist/*.yml
            dist/*.blockmap
        env:
          GITHUB_TOKEN: ${{ secrets.ACCESS_TOKEN }}
```
