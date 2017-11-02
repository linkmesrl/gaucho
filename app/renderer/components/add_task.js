"use strict";

const TaskInput = require('./task_input');

module.exports = {
    data() {
        return {
            title: "",
            description: ""
        };
    },
    template: `
        <div id="addTaskModal" class="modal">
            <div class="modal-header">
                <h5 class="center-align">Add Task</h5>
            <div class="modal-content">
                <task-input v-on:save="addTask"></task-input>
            </div>
        </div>
    `,
    methods: {
        addTask(task) {
            this.$emit('add', task);
            $('#addTaskModal').modal('close');
        }
    },
    components: {
        "task-input": TaskInput
    }
};
