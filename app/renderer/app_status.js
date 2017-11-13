"use strict";

const remote = require('electron').remote;
const EventEmitter = require('events');

const TaskConfig = require('./task_config');

module.exports = {
    weekDays: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    editMode: false,
    activeSuite: 0,
    activeDay: 0,
    events: new EventEmitter(),
    toggleEdit: function() {
        this.editMode = !this.editMode;
        TaskConfig.saveConfig();
    },
    config: remote.getCurrentWindow().userConfig,
    maxSuites: 6,
    maxTasksPerSuite: 8
};
