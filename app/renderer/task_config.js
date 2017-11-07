"use strict";

const fs = require('fs');
const path = require('path');

const Suite = require('./suite');
const Task = require('./task');

function parseData(data) {
    return data.map((suite) => {
        let result = new Suite(suite);
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
    loadConfig: function (suites, done) {
        this.suites = parseData(suites);
        return done(this.suites);
    },
    saveConfig: function (done) {
        console.log("save to google sheet");
    }
};
