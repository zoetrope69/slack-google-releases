const google = require('googleapis');
const sheets = google.sheets('v4');

const jwtClient = new google.auth.JWT(
  process.env.GOOGLE_CLIENT_EMAIL, 
  null,
  JSON.parse(process.env.GOOGLE_PRIVATE_KEY).key,
  ['https://www.googleapis.com/auth/spreadsheets'],
  null
)

const addResultToSpreadsheet = (desc, repo, code, ticket, notes) => {
  jwtClient.authorize((err, tokens) => {
    if (err) {
      console.log(err)
      return
    }

    const request = {
      auth: jwtClient,
      spreadsheetId: process.env.GOOGLE_SHEETS_ID,
      range: "'Releases'!A1:F1",
      valueInputOption: 'RAW',
      resource: {
        range: "'Releases'!A1:F1",
        majorDimension: "ROWS",
        values: [['' + repo, desc, code, ticket, notes, new Date()]]
      }
    }

    sheets.spreadsheets.values.append(request, (err, response) => {
      if (err) {
        return console.log(err)
      }

      console.log(JSON.stringify(response, null, 2))
    })
  })
}

module.exports = {
  addResultToSpreadsheet
}