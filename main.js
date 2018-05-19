const path = require('path')
const url = require('url')
const {app, BrowserWindow, Menu, Tray, shell, ipcMain} = require('electron')

let mainWindow;
let tray;
let subWins = new Map();
let place;

function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  subWins.set('main', mainWindow);
  // mainWindow.webContents.openDevTools() // Open the DevTools.

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null;
    subWins.delete('main');
    for(var subWin of subWins.values()){
        subWin.close();
    }
  })
}

function prapareSubWin(){
    ipcMain.on('create-sub-win', function(event, args){
        let identity = args[0];
        let width = args[1];
        let height = args[2];
        let subWin = new BrowserWindow({
            width: width,
            height: height,
            titleBarStyle: 'customButtonsOnHover', 
            frame: false,
            resizable: false,
            modal: false
        });
        place = subWin;
        subWin.loadURL(url.format({
            pathname: path.join(__dirname, 'subwin.html'),
            protocol: 'file:',
            slashes: true,
            search: '?identity=' + identity
        }));
        subWin.once('ready-to-show', () => {
            subWin.show()
        })
        subWin.on('closed', function(){
            subWin = null;
            subWins.delete(identity);
        });
        subWins.set(identity, subWin);
    });

    ipcMain.on('update-sub-win', function(event, args){
        let identity = args[0];
        let ope = args[1];
        switch(ope){
            case 'close':
               let subWin = subWins.get(identity);
               subWin.close();
               break;
            default:
               subWins.get(identity).webContents.send('sub-win-reply', args);
        }
    });
}

function createTray(){
    tray = new Tray(path.join(__dirname, 'neekle.ico'));
    const contextMenu = Menu.buildFromTemplate([
      {label: '菜单一', type: 'normal', click(){shell.openExternal('https://electronjs.org')}},
      {label: '菜单二', type: 'normal'},
      {type: 'separator'},
      {label: '退出', type: 'normal', role: 'quit'}
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
}

app.on('ready', function(){
    createWindow();
    createTray();
    prapareSubWin();
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }
})

