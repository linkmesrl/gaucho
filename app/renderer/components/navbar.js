"use strict";

const Suite = require('../suite');
const Material = require('../materialize');
const AppStatus = require('../app_status');

const WindowFrameTop = require('./window_frame_top');
const TaskConfig = require('../task_config');

const TrelloApi = require('../../common/trello');
const GoogleApi = require('../../../google_sheets_auth');
GoogleApi.init();

module.exports = {
    props: ['suites'],
    components: {
        "window-frame-top": WindowFrameTop
    },
    data: () => {
        return {
            AppStatus: AppStatus
        };
    },
    template: `
    <div>
        <div class="navbar-fixed">
            <nav class="nav-extended">
                <div class="nav-wrapper">
                    <window-frame-top></window-frame-top>
                    <div class="brand-logo main-logo left">
                    <img class="logo-icon" src="resources/logos/gaucho_logo.png"></img>
                    <a>LinkMe</a>
                    </div>
                    <ul class="right">
                        <li><a v-on:click="logoutTrello"><i class="material-icons unselectable-text">power_settings_new</i></a></li>
                    </ul>
                    <div class="row tabs-row">
                        <ul id="navbar-tabs" class="tabs tabs-transparent">
                            <template v-for="(suite,index) in suites">
                            <li class="tab col s3 unselectable-text">
                                <a draggable="false" v-on:click="onTabSelected(index)" v-bind:href="'#tab'+index" v-bind:class="{ active: index===0 }">
                                    <span class="tab-text">{{suite.title}}</span>
                                </a>
                            </li>
                            </template>
                        </ul>
                    </div>
                </div>
            </nav>
        </div>
    </div>
    `,
    methods: {
        onTabSelected(index) {
            AppStatus.activeSuite = index;
        },
        selectTab(index) {
            if (index >= this.suites.length) index = this.suites.length - 1;
            this.$nextTick(() => {
                Material.selectTab("#navbar-tabs", 'tab' + index);
                AppStatus.activeSuite = index;
            });
        },
        onMenuSelection(selection) {
            this.AppStatus.events.emit(selection);
        },
        logoutTrello() {
            TrelloApi.methods.trelloLogout();
        }
    },
    computed: {
        currentSuite() {
            return this.suites[AppStatus.activeSuite];
        }
    }
};
