<p align="center">
  <img src="https://alex8088.github.io/assets/electron-vite.svg" width="150px" height="150px">
</p>

<div align="center">
  <h1>bm-electron-vite</h1>
</div>
<p align="center">Công cụ build Electron thế hệ mới dựa trên Vite</p>

<p align="center">
<img src="https://img.shields.io/npm/v/bm-electron-vite?color=6988e6&label=version">
<img src="https://img.shields.io/github/license/BM-Hospital/bm-electron-vite?color=blue" alt="license" />
</p>

<p align="center">
<a href="https://electron-vite.org">Tài liệu (upstream, tiếng Anh)</a> |
<a href="https://electron-vite.org/guide">Bắt đầu</a> |
<a href="https://github.com/BM-Hospital/bm-electron-vite/issues">Báo lỗi</a>
</p>

<p align="center">
<a href="./README.md">English</a> | <b>Tiếng Việt</b>
</p>

<br />

> `bm-electron-vite` là bản fork của [alex8088/electron-vite](https://github.com/alex8088/electron-vite), do BM-Hospital duy trì. Cấu hình, plugin và CLI hoạt động giống upstream, nên có thể dùng [tài liệu upstream](https://electron-vite.org). Xem [Khác biệt so với upstream](#khác-biệt-so-với-upstream).

## Tính năng

- ⚡️ Chạy trên [Vite](https://vitejs.dev), cách dùng y hệt Vite.
- 🛠 Cấu hình sẵn với các giá trị mặc định tối ưu cho Electron.
- 💡 Tối ưu xử lý asset cho main process của Electron.
- 🚀 HMR và hot reload nhanh.
- 🔥 Build tách biệt cho ứng dụng nhiều entry.
- ✨ Đơn giản hoá phát triển đa luồng (worker).
- 🔒 Biên dịch code sang V8 bytecode để bảo vệ mã nguồn.
- 🔌 Dễ debug trong IDE như VSCode hoặc WebStorm.
- 📦 Hỗ trợ sẵn TypeScript, Vue, React, Svelte, SolidJS và nhiều framework khác.

## Khác biệt so với upstream

- Publish với tên `bm-electron-vite`. Lệnh CLI vẫn là `electron-vite`, nên các npm script hiện có vẫn chạy được.
- Hỗ trợ Electron 42+: binary được tải về ở lần `require('electron')` đầu tiên thay vì trong script `postinstall`.
- Có sẵn target build cho Electron 45.
- Bước biên dịch bytecode tìm các script hỗ trợ theo vị trí package đã cài, nên chạy được dưới bất kỳ tên package nào.

## Sử dụng

### Cài đặt

```sh
npm i bm-electron-vite -D
```

Yêu cầu Node.js `^20.19.0 || >=22.12.0` và `vite` 6, 7 hoặc 8.

### Phát triển & Build

Trong project đã cài `bm-electron-vite`, bạn có thể gọi trực tiếp lệnh `electron-vite` bằng `npx electron-vite`, hoặc thêm npm script vào `package.json` như sau:

```json
{
  "scripts": {
    "start": "electron-vite preview",
    "dev": "electron-vite dev",
    "prebuild": "electron-vite build"
  }
}
```

### Cấu hình

Khi chạy `electron-vite` từ dòng lệnh, công cụ sẽ tự tìm file cấu hình tên `electron.vite.config.js` (hoặc `.ts`, `.mjs`, `.cjs`, `.mts`, `.cts`) ở thư mục gốc của project. File cấu hình cơ bản nhất trông như sau:

```ts
// electron.vite.config.ts
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    // tuỳ chọn cấu hình vite
  },
  preload: {
    // tuỳ chọn cấu hình vite
  },
  renderer: {
    // tuỳ chọn cấu hình vite
  }
})
```

Để dùng các hậu tố import đặc biệt (`?asset`, `?modulePath`, `?nodeWorker`, ...), thêm kiểu dữ liệu vào `tsconfig.json`:

```json
{
  "compilerOptions": {
    "types": ["bm-electron-vite/node"]
  }
}
```

### Bảo vệ mã nguồn

Đặt `build.bytecode` cho `main` và/hoặc `preload` để biên dịch output sang V8 bytecode khi chạy `electron-vite build`. Output phải ở định dạng CommonJS. Bytecode gắn với phiên bản Electron và kiến trúc CPU lúc build, nên cần build lại cho từng môi trường đích.

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

Bytecode chỉ làm mã nguồn khó đọc hơn, không phải mã hoá: đừng để secret quan trọng trong app. Xem đầy đủ các tuỳ chọn tại [Source Code Protection](https://electron-vite.org/guide/source-code-protection).

### Bắt đầu nhanh

Tạo project bằng [create-electron](https://github.com/alex8088/quick-start/tree/master/packages/create-electron), sau đó thay dev dependency `electron-vite` bằng `bm-electron-vite` và đổi import trong file cấu hình từ `'electron-vite'` thành `'bm-electron-vite'`.

```bash
npm create @quick-start/electron@latest
```

## Đóng góp

Xem [Hướng dẫn đóng góp](CONTRIBUTING.vi.md).

## Giấy phép

[MIT](./LICENSE) © alex.wei. Bản fork do [BM-Hospital](https://github.com/BM-Hospital) duy trì.
