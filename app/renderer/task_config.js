"use strict";

const fs = require('fs');
const path = require('path');

const Suite = require('./suite');
const Task = require('./task');

function parseData(data) {
    return data.suites.map((suite) => {
        let result = new Suite(suite.title);
        result.tasks = suite.tasks.map((task) => {
            return new Task(task);
        });
        return result;
    });
}

const configFile = "../../tasks.json";

const defaultConfig = `{
    "suites": [{
        "title": "My Project",
        "tasks": [{
            "title": "Start",
            "description": "test description",
            "elapsedTime": 0,            
            "id": 0,
            "creationDate": "Tue Oct 31 2017 15:11:59 GMT+0100 (CET)"
        }]
    }, {
        "title": "Suite 2",
        "tasks": [{
            "title": "HourGlass",
            "description": "echo 'hello world'",
            "elapsedTime": 0,
            "id": 1,
            "creationDate": "Tue Oct 31 2017 15:11:59 GMT+0100 (CET)"
        }]
    }]
}`;

module.exports = {
    suites: [],
    loadConfig: function(done) {
        fs.readFile(path.join(__dirname, configFile), 'utf8', (err, data) => {
            if (err) {
                console.warn("tasks.json file not found");
                data=defaultConfig;
            }
            try {
                this.suites = parseData(JSON.parse(data));
                return done(null, this.suites);
            } catch (e) {
                done(e);
            }
        });
    },
    saveConfig: function(done) {
        let data = {
            suites: this.suites.map((suite) => {
                return suite.toJSON();
            })
        };

        fs.writeFile(path.join(__dirname, configFile), JSON.stringify(data), (err) => {
            if (err) console.error("Error on saveConfig:" + err);
            if (done) done(err);
        });
    }
};
