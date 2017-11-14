"use strict";

class Suite {
    constructor(suite) {
        this.title = suite.name || "";
        this.id = suite.id;
        this.tasks = suite.tasks || [];
        this.lists = suite.lists || [];
    }
    
    get length(){
        return this.tasks.length;
    }

    replaceTask(index, task) {
        this.tasks.splice(index, 1, task);
    }

    toJSON() {
        return {
            name: this.name,
            tasks: this.tasks.map((task) => {
                return task.toJSON();
            })
        };
    }
}

module.exports = Suite;
