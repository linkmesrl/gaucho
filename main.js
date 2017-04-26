"use strict";

const path = require('path');

const MainWindow = require('./app/main/main_window');
const AppEvents = require('./app/main/app_events');
const UserConfig = require('./app/main/user_config');
//system tray icon
const {app, Menu, Tray} = require('electron')
let tray = null

function isDevEnv() {
    return process.env.NODE_ENV === "dev";
}

//Global reference to window
let win = null;

function initApp() {

    function createWindow() {
        if (win === null) {
            const iconPath = path.join(__dirname, 'resources', 'icon.png');
            const htmlUrl = "file://" + __dirname + "/index.html";

            UserConfig.loadConfig((config) => {
                win = new MainWindow()
                .setIcon(iconPath)
                .setIndex(htmlUrl)
                .setUserConfig(config)
                .initWindow(isDevEnv());

                win.on('minimize',function(event){
                  event.preventDefault()
                  win.hide();
                  });

                win.on('close', function (event) {
                  if( !app.isQuiting){
                    event.preventDefault()
                    win.hide();
                  }
                  return false;
                  });
            });
        }
    }
    AppEvents(createWindow);

}

app.on('ready', () => {
  tray = new Tray('resources/icon.png')
  const contextMenu = Menu.buildFromTemplate([
    { label: 'Show App', click:  function(){
        win.show();
    } },
    { label: 'Quit', click:  function(){
        app.isQuiting = true;
        app.quit();

    } }
]);
  tray.setToolTip('LinkMe Task Runner')
  tray.setContextMenu(contextMenu)
})

initApp();
