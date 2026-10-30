# Hướng dẫn đóng góp

[English](./CONTRIBUTING.md) | **Tiếng Việt**

Cảm ơn bạn đã quan tâm đóng góp cho dự án!

## Cài đặt repo

Clone repo về máy và cài dependencies.

```bash
pnpm install
```

**LƯU Ý**: Bắt buộc dùng pnpm để cài và link dependencies.

## Pull Request

- Tạo một nhánh riêng từ nhánh gốc (ví dụ `fix-bug`), và tạo PR merge ngược lại vào nhánh gốc đó.
- Có thể tạo nhiều commit nhỏ trong lúc làm PR, GitHub có thể tự gộp (squash) chúng khi merge.
- Để kiểm tra code đúng style của dự án, hãy đảm bảo `pnpm lint` và `pnpm typecheck` chạy thành công. Để build dự án, chạy `pnpm build`.
- Nếu bạn sửa phần biên dịch bytecode, `src/electron.ts` hoặc cấu hình build, hãy chạy thêm `pnpm build && pnpm test:bytecode`. Lệnh này build và chạy một app Electron nhỏ có bật bytecode (lệnh sẽ tải Electron về; đặt biến `ELECTRON_VERSION` để chọn phiên bản cụ thể).
- Commit message phải theo [quy ước commit](./.github/commit-convention.md). Commit message được tự động kiểm tra trước khi commit (qua [Git Hooks](https://git-scm.com/docs/githooks) bằng [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)).
- Nên viết commit message bằng tiếng Anh.
- Không cần lo về code style nếu đã cài dev dependencies: các file thay đổi sẽ được tự động format bằng [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) khi commit (qua [Git Hooks](https://git-scm.com/docs/githooks) bằng [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)).
