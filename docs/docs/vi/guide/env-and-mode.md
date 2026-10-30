# Biến môi trường và Mode {#env-variables-and-modes}

::: tip Mẹo
Bạn nên đọc tài liệu [Env Variables and Modes của Vite](https://vitejs.dev/guide/env-and-mode.html) trước khi đọc các phần bên dưới.
:::

## Biến môi trường toàn cục {#global-env-variables}

Giống Vite, electron-vite tải biến môi trường từ thư mục gốc của project và dùng các tiền tố khác nhau để giới hạn phạm vi sử dụng.

Mặc định, biến có tiền tố `MAIN_VITE_` dùng được trong main process, `PRELOAD_VITE_` trong preload script, `RENDERER_VITE_` trong renderer và `VITE_` ở mọi nơi.

```[.env]
KEY=123                # không dùng được
MAIN_VITE_KEY=123      # chỉ main process dùng được
PRELOAD_VITE_KEY=123   # chỉ preload script dùng được
RENDERER_VITE_KEY=123  # chỉ renderer dùng được
VITE_KEY=123           # dùng được ở mọi nơi
```

Nếu muốn tuỳ chỉnh tiền tố của biến môi trường, bạn có thể dùng tuỳ chọn `envPrefix`.

```js [electron.vite.config.js]
export default defineConfig({
  main: {
    envPrefix: 'M_VITE_'
  }
  // ...
})
```

Nếu dùng TypeScript, hãy thêm định nghĩa kiểu cho `import.meta.env` trong `env.d.ts` để có kiểm tra kiểu và gợi ý (intellisense) cho các biến môi trường do bạn định nghĩa.

```js
/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MAIN_VITE_SOME_KEY: string
  // thêm biến môi trường khác...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

## Mode {#modes}

Mặc định, lệnh `dev` chạy ở mode `development`, còn lệnh `build` và `preview` chạy ở mode `production`.

Bạn có thể ghi đè mode mặc định của một lệnh bằng cách truyền cờ `--mode`. Xem [Vite Modes](https://vitejs.dev/guide/env-and-mode.html#modes).
