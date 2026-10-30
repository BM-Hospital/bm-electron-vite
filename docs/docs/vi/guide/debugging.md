# Debug {#debugging}

electron-vite hỗ trợ debug cả code của main process lẫn renderer process.

::: tip Mẹo
Khi bạn tuỳ chỉnh thư mục output của build bằng tham số CLI `--outDir`, cấu hình debugger cũng cần thêm tham số này. Nhưng nếu tuỳ chỉnh qua `build.outDir` trong file cấu hình thì không cần.
:::

## VSCode {#vscode}

Thêm file `.vscode/launch.json` với cấu hình sau:

```json [.vscode/launch.json]
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug Main Process",
      "type": "node",
      "request": "launch",
      "cwd": "${workspaceRoot}",
      "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron-vite",
      "windows": {
        "runtimeExecutable": "${workspaceRoot}/node_modules/.bin/electron-vite.cmd"
      },
      "runtimeArgs": ["--sourcemap"],
      "env": {
        "REMOTE_DEBUGGING_PORT": "9222"
      }
    },
    {
      "name": "Debug Renderer Process",
      "port": 9222,
      "request": "attach",
      "type": "chrome",
      "webRoot": "${workspaceFolder}/src/renderer",
      "timeout": 60000,
      "presentation": {
        "hidden": true
      }
    }
  ],
  "compounds": [
    {
      "name": "Debug All",
      "configurations": ["Debug Main Process", "Debug Renderer Process"],
      "presentation": {
        "order": 1
      }
    }
  ]
}
```

Sau đó đặt vài breakpoint trong mã nguồn (main process hoặc renderer process). Mở Debug view và đảm bảo đã chọn `Debug All`. Rồi nhấn F5 để bắt đầu debug.

::: tip Ghi chú
Bạn cũng có thể chọn `Debug Main Process` để chỉ debug main process. Vì việc debug renderer chỉ có thể attach, nên không thể debug riêng renderer.
:::

## WebStorm {#webstorm}

Tạo một run configuration loại `Npm`. Dùng các thiết lập sau để debug main process:

| Thiết lập | Giá trị                                     |
| :-------- | :------------------------------------------ |
| Command   | run                                         |
| Scripts   | dev                                         |
| Arguments | -- --sourcemap --remote-debugging-port=9222 |

Đồng thời tạo một run configuration loại `Attach to Node.js/Chrome`. Dùng các thiết lập sau để debug renderer process:

| Thiết lập | Giá trị   |
| :-------- | :-------- |
| Host      | localhost |
| Port      | 9222      |

Sau đó chạy các configuration này ở chế độ debug.

## V8 Inspector, ví dụ Chrome DevTools {#v8-inspector-e-g-chrome-devtools}

electron-vite cũng hỗ trợ debug mà không cần IDE. Dùng một trong các lệnh sau để khởi chạy electron-vite.

```sh
# Electron sẽ lắng nghe V8 inspector.
electron-vite --inspect --sourcemap

# Giống --inspect nhưng tạm dừng thực thi ở dòng JavaScript đầu tiên.
electron-vite --inspect-brk --sourcemap
```

Khi electron-vite đã khởi động, bạn có thể dùng `Chrome DevTools` bằng cách mở `chrome://inspect` trên trình duyệt và kết nối tới V8 inspector.

::: tip Ghi chú
Nếu muốn debug mã nguồn thay vì code đã bundle, bạn cần thêm tuỳ chọn `--sourcemap`.
:::
