import { ConfigParser, RendererBuilderType } from '../../../src/context/config/domain/ConfigParser.mjs';
import { OutputConfig } from '../../../src/context/config/domain/OutputConfig.mjs';
import { InMemoryConfigReader } from './InMemoryConfigReader';

describe('ConfigParser', () => {
  let parser: ConfigParser;

  beforeEach(() => {
    parser = new ConfigParser();
  });

  describe('parseOutputConfig', () => {
    test('should parse valid output config', () => {
      const output = parser.parseOutputConfig({ directory: 'dist', filename: 'main.js' });
      expect(output.directory).toBe('dist');
      expect(output.filename).toBe('main.js');
    });

    test('should throw error for invalid output config', () => {
      expect(() => parser.parseOutputConfig(null)).toThrow('Output config is required');
    });

    test('should throw error for missing directory', () => {
      expect(() => parser.parseOutputConfig({ filename: 'main.js' })).toThrow('Output directory must be a string');
    });

    test('should throw error for missing filename', () => {
      expect(() => parser.parseOutputConfig({ directory: 'dist' })).toThrow('Output file name must be a string');
    });
  });

  describe('parseLoaderConfig', () => {
    test('should parse valid loader config', () => {
      const loader = parser.parseLoaderConfig({ extension: '.png', loader: 'dataurl' });
      expect(loader.fileExtension).toBe('.png');
      expect(loader.loaderName).toBe('dataurl');
    });

    test('should throw error for invalid loader config', () => {
      expect(() => parser.parseLoaderConfig(null)).toThrow('Loader config is required');
    });

    test('should throw error for missing extension', () => {
      expect(() => parser.parseLoaderConfig({ loader: 'dataurl' })).toThrow('Loader extension must be a string');
    });

    test('should throw error for missing loader', () => {
      expect(() => parser.parseLoaderConfig({ extension: '.png' })).toThrow('Loader loader must be a string');
    });
  });

  describe('parseMainConfig', () => {
    test('should parse valid main config', () => {
      const main = parser.parseMainConfig({
        entry: './main.ts',
        output: { directory: 'dist/main', filename: 'main.js' }
      });
      expect(main.entryPoint).toBe('./main.ts');
      expect(main.output.directory).toBe('dist/main');
    });

    test('should throw error for null config', () => {
      expect(() => parser.parseMainConfig(null)).toThrow('Main config is required');
    });

    test('should throw error for missing entry', () => {
      expect(() => parser.parseMainConfig({ output: { directory: 'dist', filename: 'main.js' } })).toThrow(
        'Main entry point must be a string'
      );
    });

    test('should parse args', () => {
      const main = parser.parseMainConfig({
        entry: './main.ts',
        args: ['--arg1', '--arg2'],
        output: { directory: 'dist/main', filename: 'main.js' }
      });
      expect(main.args).toContain('--arg1');
    });
  });

  describe('parseRendererConfig', () => {
    test('should parse valid renderer config with esbuild', () => {
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
      expect(renderer.entryPoint).toBe('./renderer.ts');
      expect(renderer.htmlEntryPoint).toBe('./index.html');
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

    test('should use entry as html for astro', () => {
      const renderer = parser.parseRendererConfig(
        {
          entry: './src/pages',
          html: './index.html',
          devPort: 3000,
          output: { directory: 'dist/renderer', filename: 'renderer.js' }
        },
        new OutputConfig('dist', 'main.js'),
        RendererBuilderType.ASTRO
      );
      expect(renderer.htmlEntryPoint).toBe('./src/pages');
    });

    test('should throw error for null config', () => {
      expect(() =>
        parser.parseRendererConfig(null, new OutputConfig('dist', 'main.js'), RendererBuilderType.ESBUILD)
      ).toThrow('Renderer config is required');
    });

    test('should throw error for missing entry', () => {
      expect(() =>
        parser.parseRendererConfig(
          { html: './index.html', devPort: 3000, output: { directory: 'dist', filename: 'main.js' } },
          new OutputConfig('dist', 'main.js'),
          RendererBuilderType.ESBUILD
        )
      ).toThrow('Renderer entry point must be a string');
    });

    test('should throw error for missing html', () => {
      expect(() =>
        parser.parseRendererConfig(
          { entry: './renderer.ts', devPort: 3000, output: { directory: 'dist', filename: 'main.js' } },
          new OutputConfig('dist', 'main.js'),
          RendererBuilderType.ESBUILD
        )
      ).toThrow('Renderer entry html must be a string');
    });

    test('should throw error for missing devPort', () => {
      expect(() =>
        parser.parseRendererConfig(
          { entry: './renderer.ts', html: './index.html', output: { directory: 'dist', filename: 'main.js' } },
          new OutputConfig('dist', 'main.js'),
          RendererBuilderType.ESBUILD
        )
      ).toThrow('Renderer dev port must be a number');
    });
  });

  describe('parsePreloadConfig', () => {
    test('should parse valid preload config', () => {
      const preload = parser.parsePreloadConfig(
        { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [] },
        new OutputConfig('dist', 'main.js')
      );
      expect(preload.entryPoint).toBe('./preload.ts');
    });

    test('should throw error for null config', () => {
      expect(() => parser.parsePreloadConfig(null, new OutputConfig('dist', 'main.js'))).toThrow(
        'Preload config is required'
      );
    });

    test('should throw error for missing entry', () => {
      expect(() =>
        parser.parsePreloadConfig(
          { output: { directory: 'dist', filename: 'preload.js' }, renderers: [] },
          new OutputConfig('dist', 'main.js')
        )
      ).toThrow('Preload entry must be a string');
    });

    test('should parse renderer processes', () => {
      const preload = parser.parsePreloadConfig(
        { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [0, 1] },
        new OutputConfig('dist', 'main.js')
      );
      expect(preload.rendererProcesses).toEqual([0, 1]);
    });
  });

  describe('parseResourceConfig', () => {
    test('should parse simple resource config', () => {
      const resource = parser.parseResourceConfig('./assets', 'dist');
      expect(resource.from).toBe('./assets');
    });

    test('should parse object resource config', () => {
      const resource = parser.parseResourceConfig({ from: './assets', to: 'assets' }, 'dist');
      expect(resource.from).toBe('./assets');
    });

    test('should parse object resource config with output', () => {
      const resource = parser.parseResourceConfig(
        { from: './assets', to: { directory: 'dist/assets', filename: 'asset.js' } },
        'dist'
      );
      expect(resource.from).toBe('./assets');
    });

    test('should throw error for invalid resource', () => {
      expect(() => parser.parseResourceConfig(null, 'dist')).toThrow('Resource config is required');
    });

    test('should throw error for missing from', () => {
      expect(() => parser.parseResourceConfig({ to: 'assets' }, 'dist')).toThrow(
        'Resource from is required and must be a string'
      );
    });
  });

  describe('parseElectronConfig', () => {
    test('should parse valid electron config', () => {
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
      expect(electronConfig.mainConfig.entryPoint).toBe('./main.ts');
    });

    test('should use default output', () => {
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
    });

    test('should throw error for null config', () => {
      expect(() => parser.parseElectronConfig(null, RendererBuilderType.ESBUILD)).toThrow('Config is required');
    });

    test('should throw error for missing main config', () => {
      expect(() =>
        parser.parseElectronConfig(
          {
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
        )
      ).toThrow('Main config is required');
    });

    test('should throw error for missing renderer config', () => {
      expect(() =>
        parser.parseElectronConfig(
          { main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } } },
          RendererBuilderType.ESBUILD
        )
      ).toThrow('Renderer config is required');
    });

    test('should parse preload as single object', () => {
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
          preloads: {
            entry: './preload.ts',
            output: { directory: 'dist/preload', filename: 'preload.js' },
            renderers: []
          }
        },
        RendererBuilderType.ESBUILD
      );
      expect(electronConfig.preloadConfigs).toHaveLength(1);
    });

    test('should parse preload as array', () => {
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
            { entry: './preload.ts', output: { directory: 'dist/preload', filename: 'preload.js' }, renderers: [] }
          ]
        },
        RendererBuilderType.ESBUILD
      );
      expect(electronConfig.preloadConfigs).toHaveLength(1);
    });

    test('should parse resources as single string', () => {
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
          resources: './assets'
        },
        RendererBuilderType.ESBUILD
      );
      expect(electronConfig.resourceConfigs).toHaveLength(1);
    });

    test('should parse resources as array', () => {
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
          resources: ['./assets', './config.json']
        },
        RendererBuilderType.ESBUILD
      );
      expect(electronConfig.resourceConfigs).toHaveLength(2);
    });
  });

  describe('parse with reader', () => {
    test('should parse single config', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        main: { entry: './main.ts', output: { directory: 'dist/main', filename: 'main.js' } },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ]
      });
      const configs = parser.parse(reader, RendererBuilderType.ESBUILD);
      expect(configs).toHaveLength(1);
      expect(configs[0].mainConfig.entryPoint).toBe('./main.ts');
    });

    test('should parse array of configs', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig([
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
        {
          main: { entry: './main2.ts', output: { directory: 'dist2/main', filename: 'main.js' } },
          renderers: [
            {
              entry: './renderer2.ts',
              html: './index2.html',
              devPort: 3001,
              output: { directory: 'dist2/renderer', filename: 'renderer.js' }
            }
          ]
        }
      ]);
      const configs = parser.parse(reader, RendererBuilderType.ESBUILD);
      expect(configs).toHaveLength(2);
    });

    test('should throw error for invalid config file', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig(null);
      expect(() => parser.parse(reader, RendererBuilderType.ESBUILD)).toThrow('Invalid config file');
    });
  });
});
