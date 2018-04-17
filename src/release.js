const axios = require('axios')
const debug = require('debug')('slash-command-template:ticket')
const qs = require('querystring')
const users = require('./users')
const { addResultToSpreadsheet } = require('./google-spreadsheet')

const NAMES = {
  'farewill/frontend': 'Frontend',
  'farewill/app': 'API',
  'farewill/pdf': 'PDF',
  'farewill/pulling-data': 'Pulling Data',
  'farewill/hubot': 'Hubot',
  'other': 'Other'
}

const COLOURS = {
  'farewill/frontend': '#fc7e84',
  'farewill/app': '#f8fae4',
  'farewill/pdf': '#f7f38e',
  'farewill/pulling-data': '#bae6e0',
  'farewill/hubot': '#333',
  'other': '#495456'
}

const EMOJIS = {
  'farewill/frontend': '⚰️',
  'farewill/app': '⛪️',
  'farewill/pdf': '📝',
  'farewill/pulling-data': '📊',
  'farewill/hubot': '🤖',
  'other': '',
}

/*
 *  Send ticket creation confirmation via
 *  chat.postMessage to the user who created it
 */
const sendConfirmation = (release) => {
  const fields = [
    {
      title: 'Summary',
      value: release.summary
    }
  ]
  
  if (release.code) {
    fields.push(
      {
        title: 'Code :github:',
        value: release.code,
        short: true
      }
    )
  }
  
  if (release.ticket) {
    fields.push(
      {
        title: 'Ticket :jira:',
        value: release.ticket,
        short: true
      }
    )
  }
  
  let text = ''
  if (release.notes) {
    text += release.notes
  }
  
  
  return axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: process.env.SLACK_CHANNEL_ID,
    link_names: true,
    text,
    attachments: JSON.stringify([
      {
        author_name: release.userProfile.display_name_normalized,
        author_link: '/team/' + release.userProfile.team,
        author_icon: release.userProfile.image_24,
        color: COLOURS[release.repo],
        fields,
        footer: NAMES[release.repo] + ' ' + EMOJIS[release.repo]
      }
    ])
  })).then((result) => {
    addResultToSpreadsheet(
      release.summary, release.repo, release.code, release.ticket, release.notes
    )
  })
}

const create = (userId, submission) => {
  return users.find(userId)
    .then(result => result.data.user.profile)
    .then(userProfile => {
      const release = {
        userId,
        userProfile,
        summary: submission.summary,
        repo: submission.repo,
        code: submission.code,
        ticket: submission.ticket,
        notes: submission.notes
      }

      return sendConfirmation(release)
    })
    .catch(console.error)
}

module.exports = {
  create
}
