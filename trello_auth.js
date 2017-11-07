const request = require('request');
const querystring = require('querystring');

const CONSUMER_KEY = 'e2667b0fdf2c31c8f23e3d58d48ca1a3';
const CONSUMER_SECRET = '3b6b2ab0d8d2dfcbf97a06124e078e6ced090b4d57515f09e133a7c3c47f6615';
const ACCESS_TOKEN_URL = 'https://trello.com/1/OAuthGetAccessToken';
const AUTHORIZE_TOKEN_URL = 'https://trello.com/1/OAuthAuthorizeToken/?oauth_token=';
const REQUEST_TOKEN_URL = 'https://trello.com/1/OAuthGetRequestToken?oauth_callback=electroauth://storetoken';


//Checks if the access token is in local storage, if not, makes a request for it
function checkToken() {
  const { getCurrentWindow } = require('electron').remote;
  localStorage.clear()
  if (localStorage.getItem('token')) {
    getCurrentWindow().loadURL(`file://${__dirname}/content.html`)
  } else {
    //the request module provides a way to make OAuth requests easily
    const oauth = { consumer_key: CONSUMER_KEY, consumer_secret: CONSUMER_SECRET };
    request.post({ url: REQUEST_TOKEN_URL, oauth: oauth }, (e, r, body) => {
      const req_data = querystring.parse(body);
      localStorage.setItem('token_secret', req_data.oauth_token_secret);
      document.getElementById('webview').setAttribute("src", AUTHORIZE_TOKEN_URL + req_data.oauth_token);
    });
  }

}

//gets the access token and stores it to local storage
function storeToken(urlQuery, targetWindow) {
  const verify_data = querystring.parse(urlQuery);
  targetWindow.webContents.executeJavaScript('localStorage.getItem("token_secret")', true)
    .then((result) => {
      let token_secret = result;
      const oauth = {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        token: verify_data.oauth_token,
        token_secret: token_secret,
        verifier: verify_data.oauth_verifier,
      };
      request.post({ url: ACCESS_TOKEN_URL, oauth: oauth }, (e, r, body) => {
        const token_data = querystring.parse(body);
        targetWindow.webContents.executeJavaScript(
          `localStorage.setItem('token', "${token_data.oauth_token}");
           localStorage.setItem('token_secret', "${token_data.oauth_token_secret}");`, false)
          .then((result) => {
            targetWindow.loadURL(`file://${__dirname}/content.html`);
          })
      });
    });
}
module.exports = { checkToken: checkToken, storeToken: storeToken };
