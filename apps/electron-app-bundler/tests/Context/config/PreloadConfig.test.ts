import { ConfigParser } from '../../../src/Context/config/domain/ConfigParser.mjs';
import { OutputConfig } from '../../../src/Context/config/domain/OutputConfig.mjs';

describe('PreloadConfig', () => {
  let parser: ConfigParser;

  beforeEach(() => {
    parser = new ConfigParser();
  });

  test('should create PreloadConfig with required fields', () => {
    const preload = parser.parsePreloadConfig(
      { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [] },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.entryPoint).toBe('./preload.ts');
    expect(preload.output.directory).toBe('dist/preload');
  });

  test('should store renderer processes indices', () => {
    const preload = parser.parsePreloadConfig(
      { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [0, 1] },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.rendererProcesses).toHaveLength(2);
    expect(preload.rendererProcesses).toContain(0);
    expect(preload.rendererProcesses).toContain(1);
  });

  test('should handle empty renderer processes', () => {
    const preload = parser.parsePreloadConfig(
      { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [] },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.rendererProcesses).toHaveLength(0);
  });

  test('should store loader configs', () => {
    const preload = parser.parsePreloadConfig(
      {
        entry: './preload.ts',
        loaders: [{ extension: '.png', loader: 'dataurl' }],
        output: { directory: 'dist/preload', filename: 'preload.js' },
        renderers: []
      },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.loaderConfigs).toHaveLength(1);
  });

  test('should store excluded libraries', () => {
    const preload = parser.parsePreloadConfig(
      {
        entry: './preload.ts',
        exclude: ['electron', 'contextBridge'],
        output: { directory: 'dist/preload', filename: 'preload.js' },
        renderers: []
      },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.excludedLibraries).toContain('electron');
    expect(preload.excludedLibraries).toContain('contextBridge');
  });

  test('should include built-in modules in excluded libraries', () => {
    const preload = parser.parsePreloadConfig(
      { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [] },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.excludedLibraries).toContain('electron');
    expect(preload.excludedLibraries).toContain('node:fs');
  });

  test('should accept baseConfigEntryPoint', () => {
    const preload = parser.parsePreloadConfig(
      {
        entry: './preload.ts',
        base: './esbuild.config.js',
        output: { directory: 'dist/preload', filename: 'preload.js' },
        renderers: []
      },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.baseConfigEntryPoint).toBe('./esbuild.config.js');
  });

  test('should inherit output from default', () => {
    const preload = parser.parsePreloadConfig(
      { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [] },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.output.directory).toBe('dist/preload');
    expect(preload.output.filename).toBe('preload.js');
  });

  test('should link to specific renderer process by index', () => {
    const preload = parser.parsePreloadConfig(
      { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [0] },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.rendererProcesses[0]).toBe(0);
  });

  test('should link to multiple renderer processes', () => {
    const preload = parser.parsePreloadConfig(
      { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [0, 1, 2] },
      new OutputConfig('dist', 'main.js')
    );

    expect(preload.rendererProcesses).toEqual([0, 1, 2]);
  });
});
