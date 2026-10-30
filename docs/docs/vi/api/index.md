# API {#api}

Các JavaScript API của electron-vite đều có kiểu dữ liệu đầy đủ. Bạn nên dùng TypeScript hoặc bật kiểm tra kiểu JS trong VS Code để tận dụng intellisense và kiểm tra lỗi.

## `build` {#build}

Chữ ký kiểu:

```js
async function build(inlineConfig: InlineConfig = {}): Promise<void>
```

Ví dụ sử dụng:

```js
const path = require('path')
const { build } = require('bm-electron-vite')

;(async () => {
  await build({
    build: {
      outDir: 'out'
      rollupOptions: {
        // ...
      }
    }
  })
})()
```

## `createServer` {#createserver}

Chữ ký kiểu:

```js
async function createServer(inlineConfig: InlineConfig = {}): Promise<void>
```

Ví dụ sử dụng:

```js
const { createServer } = require('bm-electron-vite')

;(async () => {
  await createServer({
    server: {
      port: 1337
    }
  })
})()
```

## `preview` {#preview}

Chữ ký kiểu:

```js
async function preview(inlineConfig: InlineConfig = {}): Promise<void>
```

Ví dụ sử dụng:

```js
const { preview } = require('bm-electron-vite')

;(async () => {
  await preview({})
})()
```

## `InlineConfig` {#inlineconfig}

Interface InlineConfig mở rộng [UserConfig](https://vitejs.dev/guide/api-javascript.html#inlineconfig) của Vite với các thuộc tính bổ sung:

- `ignoreConfigWarning`: đặt thành `false` để bỏ qua cảnh báo khi thiếu cấu hình

Đồng thời bỏ thuộc tính `base`, vì trong Electron không cần đặt base public path.

## `resolveConfig` {#resolveconfig}

Chữ ký kiểu:

```js
async function resolveConfig(
  inlineConfig: InlineConfig,
  command: 'build' | 'serve',
  defaultMode = 'development'
): Promise<ResolvedConfig>
```
