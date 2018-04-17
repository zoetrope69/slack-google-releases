require('dotenv').config();

const axios = require('axios');
const express = require('express');
const bodyParser = require('body-parser');
const qs = require('querystring');
const release = require('./release');
const debug = require('debug')('slash-command-template:index');

const app = express();

/*
 * Parse application/x-www-form-urlencoded && application/json
 */
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('');
});

/*
 * Endpoint to receive /helpdesk slash command from Slack.
 * Checks verification token and opens a dialog to capture more info.
 */
app.post('/commands', (req, res) => {
  const { token, text, trigger_id } = req.body;

  // check that the verification token matches expected value
  if (token !== process.env.SLACK_VERIFICATION_TOKEN) {
    debug('Verification token mismatch')
    res.sendStatus(500)
  }

  // create the dialog payload - includes the dialog structure, Slack API token,
  // and trigger ID
  const dialog = {
    token: process.env.SLACK_ACCESS_TOKEN,
    trigger_id,
    dialog: JSON.stringify({
      title: 'Submit a new release',
      callback_id: 'submit-ticket',
      submit_label: 'Submit',
      elements: [
        {
          label: 'Summary',
          type: 'text',
          name: 'summary',
          value: text,
          hint: 'Brief summary of the release',
        },
        {
          label: 'Repo',
          type: 'select',
          name: 'repo',
          options: [
            { label: 'Frontend', value: 'farewill/frontend' },
            { label: 'API', value: 'farewill/app' },
            { label: 'PDF', value: 'farewill/pdf' },
            { label: 'Pulling Data', value: 'farewill/pulling-data' },
            { label: 'Hubot', value: 'farewill/hubot' },
            { label: 'Other', value: 'other' },
          ],
        },
        {
          label: 'Code URL',
          type: 'text',
          name: 'code',
          hint: 'Link to GitHub pull-request or commit',
          optional: true
        },
        {
          label: 'Ticket URL',
          type: 'text',
          name: 'ticket',
          hint: 'Link to the JIRA ticket',
          optional: true
        },
        {
          label: 'Notes',
          type: 'textarea',
          name: 'notes',
          hint: 'Who did you work with? Who should know about this? Anything else?',
          optional: true
        },
      ],
    }),
  };

  // open the dialog by calling dialogs.open method and sending the payload
  axios.post('https://slack.com/api/dialog.open', qs.stringify(dialog))
    .then(result => {
      debug('dialog.open: %o', result.data);
      res.send('');
    }).catch(err => {
      debug('dialog.open call failed: %o', err);
      res.sendStatus(500);
    });
});

/*
 * Endpoint to receive the dialog submission. Checks the verification token
 * and creates a Helpdesk ticket
 */
app.post('/interactive-component', (req, res) => {
  const body = JSON.parse(req.body.payload)

  // check that the verification token matches expected value
  if (body.token !== process.env.SLACK_VERIFICATION_TOKEN) {
    debug('Token mismatch')
    res.sendStatus(500)
  }

  debug(`Form submission received: ${body.submission.trigger_id}`)

  // immediately respond with a empty 200 response to let
  // Slack know the command was received
  res.send('')
  
  release.create(body.user.id, body.submission)
});

app.listen(process.env.PORT, () => {
  console.log(`App listening on port ${process.env.PORT}!`)
});
