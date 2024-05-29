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
  if (message.type === 'HOVER' && portFromContentScript) {
    portFromContentScript.postMessage(message.course);
  }
});

export {}