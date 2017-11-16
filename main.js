"use strict";
const {
    BrowserWindow,
    app,
    protocol
} = require('electron');

const path = require('path');
const url = require('url');

const MainWindow = require('./app/main/main_window');
const AppEvents = require('./app/main/app_events');
const UserConfig = require('./app/main/user_config');
const KeysConfig = require('./app/main/keys_config');
const TrelloAuth = require('./trello_auth');


async function isDevEnv() {
    return process.env.NODE_ENV === "dev";
}

//Global reference to window
let win = null;

function initApp() {
    protocol.registerStandardSchemes(['electroauth']);

    function createWindow() {
        if (win === null) {
            const iconPath = path.join(__dirname, 'resources', 'icon.png');
            const htmlUrl = "file://" + __dirname + "/index.html";

            KeysConfig.loadConfig((keysConfig) => {
                global.keysConfig = keysConfig;
                UserConfig.loadConfig((config) => {
                    win = new MainWindow()
                        .setIcon(iconPath)
                        .setIndex(htmlUrl)
                        .setUserConfig(config)
                        .initWindow(isDevEnv());
                });
            })
        }
        protocol.registerStringProtocol('electroauth', (req, callback) => {
            if (url.parse(req.url).host === 'storetoken') {
                TrelloAuth.storeToken(url.parse(req.url).query, win);
            }
        });
    }
    AppEvents(createWindow);
}

initApp();