---
outline: deep
---

# Phát triển {#development}

## Cấu trúc project {#project-structure}

### Quy ước {#conventions}

Bạn nên dùng cấu trúc project sau:

```
.
├──src
│  ├──main
│  │  ├──index.ts
│  │  └──...
│  ├──preload
│  │  ├──index.ts
│  │  └──...
│  └──renderer    # dùng vue, react, v.v.
│     ├──src
│     ├──index.html
│     └──...
├──electron.vite.config.ts
├──package.json
└──...
```

Với quy ước này, electron-vite có thể chạy với **cấu hình tối thiểu**.

Khi chạy, electron-vite sẽ tự tìm entry của main process, preload script và renderer. Các entry mặc định:

- **Main process:** `<root>/src/main/{index|main}.{js|ts|mjs|cjs}`
- **Preload script:** `<root>/src/preload/{index|preload}.{js|ts|mjs|cjs}`
- **Renderer:** `<root>/src/renderer/index.html`

Nếu không tìm thấy entry, công cụ sẽ báo lỗi. Bạn có thể khắc phục bằng cách đặt tuỳ chọn `build.rollupOptions.input`.

Xem ví dụ ở [phần tiếp theo](#customizing).

### Tuỳ chỉnh {#customizing}

Dù chúng tôi rất khuyến khích dùng cấu trúc project ở trên, đây không phải là bắt buộc. Bạn có thể cấu hình để phù hợp với nhu cầu của mình.

Giả sử bạn có cấu trúc project như sau:

```
.
├──electron
│  ├──main
│  │  ├──index.ts
│  │  └──...
│  └──preload
│     ├──index.ts
│     └──...
├──src   # dùng vue, react, v.v.
├──index.html
├──electron.vite.config.ts
├──package.json
└──...
```

File `electron.vite.config.ts` của bạn sẽ là:

```js [electron.vite.config.ts]
import { defineConfig } from 'bm-electron-vite'
import { resolve } from 'path'

export default defineConfig({
  main: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/main/index.ts')
        }
      }
    }
  },
  preload: {
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'electron/preload/index.ts')
        }
      }
    }
  },
  renderer: {
    root: '.',
    build: {
      rollupOptions: {
        input: {
          index: resolve(__dirname, 'index.html')
        }
      }
    }
  }
})
```

::: warning Ghi chú
Mặc định, thư mục làm việc của renderer nằm ở `src/renderer`. Trong ví dụ này, tuỳ chọn `root` của renderer cần đặt thành `'.'`.
:::

## Sử dụng preload script {#using-preload-scripts}

Preload script được inject trước khi trang web được tải trong renderer. Để thêm vào renderer các tính năng cần quyền truy cập đặc quyền, bạn có thể định nghĩa các object [global](https://developer.mozilla.org/en-US/docs/Glossary/Global_object) thông qua API [contextBridge](https://www.electronjs.org/docs/latest/api/context-bridge).

Vai trò của preload script:

- **Mở rộng renderer**: preload script chạy trong một context có quyền truy cập các API HTML DOM và một phần giới hạn các API của Node.js và Electron.
- **Giao tiếp giữa main process và renderer process**: dùng module `ipcMain` và `ipcRenderer` của Electron để giao tiếp liên tiến trình (IPC).

<script setup>
import { withBase } from 'vitepress'
</script>

<p>
  <img :src="withBase('/electron-processes.png')" class="ev-dev" alt="eproc">
</p>

Tìm hiểu thêm về [preload script](https://www.electronjs.org/docs/latest/tutorial/tutorial-preload).

### Ví dụ {#example}

1. Tạo một preload script để expose `functions` và `variables` sang renderer qua `contextBridge.exposeInMainWorld`.

2. Để gắn script này vào renderer process, truyền đường dẫn của nó vào tuỳ chọn `webPreferences.preload` trong constructor `BrowserWindow`.

3. Dùng các hàm và biến đã expose trong renderer process.

::: code-group

```js [preload.js]
import { contextBridge, ipcRenderer } from 'electron'

contextBridge.exposeInMainWorld('electron', {
  ping: () => ipcRenderer.invoke('ping')
})
```

```js [main.js] {7,11}
import { app, BrowserWindow } from 'electron'
import path from 'path'

const createWindow = () => {
  const win = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  })

  ipcMain.handle('ping', () => 'pong')

  win.loadFile('index.html')
}

app.whenReady().then(() => {
  createWindow()
})
```

```js [renderer.js] {2}
const func = async () => {
  const response = await window.electron.ping()
  console.log(response) // in ra 'pong'
}

func()
```
:::

### Giới hạn của sandbox {#limitations-of-sandboxing}

Từ Electron 20 trở đi, preload script mặc định chạy trong sandbox và không còn truy cập được môi trường Node.js đầy đủ. Trên thực tế, bạn chỉ có một hàm require dạng polyfill (tương tự module require của Node) và chỉ truy cập được một tập API giới hạn.

| API khả dụng         | Chi tiết                                                                                  |
| :------------------- | :---------------------------------------------------------------------------------------- |
| Module Electron      | Chỉ [Renderer Process Modules](https://www.electronjs.org/docs/latest/api/context-bridge) |
| Module Node.js       | `events`, `timers`, `url`                                                                 |
| Global dạng polyfill | `Buffer`, `process`, `clearImmediate`, `setImmediate`                                     |

Ở chế độ sandbox, nếu bạn `require` hoặc `import` module khác trong preload script, bạn có thể gặp lỗi sau:

> Unable to load preload scripts -> Error: module not found: 'foo'

Để xử lý dependency đúng cách, bạn có hai lựa chọn:

1. **Tắt sandbox**
2. **Bundle toàn bộ dependency bằng `electron-vite`**

   Đưa tất cả module cần thiết vào output build để preload script truy cập được khi chạy. Xem thêm tại các phần [Xử lý dependency](./dependency-handling.md) và [Build tách biệt](./isolated-build.md).

::: details Cách tắt sandbox trong Electron
Trong Electron, bạn có thể tắt sandbox cho renderer theo từng process bằng tuỳ chọn `sandbox: false` trong constructor [BrowserWindow](https://www.electronjs.org/docs/latest/api/browser-window).

```js
const win = new BrowserWindow({
  webPreferences: {
    sandbox: false
  }
})
```
:::

Tìm hiểu thêm về [Electron Process Sandboxing](https://www.electronjs.org/docs/latest/tutorial/sandbox).

### Toolkit {#toolkit}

Để phát triển hiệu quả hơn, bạn nên dùng [@electron-toolkit/preload](https://github.com/alex8088/electron-toolkit/tree/master/packages/preload). Thư viện này giúp expose các API của Electron (`ipcRenderer`, `webFrame`, `process`) sang renderer process một cách dễ dàng.

Trước tiên, dùng `contextBridge` để expose API của Electron sang renderer nếu context isolation được bật, nếu không thì chỉ cần gắn vào global của DOM. Sau đó, dùng trực tiếp API của Electron trong renderer process.

::: code-group
```js [preload.js]
import { contextBridge } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
  } catch (error) {
    console.error(error)
  }
} else {
  window.electron = electronAPI
}
```

```js [renderer.js]
// Gửi message tới main process, không cần phản hồi
window.electron.ipcRenderer.send('electron:say', 'hello')

// Gửi message tới main process và nhận phản hồi bất đồng bộ
window.electron.ipcRenderer.invoke('electron:doAThing', '').then(re => {
  console.log(re)
})

// Nhận message từ main process
window.electron.ipcRenderer.on('electron:reply', (_, args) => {
  console.log(args)
})
```
:::

Tìm hiểu thêm về [@electron-toolkit/preload](https://github.com/alex8088/electron-toolkit/tree/master/packages/preload).

::: warning BẢO MẬT IPC
Cách an toàn nhất là dùng một hàm hỗ trợ để bọc lời gọi `ipcRenderer`, thay vì expose trực tiếp module ipcRenderer qua context bridge.
:::

### Webview {#webview}

Cách đơn giản nhất để gắn preload script vào webview là thông qua event handler `will-attach-webview` của webContents.

```js
mainWindow.webContents.on('will-attach-webview', (e, webPreferences) => {
  webPreferences.preload = join(import.meta.dirname, '../preload/index.js')
})
```

## `nodeIntegration` {#nodeintegration}

electron-vite không hỗ trợ `nodeIntegration`. Chúng tôi khuyến nghị dùng preload script và tránh dùng module Node.js trong renderer, đây là best practice mà hầu hết các ứng dụng Electron phổ biến áp dụng. Nếu thực sự cần tính năng này, bạn phải tự thêm polyfill (ví dụ dùng plugin như [vite-plugin-commonjs-externals](https://github.com/xiaoxiangmoe/vite-plugin-commonjs-externals)).

## Ứng dụng nhiều cửa sổ {#multiple-windows-app}

Khi ứng dụng Electron của bạn có nhiều cửa sổ, nghĩa là có nhiều file html hoặc file preload. Bạn có thể sửa file cấu hình như sau:

```js [electron.vite.config.js] {7,8,17,18}
export default {
  main: {},
  preload: {
    build: {
      rollupOptions: {
        input: {
          browser: resolve(__dirname, 'src/preload/browser.js'),
          webview: resolve(__dirname, 'src/preload/webview.js')
        }
      }
    }
  },
  renderer: {
    build: {
      rollupOptions: {
        input: {
          browser: resolve(__dirname, 'src/renderer/browser.html'),
          webview: resolve(__dirname, 'src/renderer/webview.html')
        }
      }
    }
  }
}
```

::: tip Cách tải nhiều trang
Xem phần [Sử dụng HMR](./hmr-and-hot-reloading.md#using-hmr) để biết thêm chi tiết.
:::

## Truyền tham số cho ứng dụng Electron {#passing-arguments-to-electron-app}

Bạn có thể thêm `--` sau lệnh CLI electron-vite, theo sau là các tham số cần truyền.

- Truyền cờ CLI của Electron:

```json
"scripts": {
  "dev": "electron-vite dev -- --trace-warnings"
}
```

::: tip Ghi chú
electron-vite đã hỗ trợ sẵn `--inspect`, `--inspect-brk`, `--remote-debugging-port` và `--no-sandbox`, nên bạn không cần làm vậy với các lệnh này. Xem [Giao diện dòng lệnh](./cli.md#dev-options) để biết thêm chi tiết.
:::

- Truyền tham số cho ứng dụng

```json
"scripts": {
  "dev": "electron-vite dev -- p1 p2"
}
```

Mọi tham số sau dấu gạch đôi sẽ được truyền cho ứng dụng Electron, và bạn có thể dùng `process.argv` để xử lý chúng.

## Đa luồng {#multi-threading}

### Worker Threads {#worker-threads}

Bạn có thể import trực tiếp một node worker bằng cách thêm `?modulePath` hoặc `?nodeWorker` vào import.

- Default export với hậu tố `?modulePath` là đường dẫn tới bundle của worker. Cú pháp này gần với chuẩn hơn và là cách `nên dùng` để tạo node worker.

```js
import { resolve } from 'node:path'
import { Worker } from 'node:worker_threads'
import workerPath from './worker?modulePath'

new Worker(workerPath, {})
```

- Default export với hậu tố `?nodeWorker` là một constructor của node worker.

```js
import createWorker from './worker?nodeWorker'

createWorker({ workerData: 'worker' })
  .on('message', message => {
    console.log(`Message from worker: ${message}`)
  })
  .postMessage('')
```

### Utility Process và Child Process {#utility-process-and-child-process}

electron-vite hỗ trợ dùng API [UtilityProcess](https://www.electronjs.org/docs/latest/api/utility-process) của Electron hoặc [child_process](https://nodejs.org/api/child_process.html) của Node.js để fork một child process. Child process có thể được import với hậu tố `?modulePath`.

::: code-group

```js [main.js]
import { utilityProcess, MessageChannelMain } from 'electron'
import forkPath from './fork?modulePath'

const { port1, port2 } = new MessageChannelMain()
const child = utilityProcess.fork(forkPath)
child.postMessage({ message: 'hello' }, [port1])

port2.on('message', e => {
  console.log(`Message from child: ${e.data}`)
})
port2.start()
port2.postMessage('hello')
```

```js [fork.js]
process.parentPort.on('message', e => {
  const [port] = e.ports
  port.on('message', e => {
    console.log(`Message from parent: ${e.data}`)
  })
  port.start()
  port.postMessage('hello')
})
```

:::

## Hỗ trợ ESM trong Electron {#esm-support-in-electron}

Electron hỗ trợ ES module từ Electron 28. electron-vite 2.0 cũng hỗ trợ dùng ESM để phát triển và build ứng dụng Electron.

### Giới hạn {#limitations}

Trước hết, cần nắm các giới hạn của ESM trong Electron:

1. Main process và preload script của Electron đều hỗ trợ ESM và dùng ESM loader của Node.js.
2. Preload script của Electron phải `unsandboxed` và file phải có đuôi `.mjs`.

Tìm hiểu thêm về [ES Modules (ESM) in Electron](https://www.electronjs.org/docs/latest/tutorial/esm).

### Bật ESM {#enabling-esm}

Có hai cách để bật ESM cho electron-vite:

1. Thêm `"type": "module"` vào `package.json` gần nhất.

   Với cách này, main process và preload script sẽ được bundle thành file ES module. Lưu ý file preload script có đuôi `.mjs`, nên bạn cần sửa lại tên file ở những chỗ tham chiếu tới preload script trong code.

2. Đặt `build.rollupOptions.output.format` thành `es` trong file cấu hình.

   ```js [electron.vite.config.js]
   export default defineConfig({
     main: {
       build: {
         rollupOptions: {
           output: {
             format: 'es'
           }
         }
       }
     },
     preload: {
       build: {
         rollupOptions: {
           output: {
             format: 'es'
           }
         }
       }
     }
     // ...
   })
   ```

   Với cách này, main process và preload script sẽ được bundle thành file ES module có đuôi `.mjs`. Bạn cần sửa trường `main` (entry của Electron) trong `package.json` và tên file ở những chỗ tham chiếu tới preload script trong code.

Ngoài ra, từ electron-vite 2.0, bạn có thể dùng `"type": "module"` trong `package.json` ngay cả khi Electron thấp hơn 28. Khi đó, main process và preload script sẽ được bundle thành file CommonJS có đuôi `.cjs`.

### Chuyển sang ESM {#migrating-to-esm}

Trước đây, chúng ta dùng CommonJS làm định dạng build. Có thể gặp một số package NPM không hỗ trợ CommonJS, nhưng ta có thể bundle chúng qua electron-vite để chạy được trên Electron. Tương tự, khi chuyển sang ESM, ta cũng sẽ gặp một số vấn đề.

- Import module CommonJS từ ES module

  ```js
  import { autoUpdater } from 'electron-updater' // ❌ SyntaxError: Named export 'autoUpdater' not found.
  ```

  Trong ví dụ trên, ta sẽ gặp _SyntaxError_. Tuy vậy, vẫn có thể import module CommonJS từ ES module bằng cú pháp import chuẩn. Nếu object `module.exports` được cung cấp làm default export hoặc export được định nghĩa bằng `Object.defineProperty`, named import sẽ không hoạt động, nhưng default import thì có.

  ```js
  import updater from 'electron-updater' // ✅
  ```

- Khác biệt giữa ES module và CommonJS

  ```js
  import { BrowserWindow } from 'electron'
  import { join } from 'path'

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs') // ❌ ReferenceError: __dirname is not defined
    }
  })
  ```

  Trong ESM, một số tham chiếu quan trọng của CommonJS không được định nghĩa, bao gồm `require`, `require.resolve`, `__filename`, `__dirname`, v.v. Xem [Differences between ES modules and CommonJS](https://nodejs.org/api/esm.html#differences-between-es-modules-and-commonjs) của Node.js để biết thêm chi tiết.

  ```js
  import { BrowserWindow } from 'electron'
  import { fileURLToPath } from 'url'

  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: fileURLToPath(new URL('../preload/index.mjs', import.meta.url)) // ✅
    }
  })
  ```

**Điều rất quan trọng là electron-vite tương thích với một số cú pháp CommonJS (gồm `require`, `require.resolve`, `__filename`, `__dirname`)**, nên bạn không cần sửa các cú pháp này khi chuyển đổi. Tuy vậy, chúng tôi vẫn khuyến nghị dùng cú pháp ESM cho project mới.

### Tương thích cú pháp ESM và CJS {#esm-and-cjs-syntax-compatibility}

electron-vite đã hỗ trợ tương thích giữa cú pháp ES module và CommonJS, cho phép bạn tự do chuyển đổi giữa hai cú pháp với rất ít công sức. Tuy nhiên, lưu ý rằng [Bảo vệ mã nguồn](./source-code-protection.md) hiện chỉ hỗ trợ CommonJS.
