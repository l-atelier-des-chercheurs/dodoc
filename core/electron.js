const electron = require('electron');
const { app, BrowserWindow, Menu } = electron;

const electronPDFWindow = require('electron-pdf-window');

const { dialog } = require('electron');
const JSONStorage = require('node-localstorage').JSONStorage;

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
      app.commandLine.appendSwitch('--ignore-certificate-errors');
      app.commandLine.appendSwitch('--disable-http-cache');

      var storageLocation = app.getPath('userData');
      global.nodeStorage = new JSONStorage(storageLocation);

      var windowState = {};
      try {
        windowState = global.nodeStorage.getItem('windowstate')
          ? global.nodeStorage.getItem('windowstate')
          : {};
        dev.log('Found defaults for windowState');
      } catch (err) {
        dev.log('No default for windowState');
      }

      // Create the browser window.
      win = new BrowserWindow({
        x: (windowState.bounds && windowState.bounds.x) || undefined,
        y: (windowState.bounds && windowState.bounds.y) || undefined,
        width: (windowState.bounds && windowState.bounds.width) || 1200,
        height: (windowState.bounds && windowState.bounds.height) || 800,

        backgroundColor: '#EBEBEB',
        show: false,
        titleBarStyle: 'hidden',

        webPreferences: {
          allowDisplayingInsecureContent: true,
          allowRunningInsecureContent: true,
          nodeIntegration: true,
          plugins: true
        }
      });

      electronPDFWindow.addSupport(win);

      if (windowState.isMaximized) {
        win.maximize();
      }

      var storeWindowState = function() {
        windowState.isMaximized = win.isMaximized();
        if (!windowState.isMaximized) {
          // only update bounds if the window isn't currently maximized
          windowState.bounds = win.getBounds();
        }
        global.nodeStorage.setItem('windowstate', windowState);
      };

      ['close'].forEach(function(e) {
        win.on(e, function() {
          try {
            storeWindowState();
          } catch (e) {
            dev.error(
              'Couldn’t update local settings with window position: ' + e
            );
          }
        });
      });

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
