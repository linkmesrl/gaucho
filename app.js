"use strict";

const ipcRenderer = require('electron').ipcRenderer;

const Material = require('./app/renderer/materialize');
const axios = require('axios');
const Suite = require('./app/renderer/suite');
const Task = require('./app/renderer/task');

const components = {
    "task-suite": require('./app/renderer/components/task_suite'),
    "navbar": require('./app/renderer/components/navbar'),
    "add-task": require('./app/renderer/components/add_task')
};

let suites = [];

ipcRenderer.on('before-close', () => {
    const promises = suites.map((s) => {
        return s.stopAll();
    });
    promises.push(new Promise((resolve) => {
        TaskConfig.saveConfig(() => {
            resolve();
        });
    }));
    Promise.all(promises).then(() => {
        ipcRenderer.send("close-app");
    });
});

const app = new Vue({ // jshint ignore:line
    el: '#app',
    data: {
        suites: suites,
        loaded: false
    },
    methods: {
        BoardsWithCardsReceived: function (suites) {
            this.suites = this.parseData(suites);
            this.loaded = true;
            this.$emit('suitescreated', this.suites);
        },
        parseData: function (data) {
            return data.map((suite) => {
                let result = new Suite(suite);
                result.tasks = suite.tasks.map((task) => {
                    return new Task(task);
                });
                return result;
            });
        }
    },
    components: components,
    mounted() {
        Material.init();
    },
    updated() {
        this.$nextTick(() => {
            Material.init();
        });
    }
});
