# Clean Architecture for Node.js CLI Tools

## Overview

This skill provides guidance on implementing Clean Architecture in Node.js CLI tools and libraries, using electron-app-bundler as a reference implementation.

## When to Use

- Building CLI tools with complex domain logic
- Creating library packages with multiple concerns (config, building, logging)
- Needing testable, maintainable codebases

## Key Principles

### Layer Structure

```
Context/
├── application/   # Use cases (orchestration)
├── domain/        # Business rules, entities, interfaces
└── infrastructure/# External I/O, frameworks, services
```

### Dependency Rule

- **Domain** has zero dependencies on other layers
- **Application** depends only on Domain
- **Infrastructure** implements Domain interfaces

## electron-app-bundler Examples

### Domain Layer

```typescript
// src/Context/builder/domain/RendererProcessBuilderService.mts
export interface RendererProcessBuilderService {
  build(config: RendererConfig, outputDir: string): Promise<void>;
  dev(config: RendererConfig, port: number): Promise<void>;
}
```

### Application Layer

```typescript
// src/Context/builder/application/BuildApplication.mts
export class BuildApplication {
  constructor(
    private readonly rendererBuilder: RendererProcessBuilderService // interface
  ) {}

  async build(reader: ConfigReader): Promise<void> {
    const config = await reader.read();
    await this.rendererBuilder.build(config.renderer, config.output);
  }
}
```

### Infrastructure Layer

```typescript
// src/Context/builder/infrastructure/services/EsbuildRendererProcessBuilder.mts
export class EsbuildRendererProcessBuilder implements RendererProcessBuilderService {
  async build(config: RendererConfig, outputDir: string): Promise<void> {
    // esbuild-specific implementation
  }
}
```

## Benefits

1. **Testability**: Mock infrastructure, test domain logic in isolation
2. **Maintainability**: Clear boundaries between concerns
3. **Flexibility**: Swap implementations (e.g., esbuild → Vite → Astro)
4. **Extensibility**: Add new features without touching core logic

## Anti-Patterns to Avoid

- Business logic in infrastructure layer
- Direct file system calls in domain entities
- HTTP clients in application use cases
- Mixing layer responsibilities