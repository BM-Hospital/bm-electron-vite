---
outline: deep
---

# Xử lý dependency {#dependency-handling}

Khi bundle bằng `electron-vite`, dependency được xử lý thông minh để giữ bản build cuối cùng **gọn nhẹ**. Hướng dẫn này trình bày cách xử lý dependency mặc định và cách tuỳ chỉnh.

## Hành vi mặc định {#default-behavior}

Mặc định, electron-vite coi module `electron` và mọi module built-in của Node.js là dependency bên ngoài (external).

### `dependencies` {#dependencies}

- **Main process & preload script** - Các dependency khai báo trong `dependencies` của `package.json` được coi là external và không được bundle.

  ::: tip Vì sao
  Các dependency này vẫn được đưa vào khi đóng gói ứng dụng (ví dụ qua `electron-builder`).
  :::

- **Renderer** - Các dependency khai báo trong `dependencies` của `package.json` được bundle.

  ::: tip Vì sao
  Bundle dependency giúp giảm số lượng chunk, từ đó giữ cho renderer hoạt động nhanh.
  :::

  ::: warning Lưu ý
  Dependency dùng trong renderer process nên được cài dưới dạng `devDependencies` để **giữ kích thước package cuối cùng nhỏ hơn**.
  :::

### `devDependencies` và phantom dependency {#devdependencies-and-phantom-dependencies}

Chỉ những dependency thực sự được **import** hoặc **require** trong project mới được đưa vào bundle. Bất kể dependency đó nằm trong `devDependencies` của `package.json`, hay là “phantom dependency” (có trong thư mục `node_modules` nhưng không được khai báo rõ trong `package.json`), chúng đều được bundle miễn là được tham chiếu trong code.

::: tip Ghi chú
Các công cụ đóng gói (như `electron-builder`) mặc định loại bỏ `devDependencies`.
:::

## Tuỳ chỉnh {#customizing}

Bạn có thể tuỳ chỉnh cách xử lý dependency bằng cách cấu hình tuỳ chọn `build.externalizeDeps.exclude` và `build.externalizeDeps.include`, giúp kiểm soát tốt hơn dependency nào được bundle hay để external.

```js [electron.vite.config.js] {7}
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    build: {
      externalizeDeps: {
        exclude: ['foo']
      }
    }
  }
  // ...
})
```

Trong ví dụ này, package `foo` sẽ được bundle. Bạn cũng có thể cài dependency này trong `devDependencies` để đạt được hiệu quả tương tự.

::: warning Ghi chú
Trước `electron-vite 5`, bạn cần cấu hình việc này bằng `externalizeDepsPlugin`.
:::

## Bundle toàn bộ {#fully-bundling}

Nếu muốn bundle toàn bộ dependency, bạn có thể tắt tuỳ chọn `build.externalizeDeps` để tắt cơ chế xử lý dependency tự động của electron-vite.

```js [electron.vite.config.js] {6}
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    build: {
      externalizeDeps: false
    }
  }
  // ...
})
```

Hãy nhớ rằng bundle toàn bộ sẽ **làm tăng thời gian build**, và bạn nên lên [chiến lược chia chunk](./build.md#chunking-strategy) cẩn thận để **tránh ảnh hưởng đến hiệu năng khởi động ứng dụng**.

::: tip Ghi chú
Với preload script, cần tắt việc externalize dependency để hỗ trợ môi trường sandbox của Electron. Xem chi tiết ở mục [Hạn chế của sandbox](./dev.md#limitations-of-sandboxing).
:::

Khi bundle toàn bộ, một số module không hỗ trợ việc bundle, ví dụ Node.js addon. Các module này phải được giữ external, có thể cấu hình qua `build.rollupOptions.external`.

```js [electron.vite.config.js] {5}
export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        external: ['sqlite3']
      }
    }
  }
  // ...
})
```
