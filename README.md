<p align="center">
  <img src="/public/logo128.png" width="128px" height="128px" alt="Workday Calendar Tool logo">
</p>
<h1 align="center">Workday Calendar Tool</h1>

Welcome to the Workday Calendar Tool! This program is designed to improve your experience with UBC's new Workday system by making it more intuitive and user-friendly.

## Download
Download the latest version from the Chrome Web Store [here](https://chromewebstore.google.com/detail/ubc-workday-side-by-side/gonljejijjjmjccdbjokcmmdfmlincmh).

It can also be manually installed on Firefox [from the latest GitHub Release](https://github.com/mlool/workday-calendar-extension/releases/latest).

Alternatively, to download the latest version, check out our Discord channel `#download-versions`. 

## Community
Join our community and make the most out of the Workday Calendar Tool!
Join the discord channel [here](https://discord.gg/cx93fAJUJf).

## How To Use
1. On the `Find Course Selections` page on workday, buttons should appear on the left hand side. 
2. Click these buttons to add a course to the extension's calendar
3. A preview of where the course will fit in your schedule should appear in the extension's calendar
4. Click either `Confirm ` or `Cancel` to do the respective actions
5. Different worklists and terms can be viewed using the top bar
6. Calendars can be exported and imported to/from JSON by going to `Settings` and then `Export/Import`
7. Calendars can also be exported to `.ics` for Google and Apple calendats using `Export to External Calendar`


## Feature Requests
We value your input! If you have any feature requests, please create an issue.
Before doing so, kindly check to ensure there are no duplicates.

## Collaborators
We welcome new collaborators! To set up the development environment, follow 
the instructions in the following sections.

## Building from source
You will need a reasonably recent version of Node, as well as Yarn. Note that we
use Yarn Classic (latest 1.x) - please do not use Yarn Modern.

1. Clone the repo
   ```bash
   git clone git@github.com:mlool/workday-calendar-extension.git
   ```
2. Navigate to the root directory and install dependencies:
   ```bash
   yarn install
   ```
3. Follow the browser-specific instructions below

### For Chrome
3. Build the project using one of the following commands:
   ```bash
   yarn run build-chrome
   yarn run dev-chrome # watches for file changes and rebuilds accordingly
   ```
4. Go to `chrome://extensions/`
5. Change Chrome to Developer mode on the top right
6. Click `load unpacked` to the top left
7. Select the `public` folder
8. The tool should now appear in your extension menu in Chrome

### For Firefox
3. Build the project using one of the following commands:
   ```bash
   yarn run build-firefox
   yarn run dev-firefox # watches for file changes and rebuilds accordingly
   ```
4. Open Firefox and go to `about:debugging`
5. Select `This Firefox` in the top left
6. Select `Load Temporary Add-on`
7. Upload `public/manifest.json`
8. The tool should now appear in your extension menu in Firefox

See this [Firefox installation demo](./assets/firefox-demo-v1.3.gif).
