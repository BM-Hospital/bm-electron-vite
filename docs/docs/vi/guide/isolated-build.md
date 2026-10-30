# Build tách biệt <Badge type="info">experimental</Badge> {#isolated-build-experimental}

## Lý do {#rationale}

Khi phát triển với nhiều entry (kể cả entry động), bạn có thể gặp các nhu cầu hoặc thách thức sau:

- Xuất ra một file duy nhất
- Đảm bảo **tree-shaking** hiệu quả hơn để tránh import các module không cần thiết (thường phải refactor hoặc lặp lại code để giải quyết)
- Tránh sinh ra quá nhiều chunk để cải thiện hiệu năng tải

Trong Rollup, bạn có thể export một mảng từ file cấu hình để build bundle cho nhiều input không liên quan cùng lúc, ví dụ:

```js [rollup.config.js]
export default [
  {
    input: 'main-a.js',
    output: {
      file: 'dist/bundle-a.js',
      format: 'cjs'
    }
  },
  {
    input: 'main-b.js',
    output: {
      file: 'dist/bundle-b.js',
      format: 'cjs'
    }
  }
]
```

Trong electron-vite, có thể làm theo cách nhiều entry tương tự. Tuy nhiên, chúng tôi đã thêm tuỳ chọn `build.isolatedEntries` để đơn giản hoá cấu hình và giảm công sức cho bạn. Tuỳ chọn này cung cấp các tính năng sau:

- **Tự động tách biệt nhiều entry:** Không cần cấu hình thủ công từng entry.
- **Xử lý thông minh output của chunk và asset dùng chung:** Tự động quản lý dependency dùng chung để tránh bundle trùng lặp hoặc xung đột.

## Các trường hợp dùng build tách biệt {#scenarios-for-isolated-build}

- **Khi phát triển main process**, các module được import qua `?modulePath` mặc định được build tách biệt từ v5. Hành vi này đúng với kỳ vọng của lập trình viên và đặc biệt hữu ích trong các tình huống phát triển đa luồng, không cần cấu hình thêm.

- **Khi phát triển preload script**, nếu có nhiều entry với các import dùng chung, cần bật build tách biệt. Đây là điều kiện tiên quyết để hỗ trợ sandbox của Electron (cho phép xuất ra một bundle duy nhất). Thông thường, bạn cũng có thể cần tắt `build.externalizeDeps` để bundle toàn bộ.

```js [electron.vite.config.ts] {9,10,13,14}
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  // ...
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/preload/index.ts'),
          test: resolve(__dirname, 'src/preload/test.ts')
        }
      },
      isolatedEntries: true，
      externalizeDeps: false
    }
  },
  // ...
})
```

- **Khi phát triển renderer process**, nếu có nhiều entry, bật build tách biệt có thể giảm số lượng chunk được sinh ra, nhờ đó cải thiện hiệu năng render.

```js [electron.vite.config.js] {9,10,13}
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  // ...
  renderer: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'src/renderer/index.html'),
          test: resolve(__dirname, 'src/renderer/test.html')
        }
      },
      isolatedEntries: true
    }
  },
  // ...
})
```

## Tổng kết {#summary}

Khi có nhiều entry, bật `isolated build` sẽ làm giảm tốc độ build (trong phạm vi chấp nhận được). Tuy nhiên, sự đánh đổi này hoàn toàn xứng đáng, vì build tách biệt không chỉ cải thiện đáng kể hiệu năng và bảo mật của ứng dụng, mà còn giảm độ phức tạp khi phát triển và tăng năng suất cho lập trình viên.
