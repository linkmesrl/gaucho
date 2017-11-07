"use strict";

const axios = require('axios');
const consumerKey = 'e2667b0fdf2c31c8f23e3d58d48ca1a3';
const trelloToken = localStorage.getItem('token') || null;
const TrelloAuth = require('../../trello_auth');


let params = {
    token: localStorage.getItem('token'),
    key: consumerKey
};

module.exports = {
    methods: {
        getTrelloMemberByToken() {
            axios.get('https://api.trello.com/1/tokens/' + trelloToken, { params: params })
                .then(response => {
                    console.log("Member Data", response);
                    this.getTrelloActionsByMemberId(response.data.idMember);
                    this.getTrelloBoardByMemberId(response.data.idMember);
                }, response => {
                    console.error(response);
                });
        },
        getTrelloActionsByMemberId(memberId) {
            axios.get('https://api.trello.com/1/members/' + memberId + '/actions', { params: params })
                .then(response => {
                    localStorage.setItem('trelloActions', JSON.stringify(response.data));
                    console.log("Member Actions", response);
                }, response => {
                    console.error(response);
                });
        },
        getTrelloBoardByMemberId(memberId) {
            axios.get('https://api.trello.com/1/members/' + memberId + '/boards', { params: params })
                .then(response => {
                    let boards = response.data;
                    console.log("Member Boards", response);
                    this.getTrelloCardsByMemberId(memberId, boards);
                }, response => {
                    console.error(response);
                });
        },
        getTrelloCardsByMemberId(memberId, boards) {
            axios.get('https://api.trello.com/1/members/' + memberId + '/cards', { params: params })
                .then(response => {
                    console.log("Member Cards", response);
                    let suites = boards;
                    let cards = response.data;
                    suites.forEach(function (suite) {
                        suite.tasks = [];
                        cards.forEach(function (card) {
                            if (card.idBoard === suite.id) {
                                suite.tasks.push(card);
                            }
                        });
                    });
                    app.BoardsWithCardsReceived(suites);
                }, response => {
                    console.error(response);
                });
        },
        trelloLogout() {
            axios.delete('https://api.trello.com/1/tokens/' + params.token + '/?key=' + params.key)
                .then(response => {
                    localStorage.clear();
                    TrelloAuth.checkToken(true);
                }, response => {
                    console.error(response);
                });
        }
    }
};
