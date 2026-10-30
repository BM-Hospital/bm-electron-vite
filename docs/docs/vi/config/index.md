# Cấu hình electron-vite {#configuring-electron-vite}

## File cấu hình {#config-file}

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

Bạn cũng có thể chỉ định rõ file cấu hình cần dùng bằng tuỳ chọn CLI `--config` (đường dẫn tính tương đối so với `cwd`):

```sh
electron-vite --config my-config.js
```

::: tip Mẹo
`electron-vite` cũng hỗ trợ file cấu hình có đuôi `.ts`, `.mjs`, `.cjs`, `.mts` và `.cts`.
:::

## Intellisense cho cấu hình {#config-intellisense}

Vì `electron-vite` đi kèm sẵn kiểu dữ liệu TypeScript, bạn có thể tận dụng intellisense của IDE bằng gợi ý kiểu jsdoc:

```js [electron.vite.config.ts]
/**
 * @type {import('bm-electron-vite').UserConfig}
 */
const config = {
  // ...
}

export default config
```

Ngoài ra, bạn có thể dùng helper `defineConfig`, vốn cung cấp intellisense mà không cần chú thích jsdoc:

```js [electron.vite.config.ts]
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    // ...
  },
  preload: {
    // ...
  },
  renderer: {
    // ...
  }
})
```

## Cấu hình có điều kiện {#conditional-config}

Nếu cấu hình cần xác định tuỳ chọn dựa trên lệnh (`dev`/`serve` hoặc `build`) hay mode (`development` hoặc `production`) đang dùng, bạn có thể export một hàm:

```js [electron.vite.config.ts]
import { defineConfig } from 'bm-electron-vite'

export default defineConfig(({ command, mode }) => {
  if (command === 'serve') {
    return {
      // cấu hình riêng cho dev
      main: {
        // ...
      },
      preload: {
        // ...
      },
      renderer: {
        // ...
      }
    }
  } else {
    // command === 'build'
    return {
      // cấu hình riêng cho build
    }
  }
})
```

## Biến môi trường {#environment-variables}

Lưu ý rằng mặc định electron-vite không nạp file `.env`, vì chỉ có thể biết cần nạp file nào sau khi đã đánh giá cấu hình electron-vite. Tuy nhiên, bạn có thể dùng helper `loadEnv` được export để nạp file `.env` cụ thể khi cần.

```js [electron.vite.config.ts]
import { defineConfig, loadEnv } from 'bm-electron-vite'

export default defineConfig(({ command, mode }) => {
  // Nạp file env theo `mode` trong thư mục làm việc hiện tại.
  // Mặc định chỉ nạp các biến env có tiền tố `MAIN_VITE_`,
  // `PRELOAD_VITE_` và `RENDERER_VITE_`,
  // trừ khi thay đổi tham số thứ ba `prefixes`.
  const env = loadEnv(mode)
  return {
    // cấu hình electron-vite
  }
})
```

## Cấu hình sẵn có {#built-in-config}

### Cấu hình sẵn có cho `main`: {#built-in-config-for-main}

| Tuỳ chọn                       | Mặc định                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `build.target`                 | `node*`, tự động khớp target Node tương thích với Electron (ví dụ Electron 20 là `node16.15`) |
| `build.outDir`                 | `out\main` (tương đối so với thư mục gốc project)                                             |
| `build.lib.entry`              | `src\main\{index\|main}.{js\|ts\|mjs\|cjs}`, chuỗi rỗng nếu không tìm thấy                    |
| `build.lib.formats`            | `cjs` hoặc `es`, `es` chỉ được hỗ trợ trên electron 28+                                       |
| `build.reportCompressedSize`   | `false`, tắt báo cáo kích thước nén gzip để tăng hiệu năng build                              |
| `build.rollupOptions.external` | `electron` và tất cả module có sẵn của `node`                                                 |
| `build.assetDir`               | `chunks`                                                                                      |
| `build.minify`                 | `false`                                                                                       |
| `build.copyPublicDir`          | `false`, luôn luôn                                                                            |
| `build.ssr`                    | `true`, luôn luôn                                                                             |
| `build.ssrEmitAssets`          | `true`, luôn luôn                                                                             |
| `ssr.noExternal`               | `true`, luôn luôn                                                                             |
| `resolve.browserField`         | `false`, không resolve theo trường `browser`                                                  |
| `resolve.mainFields`           | `['module', 'jsnext:main', 'jsnext']`                                                         |
| `resolve.conditions`           | `['node']`, ưu tiên resolve export `require`                                                  |
| `publicDir`                    | `resources`                                                                                   |
| `envPrefix`                    | `MAIN_VITE_` và `VITE_`                                                                       |

### Cấu hình sẵn có cho `preload`: {#built-in-config-for-preload}

| Tuỳ chọn                       | Mặc định                                                                                      |
| ------------------------------ | --------------------------------------------------------------------------------------------- |
| `build.target`                 | `node*`, tự động khớp target Node tương thích với Electron (ví dụ Electron 20 là `node16.15`) |
| `build.outDir`                 | `out\preload` (tương đối so với thư mục gốc project)                                          |
| `build.lib.entry`              | `src\preload\{index\|preload}.{js\|ts\|mjs\|cjs}`, chuỗi rỗng nếu không tìm thấy              |
| `build.lib.formats`            | `cjs` hoặc `es`, `es` chỉ được hỗ trợ trên electron 28+                                       |
| `build.reportCompressedSize`   | `false`, tắt báo cáo kích thước nén gzip để tăng hiệu năng build                              |
| `build.rollupOptions.external` | `electron` và tất cả module có sẵn của `node`                                                 |
| `build.assetDir`               | `chunks`                                                                                      |
| `build.minify`                 | `false`                                                                                       |
| `build.copyPublicDir`          | `false`, luôn luôn                                                                            |
| `build.ssr`                    | `true`, luôn luôn                                                                             |
| `build.ssrEmitAssets`          | `true`, luôn luôn                                                                             |
| `ssr.noExternal`               | `true`, luôn luôn                                                                             |
| `publicDir`                    | `resources`                                                                                   |
| `envPrefix`                    | `PRELOAD_VITE_` và `VITE_`                                                                    |

### Cấu hình sẵn có cho `renderer`: {#built-in-config-for-renderer}

| Tuỳ chọn                       | Mặc định                                                                                          |
| ------------------------------ | ------------------------------------------------------------------------------------------------- |
| `root`                         | `src\renderer`                                                                                    |
| `build.target`                 | `chrome*`, tự động khớp target Chrome tương thích với Electron (ví dụ Electron 20 là `chrome104`) |
| `build.outDir`                 | `out\renderer` (tương đối so với thư mục gốc project)                                             |
| `build.rollupOptions.input`    | `\src\renderer\index.html`, chuỗi rỗng nếu không tìm thấy                                         |
| `build.modulePreload.polyfill` | `false`, không cần polyfill `Module Preload` cho renderer của Electron                            |
| `build.reportCompressedSize`   | `false`, tắt báo cáo kích thước nén gzip để tăng hiệu năng build                                  |
| `build.minify`                 | `false`                                                                                           |
| `envPrefix`                    | `RENDERER_VITE_` và `VITE_`                                                                       |

## Tham khảo cấu hình Vite {#vite-config-reference}

Xem [cấu hình Vite](https://vitejs.dev/config).
