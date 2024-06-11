<p align="center">
  <img src="/public/logo128.png" width="128px" height="128px" alt="Workday Calendar Tool logo">
</p>
<h1 align="center">Workday Calendar Tool</h1>

Welcome to the Workday Calendar Tool! This program is designed to improve your experience with UBC's new Workday system by making it more intuitive and user-friendly.

## Download
Download the latest version from the Chrome Web Store [here](https://chromewebstore.google.com/detail/ubc-workday-side-by-side/gonljejijjjmjccdbjokcmmdfmlincmh).

It's also released on Firefox [here](https://addons.mozilla.org/en-GB/firefox/addon/ubc-workday-calendar).

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

## Building manually for Chrome

1. Clone the repo
   ```bash
   git clone <repository_url>
   ```
2. Navigate to the root directory and install dependencies:
   ```bash
   yarn install
   ```
3. Build the project:
   ```bash
   yarn run build
   ```
4. Go to `chrome://extensions/`
5. Change Chrome to Developer mode on the top right
6. Click `load unpacked` to the top left
7. Select the downloaded `build` folder
8. The tool should now appear in your extension menu in chrome

## Building manually for Firefox

1. Clone the repo
   ```bash
   git clone <repository_url>
   ```
2. Navigate to the root directory and install dependencies:
   ```bash
   yarn install
   ```
3. Build the project:
   ```bash
   yarn run build
   ```
4. Replace `manifest.json` with the Firefox-compatible version:
  ```bash
   cp firefox-manifest.json build/manifest.json
   ```
5. Open Firefox and go to `about:debugging`
6. Select `This Firefox` in the top left
7. Select `Load Temporary Add-on`
9. Upload `build/manifest.json`
10. The tool should now appear in your extension menu in chrome

See this [Firefox installation demo](./public/firefox-demo-v1.3.gif).
