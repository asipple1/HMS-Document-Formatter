const path = require('path');
const os = require('os');
const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const slash = require('slash');


// Set enviroment.
process.env.NODE_ENV = 'development';

const isDev = process.env.NODE_ENV !== 'product' ? true : false;
const isMac = process.platform === 'darwin' ? true : false;

let mainWindow;
let aboutWindow;

function createMainWindow () {
  mainWindow = new BrowserWindow({
    title: 'ImageShrink',
    width: isDev ? 800 : 500,
    height: 600,
    icon: `${__dirname}/assets/icons/Icon_256x256.png`,
    resizable: isDev ? true : false,
    backgroundColor: 'white',
    webPreferences: {
      nodeIntegration: true
    }
  });

  if(isDev) {
    mainWindow.webContents.openDevTools();
  }

  // Load index.html into window.
  mainWindow.loadFile('./app/index.html');
}

// About Window.
function createAboutWindow () {
  aboutWindow = new BrowserWindow({
    title: 'About Image Shrink',
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


  mainWindow.on('closed', () => mainWindow = null);
});

const menu = [
  ...(isMac ? [
    {
      label: app.name,
      submenu: [
        {
          label: 'About',
          click: createAboutWindow
        }
      ]
    }
  ]: []),
  {
    role: 'fileMenu'
  },
  ...(!isMac ? [
    {
      lable: 'Help',
      submenu: [
        {
          label: 'About',
          click: createAboutWindow
        }
      ]
    }
  ] : []),
  ...(isDev ? [{
    label: 'developer',
    submenu: [
      {role: 'reload'},
      {role: 'forcereload'},
      {type: 'separator'},
      {role: 'toggledevtools'}
    ]
  }]: [])
]

// Catch form submit
ipcMain.on('image:minimizer', (e, options) => {
  options.dest = path.join(os.homedir(), 'imageshrink')
  console.log('sup');
})



app.on('window-all-closed', () => {
  if (!isMac) {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow()
  }
})