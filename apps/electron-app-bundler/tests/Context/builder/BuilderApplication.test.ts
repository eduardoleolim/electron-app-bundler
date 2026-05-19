import { ConfigParser, RendererBuilderType } from '../../../src/Context/config/domain/ConfigParser.mjs';
import type { ConfigReader } from '../../../src/Context/config/domain/ConfigReader.mjs';
import { InMemoryConfigReader } from '../../../tests/Context/config/InMemoryConfigReader';

describe('BuilderApplication Integration', () => {
  let parser: ConfigParser;

  beforeEach(() => {
    parser = new ConfigParser();
  });

  describe('BuildApplication flow via ConfigParser', () => {
    test('should parse build config with main, preload, renderer', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        main: {
          entry: './main.ts',
          output: { directory: 'dist/main', filename: 'main.js' }
        },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ],
        preloads: [
          {
            entry: './preload.ts',
            output: { directory: 'dist/preload', filename: 'preload.js' },
            renderers: [0]
          }
        ]
      });

      const configs = parser.parse(reader as ConfigReader, RendererBuilderType.ESBUILD);

      expect(configs).toHaveLength(1);
      expect(configs[0].mainConfig.entryPoint).toBe('./main.ts');
      expect(configs[0].rendererConfigs).toHaveLength(1);
      expect(configs[0].preloadConfigs).toHaveLength(1);
    });

    test('should parse build config with multiple renderers', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        main: {
          entry: './main.ts',
          output: { directory: 'dist/main', filename: 'main.js' }
        },
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
      });

      const configs = parser.parse(reader as ConfigReader, RendererBuilderType.ESBUILD);

      expect(configs[0].rendererConfigs).toHaveLength(2);
    });

    test('should parse build config with resources', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        main: {
          entry: './main.ts',
          output: { directory: 'dist/main', filename: 'main.js' }
        },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ],
        resources: ['./assets', './config.json']
      });

      const configs = parser.parse(reader as ConfigReader, RendererBuilderType.ESBUILD);

      expect(configs[0].resourceConfigs).toHaveLength(2);
    });

    test('should use VITE renderer type', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        main: {
          entry: './main.ts',
          output: { directory: 'dist/main', filename: 'main.js' }
        },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ]
      });

      const configs = parser.parse(reader as ConfigReader, RendererBuilderType.VITE);

      expect(configs[0].rendererConfigs[0].entryPoint).toBe('./index.html');
    });

    test('should use ASTRO renderer type', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        main: {
          entry: './main.ts',
          output: { directory: 'dist/main', filename: 'main.js' }
        },
        renderers: [
          {
            entry: './src/pages',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ]
      });

      const configs = parser.parse(reader as ConfigReader, RendererBuilderType.ASTRO);

      expect(configs[0].rendererConfigs[0].htmlEntryPoint).toBe('./src/pages');
    });

    test('should parse with main args', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        main: {
          entry: './main.ts',
          args: ['--arg1', '--arg2'],
          output: { directory: 'dist/main', filename: 'main.js' }
        },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ]
      });

      const configs = parser.parse(reader as ConfigReader, RendererBuilderType.ESBUILD);

      expect(configs[0].mainConfig.args).toContain('--arg1');
    });

    test('should parse with main excluded libraries', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        main: {
          entry: './main.ts',
          exclude: ['electron', 'fs'],
          output: { directory: 'dist/main', filename: 'main.js' }
        },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ]
      });

      const configs = parser.parse(reader as ConfigReader, RendererBuilderType.ESBUILD);

      expect(configs[0].mainConfig.excludedLibraries).toContain('electron');
    });

    test('should parse output directory', () => {
      const reader = new InMemoryConfigReader();
      reader.setConfig({
        output: 'custom-output',
        main: {
          entry: './main.ts',
          output: { directory: 'dist/main', filename: 'main.js' }
        },
        renderers: [
          {
            entry: './renderer.ts',
            html: './index.html',
            devPort: 3000,
            output: { directory: 'dist/renderer', filename: 'renderer.js' }
          }
        ]
      });

      const configs = parser.parse(reader as ConfigReader, RendererBuilderType.ESBUILD);

      expect(configs[0].output).toBe('custom-output');
    });
  });
});
