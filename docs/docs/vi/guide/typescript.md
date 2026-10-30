# TypeScript {#typescript}

## Định nghĩa kiểu {#type-definitions}

Nếu bạn dùng TypeScript, hãy thêm một file khai báo `*.d.ts` để có kiểm tra kiểu và intellisense:

```js
/// <reference types="bm-electron-vite/node" />
```

Ngoài ra, bạn có thể thêm `bm-electron-vite/node` vào `compilerOptions.types` trong `tsconfig`:

```json [tsconfig.node.json ~vscode-icons:file-type-tsconfig~]
{
  "compilerOptions": {
    "types": ["bm-electron-vite/node"]
  }
}
```

## Decorator {#decorators}

Vite (Rollup) không hỗ trợ tính năng `emitDecoratorMetadata` của TypeScript. Một số package (`typeorm`, `sequelize-typescript`, v.v.) dùng module `reflect-metadata` làm polyfill để mở rộng metadata của object. Trong phát triển Electron, các thư viện này rất hay được dùng, nên cần hỗ trợ xuất type metadata cho decorator.

electron-vite cung cấp `swcPlugin` (tuỳ chọn), chạy trên [swc](https://swc.rs/), để thay thế bước transform code của Vite.

Khi cần hỗ trợ tính năng này, bạn có thể sửa file cấu hình như sau:

```js [electron.vite.config.ts]
import { defineConfig, swcPlugin } from 'bm-electron-vite'

export default defineConfig({
  main: {
    plugins: [swcPlugin()]
  }
  // ...
})
```

::: tip Ghi chú
Khi dùng `swcPlugin`, bạn cần cài `@swc/core`, vì đây là optional peer dependency của electron-vite.
:::
