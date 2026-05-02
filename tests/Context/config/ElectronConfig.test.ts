import { ConfigParser, RendererBuilderType } from '../../../src/Context/config/domain/ConfigParser.mjs';

describe('ElectronConfig', () => {
  let parser: ConfigParser;

  beforeEach(() => {
    parser = new ConfigParser();
  });

  test('should create ElectronConfig with all required fields', () => {
    const electronConfig = parser.parseElectronConfig(
      {
        main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ]
      },
      RendererBuilderType.ESBUILD
    );

    expect(electronConfig.output).toBe('./dist');
    expect(electronConfig.mainConfig.entryPoint).toBe('./main.ts');
    expect(electronConfig.preloadConfigs).toHaveLength(0);
    expect(electronConfig.rendererConfigs).toHaveLength(1);
    expect(electronConfig.resourceConfigs).toHaveLength(0);
  });

  test('should handle empty preload configs', () => {
    const electronConfig = parser.parseElectronConfig(
      {
        main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ],
        preloads: []
      },
      RendererBuilderType.ESBUILD
    );

    expect(electronConfig.preloadConfigs).toHaveLength(0);
  });

  test('should handle empty renderer configs', () => {
    const electronConfig = parser.parseElectronConfig(
      {
        main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } },
        renderers: {
          entry: './renderer.ts',
          html: './index.html',
          devPort: 3000,
          output: { directory: 'dist/renderer', filename: 'renderer.js' }
        }
      },
      RendererBuilderType.ESBUILD
    );

    expect(electronConfig.rendererConfigs).toHaveLength(1);
  });

  test('should handle empty resource configs', () => {
    const electronConfig = parser.parseElectronConfig(
      {
        main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ],
        resources: []
      },
      RendererBuilderType.ESBUILD
    );

    expect(electronConfig.resourceConfigs).toHaveLength(0);
  });

  test('should store multiple preload configs', () => {
    const electronConfig = parser.parseElectronConfig(
      {
        main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ],
        preloads: [
          { entry: './preload1.ts', output: { directory: 'dist/preload1', filename: 'preload1.js' }, renderers: [] },
          { entry: './preload2.ts', output: { directory: 'dist/preload2', filename: 'preload2.js' }, renderers: [] }
        ]
      },
      RendererBuilderType.ESBUILD
    );

    expect(electronConfig.preloadConfigs).toHaveLength(2);
  });

  test('should store multiple renderer configs as array', () => {
    const electronConfig = parser.parseElectronConfig(
      {
        main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } },
        renderers: [
          {
            entry: './renderer1.ts',
            html: './index1.html',
            devPort: 3000,
            output: { directory: 'dist/renderer1', filename: 'renderer1.js' }
          },
          {
            entry: './renderer2.ts',
            html: './index2.html',
            devPort: 3001,
            output: { directory: 'dist/renderer2', filename: 'renderer2.js' }
          }
        ]
      },
      RendererBuilderType.ESBUILD
    );

    expect(electronConfig.rendererConfigs).toHaveLength(2);
  });

  test('should use custom output directory', () => {
    const electronConfig = parser.parseElectronConfig(
      {
        output: 'custom-output',
        main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ]
      },
      RendererBuilderType.ESBUILD
    );

    expect(electronConfig.output).toBe('custom-output');
  });
});
