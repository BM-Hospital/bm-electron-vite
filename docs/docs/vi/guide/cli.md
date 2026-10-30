# Giao diện dòng lệnh {#command-line-interface}

## `electron-vite` {#electron-vite}

Bí danh: `electron-vite dev`, `electron-vite serve`.

Lệnh này build mã nguồn main process và preload scripts, khởi động dev server cho renderer, rồi cuối cùng chạy ứng dụng Electron.

## `electron-vite preview` {#electron-vite-preview}

Lệnh này build mã nguồn main process, preload scripts và renderer, rồi chạy ứng dụng Electron để xem trước.

## `electron-vite build` {#electron-vite-build}

Lệnh này build mã nguồn main process, preload scripts và renderer. Thường thì bạn cần chạy lệnh này trước khi đóng gói ứng dụng Electron.

## Tuỳ chọn {#options}

### Tuỳ chọn chung {#universal-options}

| Tuỳ chọn                 | Mô tả                                                     |
| ------------------------ | --------------------------------------------------------- |
| `-c, --config <file>`    | Dùng file cấu hình chỉ định                               |
| `-l, --logLevel <level>` | Đặt mức log (tuỳ chọn: `info`, `warn`, `error`, `silent`) |
| `-m, --mode <mode>`      | Đặt env mode                                              |
| `-w, --watch`            | Chế độ watch cho hot reloading (mặc định: `false`)        |
| `--ignoreConfigWarning`  | Bỏ qua cảnh báo cấu hình (mặc định: `false`)              |
| `--sourcemap`            | Xuất source map để debug (mặc định: `false`)              |
| `--outDir <dir>`         | Thư mục output (mặc định: `out`)                          |
| `--entry <file>`         | Chỉ định file entry của electron                          |
| `-v, --version`          | Hiển thị số phiên bản                                     |
| `-h, --help`             | Hiển thị các tuỳ chọn CLI có sẵn                          |

::: tip Ghi chú
Tuỳ chọn `--ignoreConfigWarning` cho phép bỏ qua cảnh báo khi thiếu cấu hình. Ví dụ, khi không dùng preload scripts.
:::

### Tuỳ chọn cho dev {#dev-options}

| Tuỳ chọn                | Mô tả                                                             |
| ----------------------- | ----------------------------------------------------------------- |
| `--inspect [port]`      | Bật V8 inspector trên port chỉ định (mặc định: `5858`)            |
| `--inspectBrk [port]`   | Giống `--inspect` nhưng dừng thực thi ở dòng JavaScript đầu tiên. |
| `--remoteDebuggingPort` | Port cho remote debugging                                         |
| `--noSandbox`           | Buộc renderer process chạy không có sandbox                       |
| `--rendererOnly`        | Chỉ chạy dev server cho renderer                                  |

::: tip Ghi chú
- Tuỳ chọn `--inspect` cho phép bật V8 inspector trên port chỉ định. Debugger bên ngoài có thể kết nối vào port này. Xem [V8 Inspector](debugging.md#v8-inspector-e-g-chrome-devtools) để biết thêm chi tiết.

- Tuỳ chọn `--inspectBrk` giống `--inspect` nhưng dừng thực thi ở dòng JavaScript đầu tiên.

- Tuỳ chọn `--remoteDebuggingPort` dùng để debug với IDE.

- Tuỳ chọn `--noSandbox` buộc Electron chạy không có sandbox. Thường dùng để Electron chạy được dưới quyền root trên Linux.

- Tuỳ chọn `--rendererOnly` chỉ dùng cho lệnh `dev`, giúp bỏ qua bước build main process và preload scripts, chỉ khởi động dev server cho renderer. Tuỳ chọn này giúp lệnh dev chạy nhanh hơn rất nhiều.
:::

::: warning Lưu ý
Khi dùng tuỳ chọn `--rendererOnly`, lệnh electron-vite phải đã được chạy ít nhất một lần. Ngoài ra, bạn chỉ nên dùng nó khi không thay đổi mã nguồn main process và preload scripts.
:::

### Tuỳ chọn cho preview {#preview-options}

| Tuỳ chọn      | Mô tả                                       |
| ------------- | ------------------------------------------- |
| `--noSandbox` | Buộc renderer process chạy không có sandbox |
| `--skipBuild` | Bỏ qua bước build                           |

::: tip Ghi chú
- Tuỳ chọn `--noSandbox` buộc Electron chạy không có sandbox. Thường dùng để Electron chạy được dưới quyền root trên Linux.

- Tuỳ chọn `--skipBuild` chỉ dùng cho lệnh `preview`, giúp bỏ qua bước build và chạy ngay ứng dụng Electron để xem trước.
:::
