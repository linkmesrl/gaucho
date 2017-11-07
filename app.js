"use strict";

const ipcRenderer = require('electron').ipcRenderer;

const TaskConfig = require('./app/renderer/task_config');
const Material = require('./app/renderer/materialize');
const axios = require('axios');

const components = {
    "task-suite": require('./app/renderer/components/task_suite'),
    "navbar": require('./app/renderer/components/navbar')
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
            TaskConfig.loadConfig(suites, (result) => {
                this.suites = result;
                this.loaded = true;
            })
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
