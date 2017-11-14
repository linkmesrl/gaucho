const key = require('./linkme_google_credentials.json')
const { promisifyAll } = require('bluebird')
const google = require('googleapis')
const sheets = google.sheets('v4')
const spreadsheetId = '1qIB3fYmnlRTOTRrNM5EnwmUY81gMoklOznhK2vlLsF8';//Test Id
const jwtClient = promisifyAll(new google.auth.JWT(
  key.client_email,
  spreadsheetId,
  key.private_key,
  ['https://www.googleapis.com/auth/spreadsheets'], // an array of auth scopes
  null
));

const sheetsClient = promisifyAll(sheets.spreadsheets);
let _this;

module.exports = {
  init() {
    _this = this;
    return jwtClient.authorizeAsync();
  },
  // GET RANGE PARAMS EXAMPLE
  // var params = {
  //   range: 'B2'
  // };
  getRange(params) {
    params.spreadsheetId = spreadsheetId;
    params.auth = jwtClient;
    sheetsClient.values.get(params, function (err, response) {
      if (err) {
        console.error(err);
        return;
      }
      console.log(response);
    });
  },
  // BATCHUPDATE PARAMS EXAMPLE
  // var params = {
  //   resource: {
  //     valueInputOption: "RAW",
  //     data: [
  //       {
  //         range: "A1:B1",
  //         majorDimension: "ROWS",
  //         values: [["1 Gio", "Questo è quanto"]]
  //       }
  //     ]
  //   }
  // };
  batchUpdate(sheetId) {
    let params = {};
    params.resource = {
      requests: [
        {
          repeatCell: {
            range: {
              sheetId: sheetId,
              startRowIndex: 0,
              endRowIndex: 1
            },
            cell: {
              userEnteredFormat: {
                horizontalAlignment: "CENTER",
                textFormat: {
                  fontSize: 10,
                  bold: true
                }
              }
            },
            fields: "userEnteredFormat(textFormat,horizontalAlignment)"
          }
        }, {
          updateDimensionProperties: {
            range: {
              sheetId: sheetId,
              dimension: "COLUMNS",
              startIndex: 0,
              endIndex: 2
            },
            properties: {
              pixelSize: 180
            },
            fields: "pixelSize"
          }
        }, {
          updateDimensionProperties: {
            range: {
              sheetId: sheetId,
              dimension: "COLUMNS",
              startIndex: 2,
              endIndex: 3
            },
            properties: {
              pixelSize: 350
            },
            fields: "pixelSize"
          }
        }
      ]
    };
    params.spreadsheetId = spreadsheetId;
    params.auth = jwtClient;

    sheetsClient.batchUpdate(params, function (err, response) {
      if (err) {
        console.log(err);
        return;
      }
      console.log(response);
    });
  },
  // APPEND PARAMS EXAMPLES
  // var params = {
  //   range: "'sheet1'A1",
  //   values: [[0,2,3]]
  // }
  append(params) {
    sheetsClient.values.append({
      spreadsheetId: spreadsheetId,
      range: params.range,
      valueInputOption: "RAW",
      resource: { values: params.values },
      auth: jwtClient
    }, function (err, result) {
      if (err) {
        console.log(err);
        var sheetTitle = params.range.substring(0, params.range.indexOf('!'));
        _this.addSheet(sheetTitle, params);
      }
    });
  },
  // CREATESHEET PARAMS EXAMPLES
  // var params = {
  //   properties:{
  //       title: "Anything-you-name"
  //   }
  // }
  createSheet(params) {
    sheetsClient.create({
      auth: jwtClient,
      resource: params
    }, (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      } else {
        console.log("Added");
      }
    });
  },
  // ADDSHEET PARAMS EXAMPLES
  // sheetName = string
  addSheet(sheetName, oldReq) {
    sheetsClient.batchUpdate({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [{ 'addSheet': { 'properties': { 'title': sheetName } } }],
      }
    }, (err, response) => {
      if (err) {
        console.log('The API returned an error: ' + err);
        return;
      } else {
        let params = {
          range: sheetName + '' + "!A1:C2",
          values: [["Nome Operatore", "Tempo in Sec", "Nome della card"], oldReq.values[0]]
        }
        _this.append(params);
        _this.batchUpdate(response.replies[0].addSheet.properties.sheetId);
        console.log("Created sheet");
      }
    });
  }
};