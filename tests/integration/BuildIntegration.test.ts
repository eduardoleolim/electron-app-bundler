import { execSync } from 'child_process';
import * as fs from 'fs';
import os from 'os';
import * as path from 'path';

const PROJECT_ROOT = '/home/eduardoleolim/projects/personal/electron-esbuild';

describe('Build Integration', () => {
  let tempDir: string;
  let projectDir: string;

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'electron-build-test-'));
    projectDir = path.join(tempDir, 'test-app');
    fs.mkdirSync(projectDir, { recursive: true });

    const packageJson = {
      name: 'test-app',
      version: '1.0.0',
      devDependencies: {
        esbuild: '^0.20.0'
      }
    };
    fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify(packageJson, null, 2));
  });

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  const createConfigFile = (content: object) => {
    fs.writeFileSync(path.join(projectDir, 'electron-app-bundler.config.json'), JSON.stringify(content, null, 2));
  };

  const createMainFile = () => {
    fs.mkdirSync(path.join(projectDir, 'src'), { recursive: true });
    fs.writeFileSync(
      path.join(projectDir, 'src/main.ts'),
      `import { app, BrowserWindow } from 'electron';
app.whenReady().then(() => {
  new BrowserWindow();
});`
    );
  };

  const createPreloadFile = () => {
    fs.writeFileSync(
      path.join(projectDir, 'src/preload.ts'),
      `import { contextBridge } from 'electron';
contextBridge.exposeInMainWorld('electron', {});`
    );
  };

  const createRendererFiles = () => {
    fs.mkdirSync(path.join(projectDir, 'src/renderer'), { recursive: true });
    fs.writeFileSync(
      path.join(projectDir, 'src/renderer/index.ts'),
      `document.body.innerHTML = '<h1>Hello World</h1>';`
    );
    fs.writeFileSync(
      path.join(projectDir, 'src/renderer/index.html'),
      '<!DOCTYPE html><html><head><title>Test</title></head><body><h1>Hello</h1></body></html>'
    );
  };

  const runBuild = () => {
    try {
      execSync('npm install', { cwd: projectDir, stdio: 'ignore' });
      const output = execSync(`node ${path.join(PROJECT_ROOT, 'dist/app/index.mjs')} build`, {
        cwd: projectDir,
        stdio: 'pipe'
      });
      console.log('Output:', output.toString());
    } catch (e: unknown) {
      if (e instanceof Error) {
        console.log('STDERR:', e.message);
      }
      throw e;
    }
  };

  test('should create main bundle', () => {
    createMainFile();
    createRendererFiles();
    createConfigFile({
      main: { entry: './src/main.ts', output: { directory: 'main', filename: 'main.js' } },
      renderers: {
        entry: './src/renderer/index.ts',
        html: './src/renderer/index.html',
        devPort: 3000,
        output: { directory: 'renderer', filename: 'renderer.js' }
      }
    });

    runBuild();

    expect(fs.existsSync(path.join(projectDir, 'dist/main/main.js'))).toBe(true);
  });

  test('should create renderer bundle', () => {
    createMainFile();
    createRendererFiles();
    createConfigFile({
      main: { entry: './src/main.ts', output: { directory: 'main', filename: 'main.js' } },
      renderers: {
        entry: './src/renderer/index.ts',
        html: './src/renderer/index.html',
        devPort: 3000,
        output: { directory: 'renderer', filename: 'renderer.js' }
      }
    });

    runBuild();

    expect(fs.existsSync(path.join(projectDir, 'dist/renderer/renderer.js'))).toBe(true);
  });

  test('should copy html file', () => {
    createMainFile();
    createRendererFiles();
    createConfigFile({
      main: { entry: './src/main.ts', output: { directory: 'main', filename: 'main.js' } },
      renderers: {
        entry: './src/renderer/index.ts',
        html: './src/renderer/index.html',
        devPort: 3000,
        output: { directory: 'renderer', filename: 'renderer.js' }
      }
    });

    runBuild();

    expect(fs.existsSync(path.join(projectDir, 'dist/renderer/index.html'))).toBe(true);
  });

  test('should create preload bundle', () => {
    createMainFile();
    createPreloadFile();
    createRendererFiles();
    createConfigFile({
      main: { entry: './src/main.ts', output: { directory: 'main', filename: 'main.js' } },
      preloads: { entry: './src/preload.ts', output: { directory: 'preload', filename: 'preload.js' }, renderers: [0] },
      renderers: {
        entry: './src/renderer/index.ts',
        html: './src/renderer/index.html',
        devPort: 3000,
        output: { directory: 'renderer', filename: 'renderer.js' }
      }
    });

    runBuild();

    expect(fs.existsSync(path.join(projectDir, 'dist/preload/preload.js'))).toBe(true);
  });

  test('should create multiple renderer bundles', () => {
    createMainFile();
    fs.mkdirSync(path.join(projectDir, 'src/renderer2'), { recursive: true });
    fs.writeFileSync(path.join(projectDir, 'src/renderer2/index.ts'), `document.body.innerHTML = '<h1>R2</h1>';`);
    fs.writeFileSync(
      path.join(projectDir, 'src/renderer2/index.html'),
      '<!DOCTYPE html><html><body><h1>R2</h1></body></html>'
    );

    createConfigFile({
      main: { entry: './src/main.ts', output: { directory: 'main', filename: 'main.js' } },
      renderers: [
        {
          entry: './src/renderer/index.ts',
          html: './src/renderer/index.html',
          devPort: 3000,
          output: { directory: 'renderer1', filename: 'renderer1.js' }
        },
        {
          entry: './src/renderer2/index.ts',
          html: './src/renderer2/index.html',
          devPort: 3001,
          output: { directory: 'renderer2', filename: 'renderer2.js' }
        }
      ]
    });

    runBuild();

    expect(fs.existsSync(path.join(projectDir, 'dist/renderer2/renderer2.js'))).toBe(true);
  });
});
