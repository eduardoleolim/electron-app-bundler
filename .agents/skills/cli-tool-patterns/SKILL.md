# CLI Tool Patterns for Node.js

## Overview

This skill provides patterns and best practices for building CLI tools in Node.js, using electron-app-bundler as reference.

## When to Use

- Building CLI applications with Commander.js
- Creating developer tools that need configuration files
- Implementing build/dev server workflows

## Command Pattern

### Basic CLI Structure

```typescript
// src/app/index.mts - Entry point
import { CommandLine } from './commands/CommandLine.mjs';
import { ChalkLogger } from '../Context/shared/infrastructure/ChalkLogger.mjs';

const logger = new ChalkLogger(new Date());
const commandLine = new CommandLine(logger);
commandLine.parse(process.argv);
```

### Command Definition

```typescript
// src/app/commands/CommandLine.mts
export class CommandLine {
  constructor(private readonly logger: Logger) {
    this.program = new Command();
    this.loadCommands();
  }

  private loadCommands(): void {
    this.program
      .name('my-cli')
      .description('CLI description')
      .version(this.packageJson.version);

    const buildCmd = this.program.command('build');
    buildCmd.option('-c, --config <path>', 'Config file path')
      .action(async (options) => {
        // Implementation
      });
  }
}
```

## Configuration File Patterns

### Resolution Order

1. `--config` CLI option (highest priority)
2. `project.config.json`
3. `project.config.yaml`
4. Default fallback

```typescript
private prepareConfigPath(config: string | undefined): string {
  const defaults = [
    './electron-app-bundler.config.json',
    './electron-app-bundler.config.yaml',
    './electron-esbuild.config.json',
    './electron-esbuild.config.yaml'
  ];

  // Check CLI option first
  if (config) {
    const resolved = path.resolve(process.cwd(), config);
    if (fs.existsSync(resolved)) return resolved;
  }

  // Check defaults
  for (const defaultPath of defaults) {
    if (fs.existsSync(path.resolve(process.cwd(), defaultPath))) {
      return path.resolve(process.cwd(), defaultPath);
    }
  }
  throw new Error('Config file not found');
}
```

## Async Action Handlers

```typescript
.command('build')
  .action((options) => {
    // Wrap in async IIFE for proper error handling
    (async () => {
      try {
        await build(options);
      } catch (error) {
        if (error instanceof Error) {
          logger.error('CLI', error.message);
        }
        process.exit(1);
      }
    })();
  });
```

## Environment-Based Behavior

```typescript
// Set NODE_ENV based on command
.command('dev')
  .action(() => {
    process.env.NODE_ENV = 'development';
    // dev logic
  });

.command('build')
  .action(() => {
    process.env.NODE_ENV = 'production';
    // build logic
  });
```

## Best Practices

1. **Parse package.json** at runtime for version
2. **Use async/await** with try-catch in action handlers
3. **Resolve paths** relative to `process.cwd()`
4. **Support both JSON and YAML** config files
5. **Provide clear error messages** with logger
6. **Exit with proper codes** (0 success, 1 error)

## electron-app-bundler References

- Entry: `src/app/index.mts`
- CLI: `src/app/commands/CommandLine.mts`
- Logger: `src/Context/shared/infrastructure/ChalkLogger.mts`