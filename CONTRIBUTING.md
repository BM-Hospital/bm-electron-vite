# Contributing

**English** | [Tiếng Việt](./CONTRIBUTING.vi.md)

Thanks for being interested in contributing to this project!

## Repo Setup

Clone this repo to your local machine and install the dependencies.

```bash
pnpm install
```

**NOTE**: The package manager used to install and link dependencies must be pnpm.

## Pull Request

- Checkout a topic branch from a base branch, e.g. fix-bug, and merge back against that branch.
- It's OK to have multiple small commits as you work on the PR - GitHub can automatically squash them before merging.
- To check that your contributions match the project coding style make sure `pnpm lint` && `pnpm typecheck` passes. To build project run: `pnpm build`.
- If you change bytecode compilation, `src/electron.ts` or the build config, also run `pnpm build && pnpm test:bytecode`. It builds and runs a small Electron app with bytecode enabled (it downloads Electron; set `ELECTRON_VERSION` to pin a version).
- Commit messages must follow the [commit message convention](./.github/commit-convention.md). Commit messages are automatically validated before commit (by invoking [Git Hooks](https://git-scm.com/docs/githooks) via [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)).
- Commit messages preferably in English.
- No need to worry about code style as long as you have installed the dev dependencies - modified files are automatically formatted with [Oxfmt](https://oxc.rs/docs/guide/usage/formatter) on commit (by invoking [Git Hooks](https://git-scm.com/docs/githooks) via [simple-git-hooks](https://github.com/toplenboren/simple-git-hooks)).
