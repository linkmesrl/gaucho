"use strict";

// const remote = require('electron').remote;
// const consumerKey = remote.getGlobal('trello_consumer_key');
const axios = require('axios');
const consumerKey = 'e2667b0fdf2c31c8f23e3d58d48ca1a3';


module.exports = {
    methods: {
        getTrelloMemberByToken() {
            let trelloToken = localStorage.getItem('token');
            let params = {
                token: trelloToken,
                key: consumerKey
            };
            axios.get('https://api.trello.com/1/tokens/' + trelloToken, { params: params })
                .then(response => {
                    console.log("Member Data", response);
                    this.getTrelloActionsByMemberId(response.data.idMember);                                        
                    this.getTrelloBoardByMemberId(response.data.idMember);                                        
                    this.getTrelloCardsByMemberId(response.data.idMember);
                }, response => {
                    console.error("error");
                });
        },
        getTrelloActionsByMemberId(memberId) {
            axios.get('https://api.trello.com/1/members/' + memberId + '/actions')
            .then(response => {
                console.log("Member Actions", response);
            }, response => {
                console.error("error");
            });
        },
        getTrelloBoardByMemberId(memberId) {
            axios.get('https://api.trello.com/1/members/' + memberId + '/boards')
            .then(response => {
                console.log("Member Boards", response);
            }, response => {
                console.error("error");
            });
        },
        getTrelloCardsByMemberId(memberId) {
            axios.get('https://api.trello.com/1/members/' + memberId + '/cards')
                .then(response => {
                    console.log("Member Cards", response);
                }, response => {
                    console.error("error");
                });
        }
    }
};
