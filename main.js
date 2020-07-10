const path = require('path');
const fs = require('fs');
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const slash = require('slash');

// Set env
process.env.NODE_ENV = 'production'

const isDev = process.env.NODE_ENV !== 'production' ? true : false
const isMac = process.platform === 'darwin' ? true : false

let mainWindow;
let aboutWindow;

function createMainWindow() {
  mainWindow = new BrowserWindow({
    title: 'HMS DOC Rename',
    width: 600,
    height: 750,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: true,
    backgroundColor: '#fff',
    webPreferences: {
      nodeIntegration: true
    }
  });

  if (isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Load index.html into window.
  mainWindow.loadFile('./app/index.html');
}

// About Window.
function createAboutWindow() {
  aboutWindow = new BrowserWindow({
    title: 'HMS Doc Formatter',
    width: 300,
    height: 300,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: false,
    backgroundColor: 'white'
  });

  // Load index.html into window.
  aboutWindow.loadFile('./app/about.html');
}

app.on('ready', () => {
  createMainWindow();

  const mainMenu = Menu.buildFromTemplate(menu);
  Menu.setApplicationMenu(mainMenu);

  mainWindow.on('closed', () => (mainWindow = null));
});

const menu = [
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  {
    role: 'fileMenu',
  },
  ...(!isMac
    ? [
        {
          label: 'Help',
          submenu: [
            {
              label: 'About',
              click: createAboutWindow,
            },
          ],
        },
      ]
    : []),
  ...(isDev
    ? [
        {
          label: 'Developer',
          submenu: [
            { role: 'reload' },
            { role: 'forcereload' },
            { type: 'separator' },
            { role: 'toggledevtools' },
          ],
        },
      ]
    : []),
]

// Catch form submit
ipcMain.on('file:rename', (e, options) => {
  const oldFilepath = slash(options.filePath);
  const fileExt = path.extname(oldFilepath);
  const fileDir = path.dirname(oldFilepath);

  // TODO: Need to double check DOB placement.
  const newFileName = `${options.lastNameValue},${options.firstNameValue}${options.dobValue
    ? `_${options.dobValue}`
    : ''}_${options.autocompleteTreatmentsValue}
  ${options.autocompleteBodyValue
    ? `_${options.autocompleteBodyValue}_`
    : '_'}${options.treatmentDateValue}${options.providerInitalsValue ? `_${options.providerInitalsValue}` : ''}`;
  const newFilePath = slash(`${fileDir + `/${newFileName.replace(/\s/g, '')}` + fileExt}`);
  fs.rename(oldFilepath, newFilePath, (error) => {
    if (error) {
      console.log(error);
    } else {
      mainWindow.webContents.send('rename:done');
    }
  });
});

app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});
