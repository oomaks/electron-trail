const path = require('path')
const url = require('url')
const {app, BrowserWindow, Menu, Tray, shell, ipcMain} = require('electron')

let mainWindow;
let tray;
let subWins = new Map();
let place;

global.sharedObject = {
    subWins: subWins
};
console.log('#########################');
console.log(global.sharedObject.arg);
function createWindow () {
  mainWindow = new BrowserWindow({width: 800, height: 600});
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'index.html'),
    protocol: 'file:',
    slashes: true
  }))
  mainWindow.webContents.openDevTools()
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
    ipcMain.on('create-sub-win', function(event, params){
        createSubWin();
    });

    ipcMain.on('update-sub-win', function(event, params){
        let identity = params.identity || '';
        let ope = params.ope || '';
        let subWin;
        switch(ope){
            case 'close':
               subWin = subWins.get(identity);
               subWin.close();
               break;
            case 'show':
               subWin = subWins.get(identity);
                if(!subWin.isVisible()) {
                 subWin.show();
                }
              
               break;
            case 'hide':
               subWin = subWins.get(identity);
               
               if(subWin.isVisible()) {
                 subWin.hide();
               }
               
               break;
            case 'callback':
               subWin = subWins.get(identity);
               if (!subWin.isVisible()) {
                 subWin.show();
               }
               break;
            default:
               console.log(params);
               subWins.get(identity).webContents.send('sub-win-reply', params);
        }
    });
}

function createSubWin(params){
    console.log(params);
    let identity = params.identity;
    let posX = params.x || '';
    let posY = params.y || '';
    let width = params.width || 400;
    let height = params.height || 300;
    let skipTaskbar = params.skipTaskbar !== undefined ? params.skipTaskbar : false;
    let show = params.show !== undefined ? params.show : true;
    let alwaysOnTop = params.alwaysOnTop !==undefined ? params.alwaysOnTop : false;

    if(subWins.get(identity)){
        subWins.get(identity).show();
    }

    let subWin = new BrowserWindow({
        x: posX,
        y: posY,
        width: width,
        height: height,
        titleBarStyle: 'customButtonsOnHover', 
        frame: false,
        resizable: false,
        modal: false,
        skipTaskbar: skipTaskbar,
        alwaysOnTop: alwaysOnTop,
        show: show,
    });
    place = subWin;
    subWin.loadURL(url.format({
        pathname: path.join(__dirname, 'notifier.html'),
        protocol: 'file:',
        slashes: true,
        search: '?identity=' + identity
    }));
    subWin.webContents.openDevTools()
    subWin.on('closed', function(){
        subWin = null;
        subWins.delete(identity);
    });
    subWins.set(identity, subWin);
}

function createTray(){
    tray = new Tray(path.join(__dirname, 'neekle.ico'));
    const contextMenu = Menu.buildFromTemplate([
      {label: '菜单一', type: 'normal', click(){shell.openExternal('https://electronjs.org')}},
      {label: global.sharedObject.arg, type: 'normal'},
      {type: 'separator'},
      {label: '退出', type: 'normal', role: 'quit'}
    ])
    tray.setToolTip('This is my application.')
    tray.setContextMenu(contextMenu)
}

function prepareNotifier() {
    const { screen } = require('electron');
    let {width, height} = screen.getPrimaryDisplay().workArea;
    let posX = width - 410;
    let posY = height - 110;
    createSubWin({
        identity: 'notifier',
        x: posX,
        y: posY,
        width: 400,
        height: 100,
        skipTaskbar: true,
        show: false,
        alwaysOnTop: true
    });
}

app.on('ready', function(){
    createWindow();
    createTray();
    prapareSubWin();
    prepareNotifier();
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

