# Bắt đầu {#getting-started}

::: tip Ghi chú
Hướng dẫn này giả định bạn đã quen với Electron và Vite. Cách tốt để bắt đầu tìm hiểu thêm là đọc [Electron Guide](https://www.electronjs.org/docs/) và [Vite Guide](https://vitejs.dev/guide/).
:::

## Tổng quan {#overview}

**electron-vite** là công cụ build hướng tới trải nghiệm phát triển nhanh hơn, gọn nhẹ hơn cho [Electron](https://www.electronjs.org). Công cụ cung cấp:

- Lệnh build bundle code của bạn bằng [Vite](https://vitejs.dev/), đồng thời xử lý trơn tru môi trường kép của Electron ([Node.js](https://nodejs.org/) và trình duyệt).

- Một điểm cấu hình duy nhất cho main process, renderer process và preload scripts, với [các giá trị mặc định hợp lý, tối ưu cho Electron](../config/index.md#built-in-config).

- [Hot Module Replacement(HMR)](./hmr-and-hot-reloading.md#using-hmr) tức thì cho renderer process, cùng với hỗ trợ [hot reloading](./hmr-and-hot-reloading.md#enabling-hot-reloading) cho main process và preload scripts.

- Các khả năng phát triển nâng cao như hỗ trợ [đa luồng](./dev.md#multi-threading) qua các hậu tố import đơn giản, [tối ưu xử lý asset](./assets.md) cho main process, chế độ [build tách biệt](./isolated-build.md) để hỗ trợ sandbox tốt hơn, và [biên dịch sang V8 bytecode để bảo vệ mã nguồn](./source-code-protection.md).

electron-vite nhanh, đơn giản và mạnh mẽ, được thiết kế để dùng ngay mà không cần cấu hình thêm.

## Cài đặt {#installation}

::: tip Yêu cầu
Yêu cầu **Node.js** phiên bản 20.19+, 22.12+ và **Vite** phiên bản 6.0+
:::

```sh
npm i bm-electron-vite -D
```

## Giao diện dòng lệnh {#command-line-interface}

Trong project đã cài electron-vite, bạn có thể gọi trực tiếp lệnh `electron-vite` bằng `npx electron-vite`, hoặc thêm npm script vào file `package.json` như sau:

```json [package.json]
{
  "scripts": {
    "start": "electron-vite preview", // chạy electron app để xem trước bản build production
    "dev": "electron-vite dev", // chạy dev server và electron app
    "prebuild": "electron-vite build" // build cho production
  }
}
```

Bạn có thể truyền thêm các tuỳ chọn CLI như `--outDir`. Để xem đầy đủ các tuỳ chọn CLI, chạy `npx electron-vite -h` trong project.

Tìm hiểu thêm về [Giao diện dòng lệnh](/vi/guide/cli).

## Cấu hình electron-vite {#configuring-electron-vite}

Khi chạy `electron-vite` từ dòng lệnh, electron-vite sẽ tự tìm file cấu hình tên `electron.vite.config.js` ở thư mục gốc của project. File cấu hình cơ bản nhất trông như sau:

```js [electron.vite.config.js]
export default {
  main: {
    // tuỳ chọn cấu hình vite
  },
  preload: {
    // tuỳ chọn cấu hình vite
  },
  renderer: {
    // tuỳ chọn cấu hình vite
  }
}
```

Tìm hiểu thêm tại [Tham khảo cấu hình](/vi/config/).

## Entry point của Electron {#electron-entry-point}

Khi dùng electron-vite để bundle code, entry point của ứng dụng Electron cần được đổi thành file entry của main process trong thư mục output. `outDir` mặc định là `out`. File `package.json` của bạn sẽ trông như sau:

```json [package.json] {4}
{
  "name": "electron-app",
  "version": "1.0.0",
  "main": "./out/main/index.js"
}
```

Thư mục làm việc của Electron sẽ là thư mục output, không phải thư mục mã nguồn. Vì vậy bạn có thể loại mã nguồn ra khi đóng gói ứng dụng Electron.

Tìm hiểu thêm về [Build cho production](/vi/guide/build).

## Tạo project electron-vite đầu tiên {#scaffolding-your-first-electron-vite-project}

Chạy lệnh sau trong terminal:

::: code-group

```sh [npm]
npm create @quick-start/electron@latest
```

```sh [yarn]
yarn create @quick-start/electron
```

```sh [pnpm]
pnpm create @quick-start/electron
```
:::

Sau đó làm theo các câu hỏi hiện ra!

<<< @/snippets/scaffold.ansi

Bạn cũng có thể chỉ định trực tiếp tên project và template muốn dùng qua các tuỳ chọn dòng lệnh. Ví dụ, để tạo project Electron + Vue, chạy:

::: code-group

```sh [npm]
# npm 7+, cần thêm dấu gạch đôi:
npm create @quick-start/electron@latest my-app -- --template vue
```

```sh [yarn]
yarn create @quick-start/electron my-app --template vue
```

```sh [pnpm]
pnpm create @quick-start/electron my-app --template vue
```
:::

Các template hiện được hỗ trợ:

|                                                 JavaScript                                                 |                                                    TypeScript                                                    |
| :--------------------------------------------------------------------------------------------------------: | :--------------------------------------------------------------------------------------------------------------: |
| [vanilla](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/vanilla) | [vanilla-ts](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/vanilla-ts) |
|     [vue](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/vue)     |     [vue-ts](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/vue-ts)     |
|   [react](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/react)   |   [react-ts](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/react-ts)   |
|  [svelte](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/svelte)  |  [svelte-ts](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/svelte-ts)  |
|   [solid](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/solid)   |   [solid-ts](https://github.com/alex8088/quick-start/tree/master/packages/create-electron/playground/solid-ts)   |

Xem [create-electron](https://github.com/alex8088/quick-start/tree/master/packages/create-electron) để biết thêm chi tiết.

## Clone template {#clone-template}

create-electron là công cụ giúp khởi tạo nhanh project từ template cơ bản cho các framework phổ biến. Bạn cũng có thể dùng công cụ như [degit](https://github.com/Rich-Harris/degit) để tạo project từ template [electron-vite-boilerplate](https://github.com/alex8088/electron-vite-boilerplate).

```sh
npx degit alex8088/electron-vite-boilerplate electron-app
cd electron-app

npm install
npm run dev
```

## Nhận trợ giúp {#getting-help}

Nếu nghi ngờ gặp lỗi với `electron-vite`, hãy kiểm tra [GitHub issue tracker](https://github.com/BM-Hospital/bm-electron-vite/issues) xem đã có issue nào trùng với vấn đề của bạn chưa. Nếu chưa, bạn cứ điền template báo lỗi và tạo issue mới.
