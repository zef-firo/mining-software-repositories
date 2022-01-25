const electron = require('electron');
const { app, BrowserWindow } = require('electron');
var fs = require('fs');
const {ipcMain} = require('electron');
const { spawn } = require("child_process");

function createWindow () {

    const win = new BrowserWindow({
      width: 1000,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    })
  
    win.loadFile('index.html')
}

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
})

app.on('ready', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
})

ipcMain.on('read-categories-file', (event) => {
    catfile = "cli/results/categorize.json";
    fs.readFile(catfile, 'utf-8', (err, data) => {
        if(err){
            event.sender.send('categories-file-response', "nofile");
        }
        else {
            event.sender.send('categories-file-response', data);
        }
    });
});

ipcMain.on('launch-categorization', (event) => {
  let basepath = app.getAppPath();

  let exe = spawn("ruby", [basepath+"/cli/analyzer/categorize.rb"]);
  exe.stderr.on("data", (err) => {
    event.sender.send('categorization-done', 'error');
  });

  exe.on("exit", (code) => {
    console.log("Categorization done. Code: "+code);
    event.sender.send('categorization-done', 'done');
  });
});