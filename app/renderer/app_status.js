"use strict";

const remote = require('electron').remote;
const EventEmitter = require('events');

const TaskConfig = require('./task_config');

module.exports = {
    activeSuite: 0,
    events: new EventEmitter(),
    config: remote.getCurrentWindow().userConfig,
    maxSuites: 6,
    maxTasksPerSuite: 8
};
