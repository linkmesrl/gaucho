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
const TrelloAuth = require('./trello_auth');

function isDevEnv() {
    return process.env.NODE_ENV === "dev";
}

global.trello_consumer_key = 'e2667b0fdf2c31c8f23e3d58d48ca1a3';
global.trello_consumer_secret = '3b6b2ab0d8d2dfcbf97a06124e078e6ced090b4d57515f09e133a7c3c47f6615';

//Global reference to window
let win = null;

function initApp() {
    protocol.registerStandardSchemes(['electroauth']);

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
            });
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