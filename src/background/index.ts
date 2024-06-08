// import { runtime, storage } from 'webextension-polyfill'
// import { getCurrentTab } from '../helpers/tabs'

let portFromContentScript: chrome.runtime.Port | null;

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === 'courseHover');
  portFromContentScript = port;
  portFromContentScript.onDisconnect.addListener(() => {
    portFromContentScript = null;
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'HOVER' && portFromContentScript) {
    portFromContentScript.postMessage(message.course);
  }
});

// When user clicks on extension button
chrome.action.onClicked.addListener((tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { toggleContainer: true });
  } else {
    console.error('Tab ID is undefined.');
  }
});

// Add context menu item
chrome.contextMenus.create({
  id: 'workdayCalendar',
  title: 'View Workday Calendar',
  contexts: ['all'],
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'workdayCalendar' && tab?.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { toggleContainer: true });
  } else {
    console.error('Tab ID is undefined or context menu item ID does not match.');
  }
});

export {};
