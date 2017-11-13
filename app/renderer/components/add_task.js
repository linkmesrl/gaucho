"use strict";

const TrelloApi = require('../../common/trello');
const AppStatus = require('../app_status');
module.exports = {
    data() {
        return {
            task: {
                name: "",
                desc: ""
            },
            selectedListId: null,
            lists: []
        };
    },
    template: `
        <div id="addTaskModal" class="modal">
            <div class="modal-header">
                <h5 class="center-align">Add Task</h5>
            <div class="modal-content">
                <div class="task-input-body">
                    <div class="input-field">
                        <input id="title" type="text" v-model="task.name">
                        <label for="title">Task Title</label>
                    </div>
                    <div class="input-field">
                        <textarea id="description" class="materialize-textarea" v-model="task.desc"></textarea>
                        <label>Task description</label>
                    </div>
                    <div class="input-field">
                        <select id="listSelect">
                            <option v-bind:value="option.id" v-for="option in lists">
                                {{ option.name }}
                            </option>
                        </select>
                        <label>Task List</label>
                    </div>
                    <div class="task-input-send-row">
                        <button class="btn waves-effect waves-light save-task-button" :disabled="task.name.length == 0" v-on:click="addTask">Save
                            <i class="material-icons right">send</i>
                        </button>
                    </div> 
                </div>
            </div>
        </div>
    `,
    methods: {
        addTask() {
            this.selectedListId = $('#listSelect').val();
            TrelloApi.methods.createTrelloCard(this.task, this.selectedListId);
            $('#addTaskModal').modal('close');
        }
    },
    mounted: function () {
        $('select').material_select();
        this.lists = app.suites[AppStatus.activeSuite].lists;
    },
};
