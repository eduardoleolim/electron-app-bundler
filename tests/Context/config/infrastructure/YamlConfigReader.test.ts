import * as fs from 'fs';
import os from 'os';
import * as path from 'path';

import { YamlConfigReader } from '../../../../src/Context/config/infrastructure/YamlConfigReader.mjs';

describe('YamlConfigReader', () => {
  let tempDir: string;
  let tempFile: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yaml-config-reader-'));
    tempFile = path.join(tempDir, 'config.yaml');
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  test('should read valid YAML config', () => {
    const config = 'main:\n  entry: ./main.ts\nrenderers: []';
    fs.writeFileSync(tempFile, config);

    const reader = new YamlConfigReader(tempFile);
    const result = reader.read() as { main: { entry: string } };

    expect(result.main.entry).toBe('./main.ts');
  });

  test('should throw error when file does not exist', () => {
    const nonExistentFile = path.join(tempDir, 'non-existent.yaml');
    const reader = new YamlConfigReader(nonExistentFile);

    expect(() => reader.read()).toThrow('Config file not found');
  });

  test('should handle nested YAML structure', () => {
    const config = `
main:
  entry: ./main.ts
  output:
    directory: dist
    filename: main.js
renderers:
  - entry: ./renderer.ts
    html: ./index.html
    devPort: 3000
`;
    fs.writeFileSync(tempFile, config);

    const reader = new YamlConfigReader(tempFile);
    const result = reader.read() as { main: { entry: string; output: { directory: string } } };

    expect(result.main.entry).toBe('./main.ts');
    expect(result.main.output.directory).toBe('dist');
  });

  test('should handle empty YAML document', () => {
    fs.writeFileSync(tempFile, '');

    const reader = new YamlConfigReader(tempFile);
    const result = reader.read();

    expect(result).toBeUndefined();
  });

  test('should handle YAML list', () => {
    const config = '- item1\n- item2\n- item3';
    fs.writeFileSync(tempFile, config);

    const reader = new YamlConfigReader(tempFile);
    const result = reader.read() as string[];

    expect(result).toHaveLength(3);
  });

  test('should handle special characters', () => {
    const config = 'entry: "./path/with spaces"';
    fs.writeFileSync(tempFile, config);

    const reader = new YamlConfigReader(tempFile);
    const result = reader.read() as { entry: string };

    expect(result.entry).toBe('./path/with spaces');
  });

  test('should handle boolean and number values', () => {
    const config = `
enabled: true
count: 42
ratio: 3.14
`;
    fs.writeFileSync(tempFile, config);

    const reader = new YamlConfigReader(tempFile);
    const result = reader.read() as { enabled: boolean; count: number; ratio: number };

    expect(result.enabled).toBe(true);
    expect(result.count).toBe(42);
    expect(result.ratio).toBe(3.14);
  });

  test('should handle multiline strings', () => {
    const config = `
description: |
  This is a
  multiline
  string
`;
    fs.writeFileSync(tempFile, config);

    const reader = new YamlConfigReader(tempFile);
    const result = reader.read() as { description: string };

    expect(result.description).toContain('multiline');
  });

  test('should handle anchors and aliases', () => {
    const config = `
base: &base
  value: common
derived:
  <<: *base
  extra: value
`;
    fs.writeFileSync(tempFile, config);

    const reader = new YamlConfigReader(tempFile);
    const result = reader.read() as { derived: { value: string } };

    expect(result.derived.value).toBe('common');
  });
});
