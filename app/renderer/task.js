"use strict";

const EventEmitter = require('events');

const yerbamate = require('yerbamate');

const TaskStatus = require('../common/task_status');
const TaskTimer = require('../common/timer');
const AppStatus = require('./app_status');

const TaskEvents = new EventEmitter();
TaskTimer(TaskEvents);

class Task {
    constructor(task) {
        this.name = task.name || "";
        this.desc = task.desc || "";
        this.url = task.url;
        this.due = task.due || "-";
        this.dateLastActivity = task.dateLastActivity;
        this.labels = task.labels;
        this.idBoard = task.idBoard;
        this.id = task.id || null;        
        this.creationDate = task.creationDate || null;
        this.status = TaskStatus.idle;
        this.beginTime = null;
        this.finishTime = null;
        this.savedElapsedTimes = task.savedElapsedTimes || [0,0,0,0,0,0,0];
        this.elapsedTime = task.elapsedTime || 0;        
        this.onTimeUpdate = null;
    }

    run(stdout, done) {
        if (this.isRunning()) {
            throw new Error("Trying to run task without stopping it first");
        }
        this.status = TaskStatus.running;
        this.beginTime = Date.now() - (this.elapsedTime * 1000);
        this.finishTime = null;
        this.proc = setInterval(() => {
            this.finishTime = Date.now();
            this.updateElapsedTime();
            TaskEvents.removeListener("time-update", this.onTimeUpdate);
            done();
        }, 1000);
        this.onTimeUpdate = () => {
            this.updateElapsedTime();
        };
        TaskEvents.on("time-update", this.onTimeUpdate);
        this.updateElapsedTime();
    }

    stop(cb) {
        if (this.isRunning()) {
            clearInterval(this.proc);
        } else if (cb) cb();
        this.status = TaskStatus.stopped;
        this.savedElapsedTimes[AppStatus.activeDay] = this.elapsedTime;
    }

    isRunning() {
        return this.status === TaskStatus.running;
    }

    toJSON() {
        let res = {
            name: this.name,
            desc: this.desc,
            elapsedTime: this.elapsedTime,
            creationDate: this.creationDate,
            savedElapsedTimes: this.savedElapsedTimes,
            day: AppStatus.weekDays[AppStatus.activeDay],
            id: this.id
        };
        return res;
    }

    updateElapsedTime() {
        if (this.beginTime === null) throw new Error("Error, cant update time");
        let finishTime = this.finishTime;
        if (finishTime === null) finishTime = Date.now();

        this.elapsedTime = Math.trunc((finishTime - this.beginTime) / 1000);
    }
}

Task.TaskStatus = TaskStatus;

module.exports = Task;
