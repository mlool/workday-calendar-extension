// import { runtime, storage } from 'webextension-polyfill'
// import { getCurrentTab } from '../helpers/tabs'

let portFromContentScript: chrome.runtime.Port | null;

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === "courseHover");
  portFromContentScript = port;
  portFromContentScript.onDisconnect.addListener(() => {
    portFromContentScript = null;
  });
});

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "HOVER" && portFromContentScript) {
    portFromContentScript.postMessage(message.course);
  }
});

// When user clicks on extension button
chrome.action.onClicked.addListener((tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { toggleContainer: true });
  } else {
    console.error("Tab ID is undefined.");
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.declarativeNetRequest.updateDynamicRules({
    addRules: [{
      id: 1,
      priority: 1,
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
        requestHeaders: [{
          header: "Cookie",
          operation: chrome.declarativeNetRequest.HeaderOperation.SET,
          value: "name=value; another_name=another_value;"
        }]
      },
      condition: {
        urlFilter: "*",
        resourceTypes: [
          chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
          chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
          chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
        ]
      }
    }],
    removeRuleIds: [1]
  });
});

export {};
