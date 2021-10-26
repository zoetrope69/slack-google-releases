# Slack + Google Sheets releases slash command

Use a slash command in Slack to let everyone know of a new release you've done. Have it also send to Google Sheets to make it easier to search later on.

> This was originally remixed from [https://github.com/slackapi/template-slash-command-and-dialogs](https://github.com/slackapi/template-slash-command-and-dialogs)

## Setup

### 1. Create a Slack app

1. Create an app at api.slack.com/apps
1. Navigate to the OAuth & Permissions page and add the following scopes:
    * `commands`
    * `users:read`
    * `users:read.email`
    * `chat:write:bot`
1. Click 'Save Changes' and install the app at top of th page

### 2. Remix this this project
1. Visit [https://glitch.com/edit/#!/remix/slack-google-releases](https://glitch.com/edit/#!/remix/slack-google-releases)
1. You may want to set your Glitch app to private. Press the top left and then the lock 🔒 button.
1. Set the following environment variables to `.env` (see `.env.sample`):
    * `SLACK_ACCESS_TOKEN`: Your app's `xoxp-` token (available on the Install App page)
    * `SLACK_VERIFICATION_TOKEN`: Your app's Verification Token (available on the Basic Information page)
1. Pick a name for your app and get the URL by pressing 'Show (Live)' in Glitch.

### 3. Add a Slash Command
1. Go back to the app settings and click on Slash Commands.
1. Click the 'Create New Command' button and fill in the following:
    * Command: `/release`
    * Request URL: Glitch URL + /commands (https://[your-glitch-url].glitch.me/commands)
    * Short description: `Let people know about a release`
    * Usage hint: `The summary of your release`
1. Save and reinstall the app
1. Go create a public Slack channel called 'releases'

### 4. Enable Interactive Components
1. Go back to the app settings and click on Interactive Components.
1. Set the Request URL to Glitch URL + /interactive-component (https://[your-glitch-url].glitch.me/interactive-component)

### 5. Get Google credentials
1. Make sure you're using the correct Google account
1. [Go to Google api credentials page](https://console.developers.google.com/apis/credentials)
1. Create a new project
1. Go "Library" and search for "Google Sheets"
1. Select Google Sheets API and "Enable" it for your project
1. Go "Credentials" and then "Create credentials"
1. Choose "Service account key", pick a new service account with a role of 'Project -> Editor', pick 'JSON'. This should download a file.
1. Open, copy and paste it into the `GOOGLE_CREDENTIALS` environment variable. (See `.env.sample` for an example)


### 6. Create a Google sheet 
1. Make sure you're using the correct Google account
1. Create the Google sheet
1. Share the sheet with the email (`client_email`) from the `GOOGLE_CREDENTIALS` data and and give i edit permissions.
1. Rename the sheet at the bottom to 'Releases'
1. Add the columns:
`Repo	Summary	Code	Ticket	Notes	Date`
1. Grab the ID from the URL. For example for this URL: https://docs.google.com/spreadsheets/d/1N-sdhajkdhsa82hd-rWqmkmU4pc/edit#gid=0
the ID is `1N-sdhajkdhsa82hd-rWqmkmU4pc`

### 7. Tweak the app to your organisation

+ In `projects.js` you can change your projects
+ `index.js` handles the Slack dialog, you can tweak the options there
+ `release.js` handles how the Slack attachment is created
+ `google-spreadsheet.js` handles everything going to the Google Sheet

## Notes

+ Do /release anywhere and it'll post to #releases
+ You can fiddle with your Slack app and make it look prettier.
