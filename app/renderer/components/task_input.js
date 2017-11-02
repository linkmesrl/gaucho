"use strict";

const Task = require('../task');
const Material = require('../materialize');

module.exports = {
    props: ['task'],
    data() {
        return {
            title: "",
            description: ""
        };
    },
    template: `
    <div class="task-input-body">
        <div class="input-field">
            <input id="title" type="text" v-model="title">
            <label for="title">Task Title</label>
        </div>
        <div class="input-field">
            <textarea id="description" class="materialize-textarea" v-model="description"></textarea>
            <label>Task description</label>
        </div>
        <div class="row task-input-send-row">
        <button class="btn waves-effect waves-light save-task-button" :disabled="title.length == 0" v-on:click="saveTask">Save
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
            if (this.title && this.description) {
                this.$emit('save', new Task(this));
                this.clear();
            }
        },
        clear() {
            this.title = this.description = "";
            this.$nextTick(() => {
                Material.updateInput();
            });
        },
        onTaskUpdate() {
            if (this.task) {
                this.title = this.task.title;
                this.description = this.task.description;
                this.$nextTick(() => {
                    Material.updateInput();
                });
            }
        }
    }
};
