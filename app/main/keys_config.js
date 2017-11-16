"use strict";

const fs = require('fs');
const path = require('path');

const configFile = "../../keys.json";

module.exports = {
    config: null,

    loadConfig: function(done) {
        fs.readFile(path.join(__dirname, configFile), 'utf8', (err, data) => {
            if (err) {
                return done(false);
            } else {
                let keysConfig = JSON.parse(data);
                if (done) return done(keysConfig);
            }
        });
    }
};
