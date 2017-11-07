"use strict";

class Suite {
    constructor(suite) {
        this.title = suite.name || "";
        this.id = suite.id;
        this.tasks = [];
    }
    
    get length(){
        return this.tasks.length;
    }

    addTask(task) {
        task.creationDate = new Date();
        this.tasks.push(task);
    }

    removeTask(index) {
        this.tasks.splice(index, 1);
    }

    replaceTask(index, task) {
        this.tasks.splice(index, 1, task);
    }

    stopAll() {
        const promises = this.tasks.map((task) => {
            if (!task.isRunning()) return Promise.resolve();
            else {
                return new Promise((resolve) => {
                    task.stop(() => {
                        resolve();
                    });
                });
            }
        });
        return Promise.all(promises);
    }

    runAll() {
        for (const task of this.tasks) {
            if (!task.isRunning()) task.run();
        }
    }

    toJSON() {
        return {
            title: this.title,
            tasks: this.tasks.map((task) => {
                return task.toJSON();
            })
        };
    }
}

module.exports = Suite;
