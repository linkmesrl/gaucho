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
                }, response => {
                    console.error(response);
                });
        },
        getTrelloBoardByMemberId(memberId) {
            axios.get('https://api.trello.com/1/members/' + memberId + '/boards', { params: params })
                .then(response => {
                    let boards = response.data;
                    this.getTrelloCardsByMemberId(memberId, boards);
                }, response => {
                    console.error(response);
                });
        },
        getTrelloCardsByMemberId(memberId, boards) {
            axios.get('https://api.trello.com/1/members/' + memberId + '/cards', { params: params })
                .then(response => {
                    let suites = boards;
                    let cards = response.data;
                    let i = 0;
                    suites.forEach((suite) => {
                        this.getTrelloListsByBoardId(suite)
                            .then(data => {
                                i++;
                                suite.tasks = [];
                                suite.lists = data;
                                cards.forEach((card) => {
                                    if (card.idBoard === suite.id) {
                                        suite.tasks.push(card);
                                    }
                                });
                                if (i === suites.length) {
                                    suites = suites.filter(function(n){ return n.tasks.length > 0 });
                                    app.BoardsWithCardsReceived(suites);
                                }
                            });
                    });
                }, response => {
                    console.error(response);
                });
        },
        getTrelloListsByBoardId(board) {
            return axios.get('https://api.trello.com/1/boards/' + board.id + '/lists', { params: params })
                .then(response => {
                    return response.data;
                }, response => {
                    console.error(response);
                })
        },
        createTrelloCard(task, listId) {
            task.idList = listId;
            task.token = params.token;
            task.key = params.key;
            axios({
                method: 'post',
                url: 'https://api.trello.com/1/cards',
                data: {
                    idList: listId,
                    name: task.name,
                    desc: task.desc
                },
                params: params
              })
                .then(response => {
                    localStorage.clear();
                    TrelloAuth.checkToken(true);
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
