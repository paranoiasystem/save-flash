const {app, BrowserWindow} = require('electron')
const path = require('path')
const config = require('./config.json')
let mainWindow

app.on('window-all-closed', function() {
  if (process.platform != 'darwin')
    app.quit()
})

let ppapi_flash_path

if(process.platform  == 'win32'){
  ppapi_flash_path = path.join(__dirname, 'pepflashplayer.dll')
} else if (process.platform == 'linux') {
  ppapi_flash_path = path.join(__dirname, 'libpepflashplayer.so')
} else if (process.platform == 'darwin') {
  ppapi_flash_path = path.join(__dirname, 'PepperFlashPlayer.plugin')
}

app.commandLine.appendSwitch('ignore-certificate-errors', true)
app.commandLine.appendSwitch('ppapi-flash-path', ppapi_flash_path)

app.on('ready', function() {
  mainWindow = new BrowserWindow({
    'webPreferences': {
      'plugins': true,
      'nodeIntegration': false
    }, 
  })
  mainWindow.maximize()
  if(config.url === '') {
    // Goes to local page
    mainWindow.loadURL('file://' + __dirname + '/assets/index.html');
  } else {
    // Preload Url from Config File
    mainWindow.loadURL(config.url)
  }
  // Open Dev Tools
  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.session.webRequest.onHeadersReceived({ urls: [ "*://*/*" ] },
    (d, c)=>{
      if(d.responseHeaders['X-Frame-Options']){
        delete d.responseHeaders['X-Frame-Options'];
      } else if(d.responseHeaders['x-frame-options']) {
        delete d.responseHeaders['x-frame-options'];
      }

      c({cancel: false, responseHeaders: d.responseHeaders});
    }
  );
})
