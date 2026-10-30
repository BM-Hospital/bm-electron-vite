# Xử lý sự cố {#troubleshooting}

Xem thêm [hướng dẫn xử lý sự cố của Vite](https://vitejs.dev/guide/troubleshooting.html) và [hướng dẫn xử lý sự cố của Rollup](https://rollupjs.org/troubleshooting/) để biết thêm thông tin.

Nếu các gợi ý ở đây không hiệu quả, hãy thử tìm trên [GitHub issue tracker](https://github.com/BM-Hospital/bm-electron-vite/issues) xem có issue nào trùng với vấn đề của bạn không. Nếu bạn phát hiện lỗi, hoặc electron-vite không đáp ứng được nhu cầu, hãy [tạo issue](https://github.com/BM-Hospital/bm-electron-vite/issues) hoặc đặt câu hỏi trên [GitHub Discussions](https://github.com/BM-Hospital/bm-electron-vite/discussions).

## Kỹ năng {#skills}

Với các bước sau, bạn có thể nhanh chóng xác định và xử lý vấn đề:

1. **Trong lúc phát triển** - Dùng câu lệnh `debugger` hoặc breakpoint để khoanh vùng vấn đề.
2. **Trước khi đóng gói** - Chạy lệnh `preview` để giả lập môi trường đã đóng gói và phát hiện sớm các vấn đề tiềm ẩn.
3. **Sau khi đóng gói** - Thêm tham số `--trace-warnings` vào lệnh khởi chạy app để xem thông báo lỗi chi tiết. Ví dụ:
   - **Windows:** `.\app.exe --trace-warnings`
   - **macOS:** `open app.app --args --trace-warnings`
4. **Nếu app chạy được khi preview nhưng lỗi sau khi đóng gói** - Thường là do một số module phụ thuộc chưa được đưa vào gói. Hãy kiểm tra rằng mọi module cần thiết đều nằm trong `dependencies` (không phải `devDependencies`). Hoặc cũng có thể là vấn đề của **pnpm** (nếu bạn dùng).

## Chuyển đổi phiên bản {#migration}

### `The CJS build of Vite's Node API is deprecated` {#the-cjs-build-of-vite-s-node-api-is-deprecated}

Từ Vite 5, việc gọi CJS Node API của Vite sẽ phát cảnh báo deprecated. `electron-vite` v2 hiện được publish dưới dạng package ESM, nên bạn có thể cập nhật lên phiên bản mới nhất.

Ngoài ra, hãy đảm bảo rằng:

1. File `electron.vite.config.js` dùng **cú pháp ESM**.
2. File `package.json` gần nhất có `"type": "module"`, hoặc đổi tên file cấu hình sang đuôi `.mjs` (ví dụ `electron.vite.config.mjs`).

Lưu ý rằng khi thêm `"type": "module"` vào `package.json` của project, nếu Electron hỗ trợ ESM (Electron 28+) thì output sẽ được build dưới dạng ESM. Hãy đọc hướng dẫn [Hỗ trợ ESM trong Electron](./dev.md#esm-support-in-electron) trước khi chuyển đổi. Còn nếu không hỗ trợ ESM, output sẽ được build dưới dạng CommonJS và mọi file sẽ có đuôi `.cjs`.

Nếu bạn không muốn thay đổi gì và vẫn muốn bundle dạng CJS, cách đơn giản nhất là đổi tên `electron.vite.config.js` thành `electron.vite.config.mjs`.

## Phát triển {#development}

### `Unable to load preload scripts -> Error: module not found: 'XXX'` {#unable-to-load-preload-scripts-error-module-not-found-xxx}

Từ Electron 20, preload script mặc định chạy trong sandbox và không còn truy cập được toàn bộ môi trường Node.js.

Bạn cần chọn một trong hai cách:

1. Đặt `sandbox: false` trong tuỳ chọn của `BrowserWindow`.
2. Bundle toàn bộ dependencies vào một preload script duy nhất (vì script chạy trong sandbox không thể `require` nhiều file riêng lẻ).

- Liên quan: [Giới hạn của sandbox](./dev.md#limitations-of-sandboxing)
- Liên quan: [Bundle toàn bộ](./dependency-handling.md#fully-bundling)
- Liên quan: [Build tách biệt](./isolated-build.md)

### `Uncaught Error: Module "XXX" has been externalized for browser compatibility.` or `Uncaught ReferenceError: __dirname is not defined` {#uncaught-error-module-xxx-has-been-externalized-for-browser-compatibility-or-uncaught-referenceerror-dirname-is-not-defined}

Bạn không nên dùng module Node.js trong renderer process. `electron-vite` cũng không hỗ trợ `nodeIntegration`.

- Liên quan: [nodeIntegration](/vi/guide/dev#nodeintegration)
- Liên quan: [Module externalized for browser compatibility](https://vitejs.dev/guide/troubleshooting.html#module-externalized-for-browser-compatibility)

## Build {#build}

### `Error [ERR_REQUIRE_ESM]: require() of ES Module` {#error-err-require-esm-require-of-es-module}

Lỗi này xảy ra vì nhiều thư viện (ví dụ `lowdb`, `execa`, `node-fetch`) chỉ được phân phối dưới dạng **ES module**, nên không thể `require` từ code CJS.

Có hai cách để xử lý:

1. **Chuyển sang ESM** — electron-vite [hỗ trợ ESM](./dev.md#esm-support-in-electron) rất tốt và giúp việc chuyển đổi trở nên đơn giản.
2. **Bundle thư viện ESM thành CJS** — cấu hình electron-vite để bundle các dependency `ESM-only` này, nhờ đó có thể dùng chúng trong môi trường `CJS`.

```js [electron.vite.config.js] {7}
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    build: {
      externalizeDeps: {
        exclude: ['foo'] // <- Thêm các module liên quan vào tuỳ chọn 'exclude'
      }
    }
  },
  // ...
})
```

Issue liên quan: [#35](https://github.com/alex8088/electron-vite/issues/35)

### `vue-router` hoặc `react-router-dom` chạy được khi phát triển nhưng lỗi ở production {#vue-router-or-react-router-dom-works-in-development-but-not-production}

Electron không quản lý lịch sử trình duyệt mà dựa vào URL đồng bộ. Vì vậy, ở production chỉ có **router dựa trên hash** mới hoạt động đúng.

- Với `vue-router`, dùng `createWebHashHistory` thay cho `createWebHistory`.
- Với `react-router-dom`, dùng `HashRouter` thay cho `BrowserRouter`.

Khi dùng hash router, bạn có thể truyền giá trị hash ở tham số thứ hai của `BrowserWindow.loadFile` để tải trang tương ứng.

```js
win.loadFile(path.join(import.meta.dirname, '../renderer/index.html'), { hash: 'home' })
```

## Phân phối {#distribution}

### `A JavaScript error occurred in the main process -> Error: Cannot find module 'XXX'` {#a-javascript-error-occurred-in-the-main-process-error-cannot-find-module-xxx}

Lỗi này thường xảy ra do các module phụ thuộc không được đưa vào ứng dụng đã đóng gói. Để xử lý:

- **Kiểm tra dependencies:**

  Nếu module bị thiếu nằm trong `devDependencies`, hãy cài lại nó vào `dependencies`. Các công cụ đóng gói (như `electron-builder` hoặc `electron-forge`) thường loại bỏ các module trong `devDependencies`.

- **Với người dùng pnpm:**

  Bạn có thể thêm file `.npmrc` chứa `shamefully-hoist=true` vào thư mục gốc project (để dependencies được bundle đúng). Sau đó xoá `node_modules` và `pnpm-lock.yaml`, rồi cài lại dependencies. Hoặc bạn có thể chuyển sang package manager khác (ví dụ `npm` hoặc `yarn`) để tránh vấn đề này.

### `A JavaScript error occurred in the main process -> Error: Invaild or incompatible cached data (cachedDataRejected)` {#a-javascript-error-occurred-in-the-main-process-error-invaild-or-incompatible-cached-data-cacheddatarejected}

Vấn đề này xảy ra khi bật `build.bytecode`.

Để tránh lỗi runtime này, bạn cần biên dịch bytecode cache cho đúng nền tảng và kiến trúc đích.

Xem chi tiết ở mục [Giới hạn khi build](./source-code-protection.md#limitations-of-build) trong hướng dẫn [Bảo vệ mã nguồn](./source-code-protection.md).
