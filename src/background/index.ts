// import { runtime, storage } from 'webextension-polyfill'
// import { getCurrentTab } from '../helpers/tabs'
let portFromContentScript: chrome.runtime.Port | null

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === "courseHover")
  portFromContentScript = port
  portFromContentScript.onDisconnect.addListener(() => {
    portFromContentScript = null
  })
})

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === "HOVER" && portFromContentScript) {
    portFromContentScript.postMessage(message.course)
  }
})

// When user clicks on extension button
chrome.action.onClicked.addListener((tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.sendMessage(tab.id, { toggleContainer: true })
  } else {
    console.error("Tab ID is undefined.")
  }
})

chrome.runtime.onInstalled.addListener(() => {
  ;(async () => {
    // Get existing cookies
    const cookiePromise = new Promise<string | undefined>((resolve) => {
      chrome.cookies.getAll({ url: "https://*.myworkday.com/*" }, (cookies) => {
        if (!cookies) {
          resolve(undefined)
          return
        }

        let cookieHeader = ""
        for (const cookie of cookies) {
          cookieHeader += `${cookie.name}=${cookie.value}; `
        }
        resolve(cookieHeader.trim())
      })
    })

    try {
      // Wait for the cookie promise to resolve
      const cookieHeader = await cookiePromise

      if (!cookieHeader) {
        // Handle case where no cookies were retrieved (optional)
        return
      }

      // Update dynamic rules with the retrieved cookie header
      chrome.declarativeNetRequest.updateDynamicRules({
        addRules: [
          {
            id: 1,
            priority: 1,
            action: {
              type: chrome.declarativeNetRequest.RuleActionType.MODIFY_HEADERS,
              requestHeaders: [
                {
                  header: "Cookie",
                  operation: chrome.declarativeNetRequest.HeaderOperation.SET,
                  value: cookieHeader,
                },
              ],
            },
            condition: {
              urlFilter: "https://*.myworkday.com/*",
              resourceTypes: [
                chrome.declarativeNetRequest.ResourceType.MAIN_FRAME,
                chrome.declarativeNetRequest.ResourceType.SUB_FRAME,
                chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST,
              ],
            },
          },
        ],
      })
    } catch (error) {
      console.error("Error retrieving cookies:", error)
    }
  })()
})

chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    if (
      details.url.includes(
        "https://wd10.myworkday.com/ubc/task/1422$5132.htmld?clientRequestID="
      ) &&
      details.requestHeaders
    ) {
      const hasExistingFlag = details.requestHeaders.some(
        (header) => header.name.toLowerCase() === "flag" && header.value === "1"
      )

      if (hasExistingFlag) {
        return
      }

      const newClientRequestId = crypto.randomUUID().replace("-", "")
      const newUrl = `https://wd10.myworkday.com/ubc/task/1422$5132.htmld?clientRequestID=${newClientRequestId}`
      console.log("Forwarding request to:", newUrl)
      const headers = new Headers()
      headers.append("flag", "1")

      fetch(newUrl, {
        method: "GET",
        headers: headers,
      })
        .then((response) => response.json())
        .then((data) => {
          try {
            const rawContextId = data["pageContextId"]
            const contextIdNum = parseInt(rawContextId.substring(1)) + 1 //increment to account for flow controller after

            chrome.storage.local.set({ contextId: contextIdNum })
          } catch (error) {
            console.error("Error parsing context id:", error)
            return null
          }
        })
        .catch((error) => console.error("Error forwarding request:", error))
    }
  },
  { urls: ["<all_urls>"] },
  ["requestHeaders", "extraHeaders"]
)

export {}
