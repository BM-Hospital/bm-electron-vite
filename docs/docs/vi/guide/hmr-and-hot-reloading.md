# HMR và Hot Reloading {#hmr-and-hot-reloading}

## Sử dụng HMR {#using-hmr}

Để dùng HMR trong renderer process, bạn cần dựa vào `environment variables` để quyết định cửa sổ trình duyệt sẽ tải file html cục bộ hay một URL cục bộ.

```js
function createWindow() {
  // Tạo cửa sổ trình duyệt
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js')
    }
  })

  // Tải URL cục bộ khi phát triển hoặc file html
  // cục bộ khi chạy production
  if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
}
```

Biến `ELECTRON_RENDERER_URL` là URL cục bộ nơi Vite đang chạy.

Với ứng dụng **nhiều trang**, bạn có thể dùng như sau:

```js
if (!app.isPackaged && process.env['ELECTRON_RENDERER_URL']) {
  mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/view.html`)
} else {
  mainWindow.loadFile(path.join(__dirname, '../renderer/view.html'))
}
```

::: tip Ghi chú
- Khi phát triển, file `index.html` của renderer cần tham chiếu tới code script của bạn qua `<script type="module">`.

- Khi chạy production, `BrowserWindow` cần tải file `index.html` từ thư mục output, không phải file html trong mã nguồn.
:::

## Bật Hot Reloading {#enabling-hot-reloading}

**Hot reloading** là việc tự động build lại và khởi động lại ứng dụng Electron mỗi khi file của main process hoặc preload script thay đổi. Dù đây không phải hot reloading thực sự (cập nhật code mà không cần khởi động lại), nó vẫn mang lại trải nghiệm phát triển tương tự.

Cách electron-vite triển khai:

- Bật Rollup watcher để theo dõi các file của main process và preload script
- Build lại và khởi động lại ứng dụng Electron khi file của main process thay đổi
- Build lại và kích hoạt reload renderer khi file của preload script thay đổi

Có hai cách để bật:

1. Dùng tuỳ chọn CLI `-w` hoặc `--watch`, ví dụ `electron-vite dev --watch`. Đây là cách nên dùng vì linh hoạt hơn.
2. Dùng tuỳ chọn cấu hình `build.watch` và đặt thành `{}`. Ngoài ra, bạn có thể cấu hình thêm các tuỳ chọn watcher, xem [WatcherOptions](https://rollupjs.org/guide/en/#watch-options).

::: tip Ghi chú
Hot reloading chỉ dùng được khi phát triển.
:::

::: warning Khi nào nên dùng hot reloading
Vì không kiểm soát được thời điểm reload, hot reloading không thể được triển khai hoàn hảo. Trên thực tế, hot reloading không phải lúc nào cũng có lợi, nên bạn nên dùng tuỳ chọn CLI để linh hoạt quyết định có bật hay không.
:::
