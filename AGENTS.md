# AGENTS.md

**electron-app-bundler**: CLI tool to build Electron apps using esbuild (fast bundler). Supports multiple renderer builders (esbuild, Vite, Astro) with hot reload dev server.

## Commands
```bash
npm run build   # rimraf dist && tsc
npm run lint    # eslint --quiet --fix
npm run test    # jest
```
**Example apps** use isolated npm runs: `npm run basic-ts:install`, `npm run basic-ts:dev`, `npm run basic-ts:build`, etc.

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
1. `npm run lint` (or pre-commit hook)
2. `npm run build` compiles `src/` -> `dist/` with `tsconfig.json`
3. `npm run test` runs tests via `ts-jest` with `tsconfig.test.json`

## Misc
- Requires Node.js >=20
- Module resolution: `Node16`
- No separate typecheck command (tsc is part of `build`)
