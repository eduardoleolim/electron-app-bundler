import { ConfigParser, RendererBuilderType } from '../../../src/context/config/domain/ConfigParser.mjs';
import { OutputConfig } from '../../../src/context/config/domain/OutputConfig.mjs';

describe('RendererConfig', () => {
  let parser: ConfigParser;

  beforeEach(() => {
    parser = new ConfigParser();
  });

  test('should create RendererConfig with required fields', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 3000,
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.ESBUILD
    );

    expect(renderer.htmlEntryPoint).toBe('./index.html');
    expect(renderer.entryPoint).toBe('./renderer.ts');
    expect(renderer.output.directory).toBe('dist/renderer');
  });

  test('should use default devPort when zero', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 0,
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.ESBUILD
    );

    expect(renderer.devPort).toBe(0);
  });

  test('should store loader configs', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 3000,
        loaders: [{ extension: '.png', loader: 'dataurl' }],
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.ESBUILD
    );

    expect(renderer.loaderConfigs).toHaveLength(1);
    expect(renderer.loaderConfigs[0].fileExtension).toBe('.png');
  });

  test('should store excluded libraries', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 3000,
        exclude: ['react', 'react-dom'],
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.ESBUILD
    );

    expect(renderer.excludedLibraries).toContain('react');
    expect(renderer.excludedLibraries).toContain('react-dom');
  });

  test('should include built-in modules in excluded libraries', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 3000,
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.ESBUILD
    );

    expect(renderer.excludedLibraries).toContain('electron');
    expect(renderer.excludedLibraries).toContain('node:fs');
  });

  test('should accept baseConfigEntryPoint', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 3000,
        base: './esbuild.config.js',
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.ESBUILD
    );

    expect(renderer.baseConfigEntryPoint).toBe('./esbuild.config.js');
  });

  test('should use custom devPort', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 8080,
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.ESBUILD
    );

    expect(renderer.devPort).toBe(8080);
  });

  test('should use html as entry for vite', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 3000,
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.VITE
    );

    expect(renderer.entryPoint).toBe('./index.html');
  });

  test('should inherit output from default', () => {
    const renderer = parser.parseRendererConfig(
      {
        entry: './renderer.ts',
        html: './index.html',
        devPort: 3000,
        output: { directory: 'dist/renderer', filename: 'renderer.js' }
      },
      new OutputConfig('dist', 'main.js'),
      RendererBuilderType.ESBUILD
    );

    expect(renderer.output.directory).toBe('dist/renderer');
    expect(renderer.output.filename).toBe('renderer.js');
  });
});
