import { app } from 'electron';
import path from 'node:path';

import { ElectronWindow } from './ElectronWindow.js';

(async () => {
  app.setPath('userData', path.join(process.cwd(), 'app-user-data'));
  await app.whenReady();

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  new ElectronWindow().show();
})();
