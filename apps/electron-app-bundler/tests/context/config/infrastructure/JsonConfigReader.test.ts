import * as fs from 'fs';
import os from 'os';
import * as path from 'path';

import { JsonConfigReader } from '../../../../src/context/config/infrastructure/JsonConfigReader.mjs';

describe('JsonConfigReader', () => {
  let tempDir: string;
  let tempFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'json-config-reader-'));
    tempFile = path.join(tempDir, 'config.json');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should read valid JSON config', () => {
    const config = { main: { entry: './main.ts' }, renderers: [] };
    fs.writeFileSync(tempFile, JSON.stringify(config));

    const reader = new JsonConfigReader(tempFile);
    const result = reader.read();

    expect(result).toEqual(config);
  });

  test('should throw error when file does not exist', () => {
    const nonExistentFile = path.join(tempDir, 'non-existent.json');
    const reader = new JsonConfigReader(nonExistentFile);

    expect(() => reader.read()).toThrow('Config file not found');
  });

  test('should handle nested JSON structure', () => {
    const config = {
      main: { entry: './main.ts', output: { directory: 'dist', filename: 'main.js' } },
      renderers: [{ entry: './renderer.ts', html: './index.html', devPort: 3000 }],
      preloads: []
    };
    fs.writeFileSync(tempFile, JSON.stringify(config));

    const reader = new JsonConfigReader(tempFile);
    const result = reader.read() as { main: { entry: string }; renderers: unknown[] };

    expect(result.main.entry).toBe('./main.ts');
    expect(result.renderers).toHaveLength(1);
  });

  test('should handle empty JSON object', () => {
    fs.writeFileSync(tempFile, '{}');

    const reader = new JsonConfigReader(tempFile);
    const result = reader.read();

    expect(result).toEqual({});
  });

  test('should handle JSON array', () => {
    const configs = [{ main: { entry: './main.ts' } }, { main: { entry: './main2.ts' } }];
    fs.writeFileSync(tempFile, JSON.stringify(configs));

    const reader = new JsonConfigReader(tempFile);
    const result = reader.read() as unknown[];

    expect(result).toHaveLength(2);
  });

  test('should handle special characters in JSON', () => {
    const config = { entry: './path/with spaces/file.ts' };
    fs.writeFileSync(tempFile, JSON.stringify(config));

    const reader = new JsonConfigReader(tempFile);
    const result = reader.read() as Record<string, unknown>;

    expect(result.entry).toBe('./path/with spaces/file.ts');
  });

  test('should handle unicode characters', () => {
    const config = { entry: './文件.ts' };
    fs.writeFileSync(tempFile, JSON.stringify(config));

    const reader = new JsonConfigReader(tempFile);
    const result = reader.read() as Record<string, unknown>;

    expect(result.entry).toBe('./文件.ts');
  });

  test('should handle deep nested objects', () => {
    const config = {
      level1: {
        level2: {
          level3: {
            value: 'deep'
          }
        }
      }
    };
    fs.writeFileSync(tempFile, JSON.stringify(config));

    const reader = new JsonConfigReader(tempFile);
    const result = reader.read() as { level1: { level2: { level3: { value: string } } } };

    expect(result.level1.level2.level3.value).toBe('deep');
  });
});
