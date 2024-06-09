<p align="center">
  <img src="/public/logo128.png" width="128px" height="128px" alt="LectureSurfers logo">
</p>
<h1 align="center">Workday Calendar Tool</h1>

This program is made to counter the highly unintuitive and frustrating experience with UBC's new workday system!

## Getting the extension
Our extension is available on the Chrome Web Store: 

https://chromewebstore.google.com/detail/ubc-workday-side-by-side/gonljejijjjmjccdbjokcmmdfmlincmh?pli=1

Check out the latest releases on the discord channel `#download-versions`.

Our Discord server is linked below. Please join!

## How to use

1. Go to workday course view page
2. Right click on title of course => Copy Text => Paste it into the Title field
3. Right click on Section Details => Copy Text => Paste it into Section Details field
4. The orange mark is the newly added section, verify for conflicts
5. Click add section to add it to the table
6. Click clear to clear calendar completely

## Collaborators
Join the discord channel: https://discord.gg/cx93fAJUJf

We have channels for feature requests, bug reports, announcements, and more!

You may also submit feature requests or bug reports by opening a GitHub issue, as long as there are no duplicates. 

## Feature Requests
Feel free to create issues for any feature requests or bug reports, 
as long as there are no duplicate issues.

## Building manually for Chrome

1. Clone the repo
2. Run `yarn install` and then `yarn run build` in the root directory
3. Go to `chrome://extensions/`
4. Change Chrome to Developer mode on the top right
5. Click `load unpacked` to the top left
6. Select the downloaded `build` folder
7. The tool should now appear in your extension menu in chrome

## Building manually for Firefox
We recommend downloading a pre-built Firefox release from `#download-versions`. But you can follow the steps below to create a build yourself.

1. Clone the repo 
2. Run `yarn install` and then `yarn run build` in the root directory
3. Replace `manifest.json` with the Firefox-compatible version: `cp firefox-manifest.json build/manifest.json`

## Installing on Firefox
1. Open Firefox and go to `about:debugging`
2. Select `This Firefox` in the top left
3. Select `Load Temporary Add-on`
4. Upload `build/manifest.json`

See this [Firefox installation demo](./public/firefox-demo-v1.3.gif)
