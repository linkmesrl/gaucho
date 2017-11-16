const request = require('request');
const querystring = require('querystring');
const remote = require('electron').remote;

//Checks if the access token is in local storage, if not, makes a request for it
function checkToken(redirectRequired) {
  let GlobalKeys = remote.getGlobal('keysConfig');
  let { getCurrentWindow } = require('electron').remote;
  if (localStorage.getItem('token')) {
    getCurrentWindow().loadURL(`file://${__dirname}/content.html`)
  } else {    
    if(redirectRequired){
      getCurrentWindow().loadURL(`file://${__dirname}/index.html`);
    }
    //the request module provides a way to make OAuth requests easily
    let oauth = { consumer_key: GlobalKeys.customer_key, consumer_secret: GlobalKeys.customer_secret };
    request.post({ url: GlobalKeys.request_token_url, oauth: oauth }, (e, r, body) => {
      let req_data = querystring.parse(body);
      localStorage.setItem('token_secret', req_data.oauth_token_secret);
      document.getElementById('webview').setAttribute("src", GlobalKeys.authorize_token_url + req_data.oauth_token);
    });
  }
}

//gets the access token and stores it to local storage
function storeToken(urlQuery, targetWindow) {
  let GlobalKeys = global.keysConfig;
  let verify_data = querystring.parse(urlQuery);
  targetWindow.webContents.executeJavaScript('localStorage.getItem("token_secret")', true)
    .then((result) => {
      let token_secret = result;
      let oauth = {
        consumer_key: GlobalKeys.customer_key,
        consumer_secret: GlobalKeys.customer_secret,
        token: verify_data.oauth_token,
        token_secret: token_secret,
        verifier: verify_data.oauth_verifier,
      };
      request.post({ url: GlobalKeys.access_token_url, oauth: oauth }, (e, r, body) => {
        let token_data = querystring.parse(body);
        targetWindow.webContents.executeJavaScript(
          `localStorage.setItem('token', "${token_data.oauth_token}");
           localStorage.setItem('token_secret', "${token_data.oauth_token_secret}");`, true)
          .then((result) => {
            targetWindow.loadURL(`file://${__dirname}/content.html`);
          })
      });
    });
}


module.exports = { checkToken: checkToken, storeToken: storeToken };
