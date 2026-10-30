---
outline: deep
---

# Xử lý asset {#asset-handling}

::: tip Ghi chú
Tính năng xử lý asset trong hướng dẫn này áp dụng cho main process. Với static asset của renderer process, xem hướng dẫn [Static Asset Handling](https://vitejs.dev/guide/assets.html) của Vite.
:::

## Thư mục public {#public-directory}

Thư mục public mặc định là `<root>/resources`, dành riêng cho main process và preload scripts. Có thể cấu hình qua tuỳ chọn `main.publicDir` và `preload.publicDir`.

Nếu bạn có các asset như `icons`, `executables`, `wasm files`, v.v., bạn có thể đặt chúng vào thư mục này.

Lưu ý rằng:

- Mọi asset trong thư mục public đều không được copy sang thư mục output. Vì vậy khi đóng gói app, cần đóng gói kèm thư mục public.
- Nên dùng hậu tố `?asset` để import asset trong thư mục public.

::: warning Lưu ý
Cách xử lý public asset trong renderer khác với main process và preload scripts.

- Mặc định, thư mục làm việc của renderer nằm ở `src/renderer`, nên thư mục public cần được tạo trong thư mục này. Thư mục public mặc định có tên `public`, cũng có thể chỉ định qua `renderer.publicDir`.
- Public asset của renderer sẽ được copy sang thư mục output.
:::

## Import asset dưới dạng đường dẫn file {#importing-asset-as-file-path}

Trong main process, asset có thể được import dưới dạng đường dẫn file bằng hậu tố `?asset`:

```js {2}
import { Tray, nativeImage } from 'electron'
import appIcon from '../../build/icon.ico?asset'

let tray = new Tray(nativeImage.createFromPath(appIcon))
```

Trong ví dụ này, `appIcon` sẽ được resolve thành:

```js
const path = require('path')
const appIcon = path.join(__dirname, './chunks/icon-4363016c.ico')
```

Và `build/icon.ico` sẽ được copy sang thư mục output (`out/main/chunks/icon-4363016c.ico`).

Nếu `appIcon` nằm trong `public directory`:

```js {2}
import { Tray, nativeImage } from 'electron'
import appIcon from '../../resources/icon.ico?asset'

let tray = new Tray(nativeImage.createFromPath(appIcon))
```

Khi đó `appIcon` sẽ được resolve thành:

```js
const path = require('path')
const appIcon = path.join(__dirname, '../../resources/icon.ico')
```

Và `resources/icon.ico` sẽ không được copy sang thư mục output.

### Import file JSON dưới dạng đường dẫn file {#importing-json-file-as-file-path}

Khi bạn import file json, plugin json của Vite sẽ resolve nó thành object json. Nhưng đôi khi ta muốn import nó dưới dạng đường dẫn file, khi đó có thể dùng hậu tố `?commonjs-external&asset` để import.

```js
import jsonFile from '../../resources/config.json?commonjs-external&asset'
```

### Vấn đề đường dẫn file `app.asar.unpacked` {#app-asar-unpacked-file-path-problem}

Do [giới hạn của ASAR](https://www.electronjs.org/docs/latest/tutorial/asar-archives#limitations-of-the-node-api), ta không thể đóng gói mọi file vào ASAR archive. Đôi khi điều này gây ra vấn đề vì đường dẫn tới file đã thay đổi, nhưng `path.join(__dirname, 'binary')` của bạn thì không. Để chạy được, bạn cần sửa lại đường dẫn: đổi `app.asar` trong đường dẫn thành `app.asar.unpacked`.

Bạn có thể dùng hậu tố `?asset&asarUnpack` để hỗ trợ việc này. Ví dụ:

```js
import bin from '../../resources/hello.exe?asset&asarUnpack'
```

Khi đó `bin` sẽ được resolve thành:

```js
const path = require('path')
const bin = path.join(__dirname, '../../resources/hello.exe').replace('app.asar', 'app.asar.unpacked')
```

## Import native node module {#importing-native-node-modules}

Có hai cách dùng module `*.node`.

1. import dưới dạng node module

```js
import addon from '../../resources/hello.node'

console.log(addon?.hello())
```

2. import dưới dạng đường dẫn file

```js
import addon from '../../resources/hello.node?asset'
import { createRequire } from 'module'
const require = createRequire(import.meta.url)

const native = require(addon)
console.log(native?.hello())
```

Cần lưu ý rằng native node module thường phải được import tuỳ theo `platform` và `arch`. Nếu bạn đảm bảo được node module được tạo đúng theo platform và arch, dùng cách import thứ nhất sẽ không có vấn đề gì. Nếu không, bạn có thể dùng cách thứ hai để import đúng node module theo platform và arch.

## Import WebAssembly {#importing-webassembly}

::: warning Ghi chú
Trong Vite, file `.wasm` có thể được xử lý qua hậu tố `?init`, cách này hỗ trợ trình duyệt nhưng không hỗ trợ Node.js (main process của Electron).
:::

Trong main process, file `.wasm` đã biên dịch sẵn có thể được import bằng `?loader`. Default export sẽ là một hàm khởi tạo trả về Promise của wasm instance:

```js
import loadWasm from '../../resources/add.wasm?loader'

loadWasm().then((instance) => {
  // Các hàm được export nằm trong instance.exports
  const add = instance.exports.add as (a: number, b: number) => number
  const sum = add(5, 6)
  console.log(sum); // Kết quả: 11
})
```

Hàm init cũng có thể nhận object `imports`, object này được truyền vào `WebAssembly.instantiate` làm tham số thứ hai:

```js
loadWasm({
  env: {
    memoryBase: 0,
    tableBase: 0,
    memory: new WebAssembly.Memory({
      initial: 256,
      maximum: 512
    }),
    table: new WebAssembly.Table({
      initial: 0,
      maximum: 0,
      element: 'anyfunc'
    })
  }
}).then(() => {
  /* ... */
})
```

Trong renderer, xem tính năng [WebAssembly](https://vitejs.dev/guide/features.html#webassembly) của Vite để biết thêm chi tiết.
