import Browser from "webextension-polyfill"
import fetchProfRating from "../backends/rateMyProf"

let portFromContentScript: chrome.runtime.Port | null

chrome.runtime.onConnect.addListener((port) => {
  console.assert(port.name === "courseHover")
  portFromContentScript = port
  portFromContentScript.onDisconnect.addListener(() => {
    portFromContentScript = null
  })
})

Browser.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "HOVER" && portFromContentScript) {
    portFromContentScript.postMessage(message.course)
  }
  if (message.type === "RMP") {
    fetchProfRating(message.prof, message.isVancouver).then(sendResponse)
    return true
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

export {}
