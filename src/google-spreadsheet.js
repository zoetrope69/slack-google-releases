const google = require('googleapis')
const sheets = google.sheets('v4')

let googleCredentials

try {
  googleCredentials = JSON.parse(process.env.GOOGLE_CREDENTIALS)
} catch (e) {
  throw new Error("Couldn't parse the Google credentials from the .env file.")
}

const jwtClient = new google.auth.JWT(
  googleCredentials.client_email, 
  null,
  googleCredentials.private_key,
  ['https://www.googleapis.com/auth/spreadsheets'],
  null
)

const addResultToSpreadsheet = (summary, repo, code, ticket, notes) => {
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
        values: [['' + repo, summary, code, ticket, notes, new Date()]]
      }
    }

    sheets.spreadsheets.values.append(request, (err, response) => {
      if (err) {
        return console.log(err)
      }

      console.log('Release created ', summary)
    })
  })
}

module.exports = {
  addResultToSpreadsheet
}