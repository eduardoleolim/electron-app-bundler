/* eslint-disable @typescript-eslint/no-require-imports */
const { app } = require('electron');
const { ElectronWindow } = require('./ElectronWindow');
const path = require('path');

app.setPath('userData', path.join(process.cwd(), 'app-user-data'));
app.on('ready', () => {
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  new ElectronWindow().show();
});
