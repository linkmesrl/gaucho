const remote = require('electron').remote;
const { promisifyAll } = require('bluebird');
const google = require('googleapis');
const sheets = google.sheets('v4');
const GlobalKeys = remote.getGlobal('keysConfig');
const spreadsheetId = GlobalKeys.spreadsheet_id;
const jwtClient = promisifyAll(new google.auth.JWT(
  GlobalKeys.client_email,
  spreadsheetId,
  GlobalKeys.private_key,
  ['https://www.googleapis.com/auth/spreadsheets'], // an array of auth scopes
  null
));

const sheetsClient = promisifyAll(sheets.spreadsheets);

module.exports = {
  init() {
    return jwtClient.authorizeAsync();
  },
  // GET RANGE PARAMS EXAMPLE
  // let params = { range: 'B2' };
  getRange(params) {
    params.spreadsheetId = spreadsheetId;
    params.auth = jwtClient;
    sheetsClient.values.get(params, (err, response) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log(response);
    });
  },
  // BATCHUPDATE PARAMS EXAMPLE
  // sheetId = id of the target sheet
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

    sheetsClient.batchUpdate(params, (err, response) => {
      if (err) {
        console.log(err);
        return;
      }
      console.log(response);
    });
  },
  // APPEND PARAMS EXAMPLES
  // let params = {
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
    }, (err, result) => {
      if (err) {
        console.log(err);
        let sheetTitle = params.range.substring(0, params.range.indexOf('!'));
        this.addSheet(sheetTitle, params);
      }
    });
  },
  // CREATESHEET PARAMS EXAMPLES
  // let params = {
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
  // sheetName = string && oldReq = append params or 
  addSheet(sheetName, oldReq) {
    sheetsClient.batchUpdate({
      auth: jwtClient,
      spreadsheetId: spreadsheetId,
      resource: {
        requests: [{ addSheet: { properties: { title: sheetName } } }],
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
        this.append(params);
        this.batchUpdate(response.replies[0].addSheet.properties.sheetId);
      }
    });
  }
};