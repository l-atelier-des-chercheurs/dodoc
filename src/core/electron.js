const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;

const electronPDFWindow = require('electron-pdf-window');

const { dialog } = require('electron');
const windowStateKeeper = require('electron-window-state');

module.exports = (function() {
  return {
    init: () => {
      return new Promise(function(resolve, reject) {
        let win;
        // This method will be called when Electron has finished
        // initialization and is ready to create browser windows.
        // Some APIs can only be used after this event occurs.
        app.on('ready', () => {
          createWindow(win).then(win => {
            return resolve(win);
          });
        });

        // Quit when all windows are closed.
        app.on('window-all-closed', () => {
          // On macOS it is common for applications and their menu bar
          // to stay active until the user quits explicitly with Cmd + Q
          // if (process.platform !== 'darwin') {
          global.ffmpeg_processes.map(f => f.kill());
          app.quit();
          // }
        });

        app.on('activate', () => {
          // On macOS it's common to re-create a window in the app when the
          // dock icon is clicked and there are no other windows open.
          if (win === null) {
            createWindow(win).then(win => {
              return resolve(win);
            });
          }
        });
      });
    }
  };

  function createWindow(win) {
    return new Promise(function(resolve, reject) {
      dev.logfunction(`ELECTRON — createWindow`);

      app.commandLine.appendSwitch('--ignore-certificate-errors');
      app.commandLine.appendSwitch('--disable-http-cache');

      let mainWindowState = windowStateKeeper({
        defaultWidth: 1000,
        defaultHeight: 800
      });

      // Create the browser window.
      win = new BrowserWindow({
        x: mainWindowState.x,
        y: mainWindowState.y,
        width: mainWindowState.width,
        height: mainWindowState.height,
        backgroundColor: '#EBEBEB',
        titleBarStyle: 'hidden',

        webPreferences: {
          allowDisplayingInsecureContent: true,
          allowRunningInsecureContent: true,
          nodeIntegration: true,
          plugins: true
        }
      });

      mainWindowState.manage(win);
      electronPDFWindow.addSupport(win);

      if (process.platform == 'darwin') {
        app.setAboutPanelOptions({
          applicationName: global.appInfos.name,
          applicationVersion: app.getVersion(),
          copyright: 'Released under the Creative Commons license.'
        });
      }

      setApplicationMenu();

      // Emitted when the window is closed.
      win.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        win = null;
      });

      win.on('ready-to-show', function() {
        win.show();
        win.focus();
      });

      return resolve(win);
    });
  }

  function setApplicationMenu() {
    // Create the Application's main menu
    var template = [
      {
        label: global.appInfos.productName,
        submenu: [
          {
            label: `À propos ${global.appInfos.productName}`,
            selector: 'orderFrontStandardAboutPanel:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Services',
            submenu: []
          },
          {
            type: 'separator'
          },
          {
            label: `Cacher ${global.appInfos.productName}`,
            accelerator: 'Command+H',
            selector: 'hide:'
          },
          {
            label: 'Cacher les autres',
            accelerator: 'Command+Shift+H',
            selector: 'hideOtherApplications:'
          },
          {
            label: 'Montrer tout',
            selector: 'unhideAllApplications:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Quitter',
            accelerator: 'Command+Q',
            click: function() {
              global.ffmpeg_processes.map(f => f.kill());
              app.quit();
            }
          }
        ]
      },
      {
        label: 'Edition',
        submenu: [
          {
            label: 'Annuler',
            accelerator: 'Command+Z',
            selector: 'undo:'
          },
          {
            label: 'Rétablir',
            accelerator: 'Shift+Command+Z',
            selector: 'redo:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Couper',
            accelerator: 'Command+X',
            selector: 'cut:'
          },
          {
            label: 'Copier',
            accelerator: 'Command+C',
            selector: 'copy:'
          },
          {
            label: 'Coller',
            accelerator: 'Command+V',
            selector: 'paste:'
          },
          {
            label: 'Sélectionner tout',
            accelerator: 'Command+A',
            selector: 'selectAll:'
          }
        ]
      },
      {
        label: 'Affichage',
        submenu: [
          {
            label: 'Recharger',
            accelerator: 'Command+R',
            click: function() {
              BrowserWindow.getFocusedWindow().reload();
            }
          },
          {
            label: 'Afficher les outils de développement',
            accelerator: 'Alt+Command+I',
            click: function() {
              BrowserWindow.getFocusedWindow().toggleDevTools();
            }
          }
        ]
      },
      {
        label: 'Fenêtre',
        submenu: [
          {
            label: 'Réduire',
            accelerator: 'Command+M',
            selector: 'performMiniaturize:'
          },
          {
            label: 'Fermer',
            accelerator: 'Command+W',
            selector: 'performClose:'
          },
          {
            type: 'separator'
          },
          {
            label: 'Mettre tout au premier plan',
            selector: 'arrangeInFront:'
          }
        ]
      },
      {
        label: 'Aide',
        submenu: []
      }
    ];

    menu = Menu.buildFromTemplate(template);
    Menu.setApplicationMenu(menu);
  }
})();
