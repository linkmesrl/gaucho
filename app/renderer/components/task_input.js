"use strict";

const Task = require('../task');
const Material = require('../materialize');
const AppStatus = require('../app_status');

module.exports = {
    props: ['task'],
    data() {
        return {
            name: "",
            desc: ""
        };
    },
    template: `
    <div class="task-input-body">
        <div class="input-field">
            <input id="title" type="text" v-model="name">
            <label for="title">Task Title</label>
        </div>
        <div class="input-field">
            <textarea id="description" class="materialize-textarea" v-model="desc"></textarea>
            <label>Task description</label>
        </div>
        <div class="row task-input-send-row">
        <button v-if="!editMode" class="btn waves-effect waves-light save-task-button" :disabled="name.length == 0" v-on:click="saveTask">Save
            <i class="material-icons right">send</i>
        </button>
        <button v-if="editMode" class="btn waves-effect waves-light save-task-button" :disabled="name.length == 0" v-on:click="saveTask">Save
            <i class="material-icons right">send</i>
        </button>
        </div> 
    </div>
    `,
    mounted: function() {
        this.onTaskUpdate();
    },
    watch: {
        task: function() {
            this.onTaskUpdate();
        }
    },
    methods: {
        saveTask() {
            if (this.name && this.desc) {
                this.$emit('save', new Task(this));
                this.clear();
            }
        },
        clear() {
            this.name = this.desc = "";
            this.$nextTick(() => {
                Material.updateInput();
            });
        },
        onTaskUpdate() {
            if (this.task) {
                this.name = this.task.name;
                this.desc = this.task.desc;
                this.$nextTick(() => {
                    Material.updateInput();
                });
            }
        }
    },
    computed: {
        editMode: function() {
            return AppStatus.editMode;
        }
    }
};
