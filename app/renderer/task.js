"use strict";

const EventEmitter = require('events');

const yerbamate = require('yerbamate');

const TaskStatus = require('../common/task_status');
const TaskTimer = require('../common/timer');

const TaskEvents = new EventEmitter();
TaskTimer(TaskEvents);

class Task {
    constructor(task) {
        this.title = task.name || "";
        this.description = task.description || "";
        this.url = task.url,
        this.idBoard = task.idBoard,
        this.id = task.id || null;        
        this.creationDate = task.creationDate || null;
        this.status = TaskStatus.idle;
        this.beginTime = null;
        this.finishTime = null;
        this.elapsedTime = task.elapsedTime || null;
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
    }

    isRunning() {
        return this.status === TaskStatus.running;
    }

    toJSON() {
        let res = {
            title: this.title,
            description: this.description,
            elapsedTime: this.elapsedTime,
            creationDate: this.creationDate,
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
