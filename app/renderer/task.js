"use strict";

const EventEmitter = require('events');
//riaggiunto yerbamate
const yerbamate = require('yerbamate');
const P = require('bluebird');
const TaskStatus = require('../common/task_status');
const TaskTimer = require('../common/timer');
const GoogleSpreadsheet = require('google-spreadsheet')
const doc = new P.promisifyAll( new GoogleSpreadsheet('1EhHKPhvjeQhTpEEbGCqntS4InLI1QfyYhtx4Dn9eT3w'));
const creds = require('../../client-secret.json');
let ws = null;
doc.useServiceAccountAuthAsync(creds)
    .then(() =>
        doc.getInfoAsync()
    )
    .then((info) => {
        console.log(info);
        ws = doc.worksheets[0];
    });

const TaskEvents = new EventEmitter();
TaskTimer(TaskEvents);

class Task {
    constructor(title, path, command) {
        this.title = title || "";
        this.path = path || "";
        this.command = command || "";
        this.status = TaskStatus.idle;

        this.beginTime = null;
        this.finishTime = null;
        this.elapsedTime = null;
        this.onTimeUpdate = null;
        this.currentRow = null;
    }

      run(stdout, done) {
        if (this.isRunning()) {
            throw new Error("Trying to run task without stopping it first");
        }
        this.status = TaskStatus.running;
        this.beginTime = Date.now();
        this.finishTime = null;
        this.proc = yerbamate.run(this.command, this.path, {
                stderr: stdout,
                stdout: stdout
            },
            (code) => {
                if (this.status !== TaskStatus.stopped) this.status = yerbamate.successCode(code) ? TaskStatus.ok : TaskStatus.error;
                this.finishTime = Date.now();
                this.updateElapsedTime();
                TaskEvents.removeListener("time-update", this.onTimeUpdate);
                done();
            });
        this.onTimeUpdate = () => {
            this.updateElapsedTime();
        };
        TaskEvents.on("time-update", this.onTimeUpdate);
        this.updateElapsedTime();
    }

    stop(cb) {
        if (this.isRunning()) {
            yerbamate.stop(this.proc, cb);
        } else if (cb) cb();
        this.status = TaskStatus.stopped;
    }

    /*run(stdout, done) {
        if (this.isRunning()) {
            throw new Error("Trying to run task without stopping it first");
        }

        this.status = TaskStatus.running;
        this.beginTime = Date.now();
        this.finishTime = null;
        this.onTimeUpdate = () => {
            this.updateElapsedTime();
        };
        TaskEvents.on("time-update", this.onTimeUpdate);
        this.updateElapsedTime();

        console.log('STARTING');
        doc.worksheets[0].setHeaderRow(
            ['task', 'time'],
            () => doc.worksheets[0].addRow({task: this.title, time:this.elapsedTime},
                this.getCurrentRow.bind(this)
            )
        )
        //doc.worksheets[0].getRows({'A': this.title, 'B': 0}, (a,b) => console.log(a,b))
    }
    getCurrentRow(){
        doc.worksheets[0].getRows((a, b) => {

            console.log(a,b)
            this.currentRow = b.pop();
            log(this.currentRow);
        });
    }

    stop(cb) {
        this.currentRow.time = this.elapsedTime;
        this.currentRow.save(cb);
        this.elapsedTime = 0;
        this.status = TaskStatus.stopped;
        this.onTimeUpdate = ()=>{}
    }*/

    isRunning() {
        return this.status === TaskStatus.running;
    }

    toJSON() {
        let res = {
            title: this.title,
            command: this.command,
        };
        if (this.path !== ".") res.path = this.path;
        return res;
    }

    updateElapsedTime() {
        if (this.beginTime === null) throw new Error("Error, cant update time");
        let finishTime = this.finishTime;
        if (finishTime === null) finishTime = Date.now();

        this.elapsedTime = Math.trunc((finishTime - this.beginTime) / 1000);
        console.log(this.elapsedTime)
    }
}

Task.TaskStatus = TaskStatus;

module.exports = Task;
