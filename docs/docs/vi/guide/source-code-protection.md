---
outline: deep
---

# Bảo vệ mã nguồn {#source-code-protection}

## Tổng quan {#overview}

Ứng dụng Electron dùng JavaScript để xây dựng phần mềm desktop, nên dễ bị **dịch ngược (reverse engineering)**, **can thiệp sửa đổi mã (code tampering)** và **phân phối lại trái phép**.

Tài liệu này trình bày một cách bảo vệ hiệu quả: kết hợp **V8 bytecode** với cơ chế kiểm tra **ASAR integrity** để bảo vệ chắc chắn cho ứng dụng Electron trong môi trường production.

::: warning Ghi chú
Không có cơ chế bảo vệ phía client nào là tuyệt đối. Cách này nâng đáng kể rào cản đối với kẻ tấn công, nhưng nên được kết hợp với các biện pháp bảo mật ở mức kiến trúc và kiểm tra phía server để bảo vệ toàn diện.
:::

## Giải pháp: V8 Bytecode + ASAR Integrity {#solution-v8-bytecode-asar-integrity}

### ASAR Integrity {#asar-integrity}

[ASAR integrity](https://www.electronjs.org/docs/latest/tutorial/asar-integrity) là tính năng bảo mật kiểm tra nội dung các archive ASAR của ứng dụng lúc runtime, so với hash được tạo lúc build, để phát hiện mọi sự can thiệp. Nếu không có hash hoặc hash không khớp, ứng dụng sẽ bị buộc dừng.

**Đặc điểm bảo vệ**:

- Phát hiện và ngăn chặn việc sửa đổi file
- Chặn việc đóng gói lại trái phép

Xem [tài liệu ASAR integrity](https://www.electronjs.org/docs/latest/tutorial/asar-integrity) để biết đầy đủ cách tính năng này hoạt động và cách dùng trong ứng dụng của bạn.

::: tip Ghi chú
Yêu cầu **Electron** phiên bản 16+ trên MacOS và 30+ trên Windows.
:::

Ví dụ, bật kiểm tra ASAR integrity với `electron-builder` :

```yaml [electron-builder.yaml]
build:
  appId: your.id
  # ... các cấu hình khác
  electronFuses:
    # Bật kiểm tra ASAR integrity
    enableEmbeddedAsarIntegrityValidation: true
    # (Không bắt buộc, nhưng nên dùng) Đảm bảo Electron chỉ nạp code ứng dụng từ app.asar
    onlyLoadAppFromAsar: true
```

### V8 Bytecode {#v8-bytecode}

Module `vm` trong thư viện chuẩn của Node.js có thể tạo V8 bytecode cache từ mã nguồn JavaScript. Ban đầu được thiết kế để tối ưu hiệu năng, nhưng bytecode cache này có thể được phân phối và thông dịch lúc runtime, nhờ đó che giấu hiệu quả mã nguồn gốc.

**Đặc điểm bảo vệ**:

- Rất khó dịch ngược
- Giữ nguyên hiệu năng native
- Không cần dependency bên ngoài
- Tương thích với runtime của Electron

**Hạn chế**:

- **Async arrow function** - Có thể gây crash lúc runtime
- **String literal** - Các chuỗi nhạy cảm (khoá mã hoá, token, thông tin xác thực) vẫn đọc được trong bytecode

electron-vite có sẵn giải pháp cho các hạn chế này.

## Triển khai với electron-vite {#implementation-with-electron-vite}

electron-vite lấy cảm hứng từ [bytenode](https://github.com/bytenode/bytenode). Phần triển khai gồm:

- **Plugin biên dịch bytecode** - Phân tích các bundle và xác định chunk nào cần biên dịch thành bytecode cache

- **Biên dịch bằng Electron** - Khởi chạy một process Electron để biên dịch bundle thành các file `.jsc`, đảm bảo bytecode tương thích với môi trường Node của Electron

- **Bytecode loader** - Sinh ra một loader lúc runtime giúp ứng dụng Electron nạp được bytecode cache

**Bảo vệ nâng cao:**

- Khắc phục vấn đề tương thích của async arrow function
- Làm rối (obfuscate) string literal để bảo vệ dữ liệu nhạy cảm

::: warning Lưu ý
`Function.prototype.toString` không được hỗ trợ, vì mã nguồn không được phân phối kèm bytecode, nên không lấy được mã nguồn của function.
:::

## Bật bytecode {#enabling-bytecode}

Dùng tuỳ chọn `build.bytecode` để bật tính năng bytecode:

```js [electron.vite.config.ts]
import { defineConfig } from 'bm-electron-vite'

export default defineConfig({
  main: {
    build: {
      bytecode: true
    }
  },
  preload: {
    build: {
      bytecode: true
    }
  },
  renderer: {
    // ...
  }
})
```

::: warning Ghi chú
Trước `electron-vite 5`, bạn phải dùng `bytecodePlugin` để bật tính năng này.
:::

::: tip Ghi chú
`Bytecode` chỉ hoạt động trong production và chỉ hỗ trợ main process và preload script.

Lưu ý rằng preload script phải tắt `sandbox` để hỗ trợ bytecode, vì bytecode dựa vào module `vm` của Node.js. Từ Electron 20, renderer mặc định chạy trong sandbox, nên bạn cần đặt `sandbox: false` khi dùng bytecode cho preload script.
:::

## Tuỳ chọn {#options}

Tuỳ chọn `build.bytecode` cũng nhận một object `BytecodeOptions` để tuỳ chỉnh việc bảo vệ.

### bytecode.chunkAlias {#bytecode-chunkalias}

- Kiểu: `string | string[]`

Đặt alias cho chunk để chỉ định những bundle nào bytecode compiler sẽ xử lý. Thường dùng cùng tuỳ chọn `build.rollupOptions.output.manualChunks`.

Ví dụ, chỉ bảo vệ `src/main/foo.ts`:

```txt {5}
.
├──src
│  ├──main
│  │  ├──index.ts
│  │  ├──foo.ts
│  │  └──...
└──...
```

Bạn có thể sửa file cấu hình như sau:

```js [electron.vite.config.ts] {16}
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
      },
      build: {
        bytecode: { chunkAlias: 'foo' }
      }
    }
  },
  // ...
})
```

### bytecode.transformArrowFunctions {#bytecode-transformarrowfunctions}

- Kiểu: `boolean`
- Mặc định: `true`

Đặt `false` để tắt việc chuyển arrow function thành function thường.

::: tip Ghi chú
Việc chuyển đổi arrow function được thực hiện bằng [Babel](https://babeljs.io/docs/babel-plugin-transform-arrow-functions). Tắt tuỳ chọn này có thể gây crash lúc runtime.
:::

### bytecode.removeBundleJS {#bytecode-removebundlejs}

- Kiểu: `boolean`
- Mặc định: `true`

Đặt `false` để giữ lại các file bundle đã được biên dịch thành file bytecode.

### bytecode.protectedStrings {#bytecode-protectedstrings}

- Kiểu: `string[]`

Chỉ định những chuỗi nào trong mã nguồn (ví dụ `encryption keys`, `tokens`, `credentials`) cần được bảo vệ.

::: tip Ghi chú
electron-vite nhận diện các chuỗi được chỉ định và chuyển chúng thành hàm IIFE dùng [String.fromCharCode](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/fromCharCode). Sau khi biên dịch sang bytecode, các chuỗi này bị làm rối và không đọc được. Hỗ trợ cả `String Literals` và `Template Literals (pure static only)`.

```js
// chuỗi trong mã nguồn
const encryptKey = 'ABC'

// electron-vite chuyển chuỗi thành một hàm IIFE
const encryptKey = (function () {})([65, 66, 67])
```
:::

::: details Template literal thuần tĩnh là gì
```js
// ✅
const foo = `-----BEGIN CERTIFICATE-----
MIIDkTCCAnmgAw...
`
// ❌
const zoo = `ABC ${x}`
```
:::

Ví dụ:

```js [electron.vite.config.ts] {13}
import { defineConfig } from 'bm-electron-vite'

const protectedStrings = [
  'foo',
  `-----BEGIN CERTIFICATE-----
MIIDkTCCAnmgAwIBAgIUQt726ICGVvNVXHfzwCSwCR4
BQAwcDELMAkGA1UEBhMCQ04xDzANBgNVBAgMBll1bm5.......`
]

export default defineConfig({
  main: {
    build: {
      bytecode: { protectedStrings }
    }
  },
  // ...
})
```

::: warning Lưu ý
Bạn không nên liệt kê mọi chuỗi trong mã nguồn để bảo vệ, thường chỉ cần bảo vệ các chuỗi nhạy cảm.
:::

## Hạn chế khi build {#limitations-of-build}

::: tip Ghi chú
Đừng kỳ vọng có thể build ứng dụng cho mọi nền tảng trên cùng một nền tảng.
:::

Ứng dụng Electron của chúng ta được phân phối kèm các `bytecode caches` đã biên dịch sẵn. Dù bản thân V8 bytecode là `architecture-agnostic`, các cache này bị gắn với `V8 (Node.js) versions` và `CPU architectures (such as x64 or ARM64)` cụ thể do metadata tối ưu hoá (ví dụ Inline Caches, Feedback Vectors và Endianness). **Vì vậy không thể dùng lại chúng giữa các bản build Electron nhắm tới kiến trúc khác nhau**.

Hơn nữa, dù bytecode cache cho cùng một kiến trúc trên các hệ điều hành khác nhau (như Windows x64 và macOS x64) về lý thuyết có vẻ tương thích, các cơ chế kiểm tra bổ sung bên trong V8 thường khiến **việc phân phối đa nền tảng không đáng tin cậy, nên trên thực tế không được khuyến nghị**.

Trong một số trường hợp, có thể tạo bytecode cache cho kiến trúc khác trên cùng nền tảng, miễn là bản build Electron cho kiến trúc đích chạy được trên hệ thống hiện tại. Ví dụ, vì binary Electron x64 chạy được trên máy macOS ARM64, bạn có thể tạo bytecode cache cho x64 ngay trong môi trường ARM64.

Để làm vậy, bạn có thể chỉ định một file cấu hình khác và đặt biến môi trường `ELECTRON_EXEC_PATH` thành đường dẫn tới file thực thi của ứng dụng Electron x64. Bytecode compiler sẽ biên dịch bằng ứng dụng Electron được chỉ định.

```js [electron.vite.config.x64.ts] {5}
import { defineConfig } from 'bm-electron-vite'

export default defineConfig(() => {
  process.env.ELECTRON_EXEC_PATH = '/path/to/electron-x64/Electron.app/Contents/MacOS/Electron'

  return {
    // ...
  }
})
```

::: details Cách cài Electron cho kiến trúc khác
Bạn có thể dùng flag `--arch` với npm install để cài Electron cho kiến trúc khác.

```sh
npm install --arch=ia32 electron
```
:::

Tuy nhiên, cách trên chỉ cho phép build ứng dụng Electron cho một kiến trúc mỗi lần. Nếu cần tạo bản build cho nhiều kiến trúc trong một lần build, bạn có thể tận dụng hook của công cụ build, như `beforeBuild` trong `electron-builder`, để thay đổi `ELECTRON_EXEC_PATH` động và gọi lệnh `electron-vite build` cho từng kiến trúc đích.

```js [beforeBuild.js]
const { execSync } = require('child_process')
const os = require('os')

module.exports = {
  async beforeBuild(context) {
    const targetArch = context.arch // Kiến trúc đích
    const hostArch = os.arch() // Kiến trúc của máy hiện tại

    // Chỉ đổi ELECTRON_EXEC_PATH nếu kiến trúc đích khác máy host
    if (targetArch !== hostArch) {
      process.env.ELECTRON_EXEC_PATH = `/path/to/electron-${targetArch}/Electron.app/Contents/MacOS/Electron`
    }

    // Chạy electron-vite build qua npm
    execSync('npm run electron-vite build', { stdio: 'inherit' })
  }
}
```
