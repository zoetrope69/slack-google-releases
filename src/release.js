const axios = require('axios')
const qs = require('querystring')
const users = require('./users')
const { addResultToSpreadsheet } = require('./google-spreadsheet')
const { getProjectByRepo } = require('./projects')

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
  
  const project = getProjectByRepo(release.repo)
  
  return axios.post('https://slack.com/api/chat.postMessage', qs.stringify({
    token: process.env.SLACK_ACCESS_TOKEN,
    channel: process.env.SLACK_CHANNEL_NAME,
    link_names: true,
    text,
    attachments: JSON.stringify([
      {
        author_name: release.userProfile.display_name_normalized,
        author_link: '/team/' + release.userProfile.team,
        author_icon: release.userProfile.image_24,
        color: project.color,
        fields,
        footer: project.name + ' ' + project.emoji
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
