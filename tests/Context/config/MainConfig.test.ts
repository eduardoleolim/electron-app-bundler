import { ConfigParser } from '../../../src/Context/config/domain/ConfigParser.mjs';

describe('MainConfig', () => {
  let parser: ConfigParser;

  beforeEach(() => {
    parser = new ConfigParser();
  });

  test('should create MainConfig with required fields', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.entryPoint).toBe('./main.ts');
    expect(main.args).toHaveLength(0);
    expect(main.output.directory).toBe('dist/main');
  });

  test('should store args', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      args: ['--arg1', '--arg2'],
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.args).toHaveLength(2);
    expect(main.args).toContain('--arg1');
    expect(main.args).toContain('--arg2');
  });

  test('should store empty args', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      args: [],
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.args).toHaveLength(0);
  });

  test('should store loader configs', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      loaders: [{ extension: '.png', loader: 'dataurl' }],
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.loaderConfigs).toHaveLength(1);
    expect(main.loaderConfigs[0].fileExtension).toBe('.png');
  });

  test('should store excluded libraries', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      exclude: ['electron', 'fs'],
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.excludedLibraries).toContain('electron');
    expect(main.excludedLibraries).toContain('fs');
  });

  test('should include built-in modules in excluded libraries', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.excludedLibraries).toContain('electron');
    expect(main.excludedLibraries).toContain('node:fs');
  });

  test('should accept baseConfigEntryPoint', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      base: './esbuild.config.js',
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.baseConfigEntryPoint).toBe('./esbuild.config.js');
  });

  test('should inherit output from base', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.output.directory).toBe('dist/main');
    expect(main.output.filename).toBe('main.js');
  });

  test('should combine custom excluded with built-in modules', () => {
    const main = parser.parseMainConfig({
      entry: './main.ts',
      exclude: ['custom-lib'],
      output: { directory: 'dist/main', filename: 'main.js' }
    });

    expect(main.excludedLibraries).toContain('custom-lib');
    expect(main.excludedLibraries).toContain('electron');
  });
});
