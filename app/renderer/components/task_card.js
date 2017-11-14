"use strict";
const AppStatus = require('../app_status');
const TaskStatus = require('../../common/task_status');
const TaskConfig = require('../task_config');

const Material = require('../materialize');
const Utils = require('../../common/utils');
const GoogleApis = require('../../../google_sheets_auth');

console.log(GoogleApis)

const config = AppStatus.config;

let userFullName = localStorage.getItem("userFullName");
console.log(userFullName)


module.exports = {
    props: ['task', 'event'],
    data: () => {
        return {
            output: ""
        };
    },
    template: `
    <li class="run-card">
        <div class="collapsible-header row unselectable-text">
            <div class="col s5">
                <strong class="truncate">{{task.name}}</strong>     
            </div>
            <div class="col s3">
                <div v-if="!task.editTimer" class="truncate task-time">{{executionTime}}</div>
                <div v-else="task.editTimer" class="truncate task-time">
                    <input class="edit-task-timer" type="number" v-model="task.executionTimeEditFirst"> : <input class="edit-task-timer" type="number" v-model="task.executionTimeEditSecond">
                </div>
            </div>
            <div class="col s3">
                <a v-if="task.editTimer" class="waves-effect waves-light btn save-button" v-on:click="editTimer">Save</a>
                <a v-if="!task.editTimer" class="waves-effect waves-light btn run-button col s9" v-on:click="toggleRun">{{running? "Stop" : "Run"}}</a>
                <a v-if="!task.editTimer && !running" v-on:click="toggleTimerEdit" class="edit-button col s3"><i class="material-icons unselectable-text">mode_edit</i></a>                
            </div>
            <div class="col s1">
                <div class="badge">
                    <i class="small material-icons" v-bind:style="{color: statusColor}" v-bind:class="{ disabled: running }">{{task.status}}</i>
                </div>
            </div>
        </div>
        <div v-if="!task.editTimer" class="collapsible-body">
            <div class="run-output">
                <span><b>Description: </b> {{task.desc}}</span><br>
                <span><b>Date last activity: </b> {{task.dateLastActivity}}</span><br>
                <span><b>Due: </b> {{task.due}}</span><br>
                <span><b>Labels: </b> <span v-for="(label, i) in task.labels" class="trello-label" v-bind:style="{ 'background-color': label.color }">{{label.name}}</span></span><br>
                <span><b>Url: </b> <a class="cursor" v-on:click="openTaskUrl(task.url)">Open task link</a></span>
            </div>
        </div>
  </li>
  `,
    mounted: function () {
        this.event.on("run", this.run);
        this.event.on("stop", this.stop);
    },
    beforeDestroy() {
        this.removeListeners();
    },
    methods: {
        toggleRun: function (ev) {
            ev.stopPropagation();
            if (this.running) this.stop();
            else this.run();
        },
        toggleTimerEdit(ev) {
            ev.stopPropagation();
            this.task.editTimer = true;
            if(!this.task.executionTimeEditFirst && !this.task.executionTimeEditSecond) {
                let time = Utils.generateTimeString(this.task.elapsedTime);
                this.task.executionTimeEditFirst = time.substring(0, time.indexOf(':'));
                this.task.executionTimeEditSecond = time.substring(time.indexOf(':') + 1);
            }
            this.$forceUpdate();
        },
        editTimer(ev) {
            ev.stopPropagation();
            if(this.task.executionTimeEditFirst && this.task.executionTimeEditSecond) {
                let time = Utils.generateTimeString(this.task.elapsedTime);
                this.task.elapsedTime = Number(this.task.executionTimeEditFirst * 60) + Number(this.task.executionTimeEditSecond);
                delete this.task.executionTimeEditFirst;
                delete this.task.executionTimeEditSecond;
            }
            delete this.task.editTimer;
            this.$forceUpdate();            
            this.$emit('edit', this.task);
        },
        run() {
            this.output = "";
            this.task.run(() => { });
        },
        stop() {
            this.task.stop();
            var params = {
                range: app.suites[AppStatus.activeSuite].title + '' + "!A1",
                values: [[userFullName, this.task.elapsedTime, this.task.name]]
            }
            GoogleApis.append(params);
        },
        removeListeners() {
            this.event.removeListener("run", this.run);
            this.event.removeListener("stop", this.stop);
        },
        autoScroll() {
            let container = this.$el.querySelector(".run-output");
            if (container && container.scrollTop === container.scrollHeight - container.clientHeight) {
                this.$nextTick(() => {
                    container.scrollTop = container.scrollHeight;
                });
            }
        },
        collapseTask() {
            const elements = this.$el.getElementsByClassName('collapsible-header');
            if (elements[0]) {
                elements[0].classList.remove("active");
                Material.updateCollapsible();
            }
        },
        openTaskUrl(url) {
            const remote = require('electron').remote;
            const BrowserWindow = remote.BrowserWindow;
            var win = new BrowserWindow({ width: 800, height: 600 });
            win.loadURL(url);
        }
    },
    computed: {
        statusColor: function () {
            switch (this.task.status) {
                case TaskStatus.idle:
                case TaskStatus.stopped:
                    return "black";
                case TaskStatus.error:
                    return "red";
                case TaskStatus.running:
                    return "blue";
                case TaskStatus.ok:
                    return "green";
                default:
                    return "grey";
            }
        },
        running: function () {
            return this.task.isRunning();
        },
        executionTime: function () {
            return Utils.generateTimeString(this.task.elapsedTime);
        }
    }
};
