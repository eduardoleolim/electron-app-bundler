# AGENTS.md

**electron-app-bundler**: CLI tool to build Electron apps using esbuild (fast bundler). Supports multiple renderer builders (esbuild, Vite, Astro) with hot reload dev server.

## Commands
```bash
pnpm bundler:build   # rimraf dist && tsc (app package)
pnpm lint            # eslint --quiet --fix
pnpm bundler:test    # jest (app package)
```
**Example apps** use pnpm workspace (`workspace:*` protocol). Install all deps at root (`pnpm install`), then run with e.g. `pnpm basic-ts:dev`, `pnpm basic-ts:build`.

## Key Quirks
- **ESM-only** (`"type": "module"`). Source files use `.mts` extension (compiled to `.mjs`).
- **Jest custom resolver** (`jest-resolver.cjs`): maps `.mjs` imports -> `.mts` source files and `.cjs` -> `.cts`. Tests must exist in `tests/` directory (separate `tsconfig.test.json`).
- **Pre-commit hook** runs `lint-staged` on `*.{js,ts,mjs,mts}` only.
- **Config file resolution**: `electron-app-bundler.config.*` or `electron-esbuild.config.*`. Use `--config` option to override.

## Architecture

**Clean Architecture** - Each Context folder uses layered structure:
```
Context/
├── application/   # Use cases (BuildApplication, DevApplication)
├── domain/        # Entities, interfaces (RendererProcessBuilderService)
└── infrastructure/# External concerns (EsbuildRendererProcessBuilder, ConfigReaders)
```

```
src/
  app/          CLI entry (src/app/index.mjs -> dist/app/index.mjs)
  Context/
    config/     ConfigReader, ConfigParser, domain models
    builder/    Application classes, builder services
    shared/     Logger, utilities
tests/
  Context/      Mirrors src/ structure
```

## Build Pipeline
1. `pnpm lint` (or pre-commit hook)
2. `pnpm bundler:build` compiles `src/` -> `dist/` with `tsconfig.json`
3. `pnpm bundler:test` runs tests via `ts-jest` with `tsconfig.test.json`

## Misc
- Requires Node.js >=22.19.0, pnpm >=11.0.0
- Module resolution: `Node16`
- No separate typecheck command (tsc is part of `build`)
