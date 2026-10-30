---
outline: deep
---

# Chuyển đổi từ v4 {#migration-from-v4}

## Thay đổi chung {#general-changes}

### Ngừng hỗ trợ `externalizeDepsPlugin` {#deprecation-of-externalizedepsplugin}

`externalizeDepsPlugin` đã bị deprecated. Trong v5, bạn có thể dùng `build.externalizeDeps` để tuỳ chỉnh hành vi này. **Tính năng này được bật mặc định**, nên bạn không cần import plugin nữa.

```js [electron.vite.config.ts]
import { defineConfig, externalizeDepsPlugin } from 'bm-electron-vite' // [!code --]
import { defineConfig } from 'bm-electron-vite' // [!code ++]

export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin()] // [!code --]
  },
  preload: {
    plugins: [externalizeDepsPlugin()] // [!code --]
  }
  // ...
})
```

- Liên quan: [Xử lý dependency](./dependency-handling.md).

### Ngừng hỗ trợ `bytecodePlugin` {#deprecation-of-bytecodeplugin}

`bytecodePlugin` đã bị deprecated. Trong v5, bạn có thể dùng `build.bytecode` để bật hoặc tuỳ chỉnh tính năng này.

```js [electron.vite.config.ts]
import { defineConfig, bytecodePlugin } from 'bm-electron-vite' // [!code --]
import { defineConfig } from 'bm-electron-vite' // [!code ++]

export default defineConfig({
  main: {
    plugins: [bytecodePlugin()] // [!code --]
    build: { // [!code ++]
      bytecode: true // [!code ++]
    } // [!code ++]
  },
  preload: {
    plugins: [bytecodePlugin()] // [!code --]
    build: { // [!code ++]
      bytecode: true // [!code ++]
    } // [!code ++]
  },
  // ...
})
```

```js [electron.vite.config.ts]
import { defineConfig, bytecodePlugin } from 'bm-electron-vite' // [!code --]
import { defineConfig } from 'bm-electron-vite' // [!code ++]

export default defineConfig({
  main: {
    plugins: [bytecodePlugin({ protectedStrings: ['foo'] })] // [!code --]
    build: { // [!code ++]
      bytecode: { protectedStrings: ['foo'] } // [!code ++]
    } // [!code ++]
  },
  // ...
})
```

- Liên quan: [Bảo vệ mã nguồn](./source-code-protection.md).

## Thay đổi cấu hình {#configuration-changes}

### Bỏ việc resolve hàm cho các trường cấu hình lồng nhau {#remove-function-resolution-for-nested-config-fields}

Trong v5, **cấu hình dạng hàm không còn được hỗ trợ** cho các trường cấu hình lồng nhau như `main`, `preload` hoặc `renderer`. Thay vào đó, bạn nên định nghĩa trực tiếp các object cấu hình tĩnh.

```js
import { defineConfig, defineViteConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    // ...
  },
  preload: {
    // ...
  },
  renderer: defineViteConfig(({ command, mode }) => { ❌ // [!code error]
    // ...
  })
})
```

- Liên quan: [Cấu hình có điều kiện](../config/index.md#conditional-config).
