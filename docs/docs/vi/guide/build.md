# Build cho production {#building-for-production}

Khi đến lúc đóng gói ứng dụng Electron cho production, thường bạn cần chạy lệnh `electron-vite build` trước.

## Thư mục output {#output-dir}

Mặc định, output của bước build được đặt tại `out` (tương đối với thư mục gốc của project).

```
├──out/
│  ├──main
│  ├──preload
│  └──renderer
└──...
```

Bạn có thể chỉ định thư mục này qua flag dòng lệnh, ví dụ `electron-vite dev/build/preview --outDir=dist`.

Ngoài ra, bạn cũng có thể dùng tuỳ chọn `build.outDir` để chỉ định thư mục output cho main process, renderer và preload script.

```js [electron.vite.config.js] {4,9,14}
export default defineConfig({
  main: {
    build: {
      outDir: 'dist/main'
    }
  },
  preload: {
    build: {
      outDir: 'dist/preload'
    }
  },
  renderer: {
    build: {
      outDir: 'dist/renderer'
    }
  }
})
```

::: tip Ghi chú
Nên đặt toàn bộ code đã bundle trong **một thư mục duy nhất**, vì tất cả đều cần thiết để ứng dụng Electron chạy. Điều này cũng giúp dễ loại bỏ mã nguồn khi đóng gói ứng dụng, giảm kích thước package.
:::

## Tuỳ chỉnh build {#customizing-the-build}

Bạn có thể tuỳ chỉnh build qua nhiều [tuỳ chọn cấu hình build](https://vitejs.dev/config/build-options.html). Cụ thể, bạn có thể điều chỉnh trực tiếp các [tuỳ chọn Rollup](https://rollupjs.org/guide/en/#big-list-of-options) bên dưới qua `build.rollupOptions`:

```js [electron.vite.config.js]
export default defineConfig({
  main: {
    rollupOptions: {
      // ...
    }
  },
  preload: {
    rollupOptions: {
      // ...
    }
  },
  renderer: {
    rollupOptions: {
      // ...
    }
  }
})
```

## Chiến lược chia chunk {#chunking-strategy}

Một chiến lược chia chunk hiệu quả rất quan trọng để tối ưu hiệu năng của ứng dụng Electron.

Việc tách chunk có thể cấu hình qua `build.rollupOptions.output.manualChunks` (xem [tài liệu Rollup](https://rollupjs.org/configuration-options/#output-manualchunks)).

```js [electron.vite.config.ts]
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        output: {
          manualChunks(id): string | void {
            if (id.includes('foo')) {
              return 'foo'
            }
          }
        }
      }
    }
  },
  // ...
})
```

## Xử lý dependency {#dependency-handling}

Xem [Xử lý dependency](./dependency-handling.md).

## Build tách biệt {#isolated-build}

Xem [Build tách biệt](./isolated-build.md).

## Bảo vệ mã nguồn {#source-code-protection}

Xem [Bảo vệ mã nguồn](./source-code-protection.md).
