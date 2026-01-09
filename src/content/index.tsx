import "./variables.css"
import { createRoot } from "react-dom/client"
import "../index.css"
import App from "./App/App"
import { observeDOMAndAddCopyScheduleButtons } from "../domManipulators/copySchedules"
import { observeDOMAndAddButtons } from "../domManipulators/addSectionButton"
import { initializeAutofill } from "../domManipulators/autoFillCourseSelection"


initializeAutofill()

// Function to set up the observer for DOM changes
function setupObserver(): void {
  // If the document is still loading, add an event listener to observe DOM changes
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", observeDOMAndAddButtons)
    document.addEventListener(
      "DOMContentLoaded",
      observeDOMAndAddCopyScheduleButtons
    )
  } else {
    // Directly observe DOM changes
    observeDOMAndAddButtons()
    observeDOMAndAddCopyScheduleButtons()
  }
}

export function toggleContainer(forceOpen = false) {
  const reactContainer = document.querySelector("#react-container")
  if (!reactContainer) return
  const containerWrapper = reactContainer.parentElement
  const icon = document.getElementById("toggle-icon")
  if (containerWrapper && icon) {
    const isOpen = containerWrapper.style.right === "0px"

    if (isOpen && forceOpen) {
      return
    }

    if (forceOpen || !isOpen) {
      containerWrapper.style.right = "0px"
      icon.textContent = "▶" // Show left arrow when container is open
    } else {
      containerWrapper.style.right = "-305px"
      icon.textContent = "◀" // Show right arrow when container is closed
    }
    // Save the new state to local storage
    chrome.storage.local.set({ drawerOpen: !isOpen }, () => {
      //console.log('Drawer state saved:', !isOpen);
    })
  }
}

// Listen for messages from background script
// to know when user clicks extension
chrome.runtime.onMessage.addListener((message) => {
  if (message.toggleContainer) {
    const reactContainer = document.querySelector("#react-container")
    if (!reactContainer) return
    const containerWrapper = reactContainer.parentElement
    if (containerWrapper) {
      const isOpen = containerWrapper.style.right === "0px"
      toggleContainer(!isOpen)

      // Save the new state to local storage
      chrome.storage.local.set({ drawerOpen: !isOpen }, () => {
        //console.log('Drawer state saved:', !isOpen);
      })
    }
  }
})

setupObserver()

// Read the initial state from storage and adjust UI accordingly
chrome.storage.local.get("drawerOpen", function (data) {
  const containerWrapper = document.createElement("div")
  containerWrapper.style.position = "fixed"
  containerWrapper.style.top = "50%" // Center vertically
  containerWrapper.style.transform = "translateY(-50%)"
  containerWrapper.style.right = data.drawerOpen ? "0px" : "-305px" // Start onscreen or offscreen depending on storage (except for the icon tab)
  containerWrapper.style.zIndex = "1000"
  containerWrapper.style.transition = "right 0.3s"

  const icon = document.createElement("div")
  icon.id = "toggle-icon"
  icon.textContent = data.drawerOpen ? "▶" : "◀" // Initially showing the right arrow
  icon.style.position = "absolute"
  icon.style.top = "50%" // Vertically center on the tab
  icon.style.transform = "translateY(-50%)"
  icon.style.transform = "translateX(-100%)"

  icon.style.width = "30px"
  icon.style.height = "30px"
  icon.style.backgroundColor = "#FFF"
  icon.style.color = "#333"
  icon.style.textAlign = "center"
  icon.style.lineHeight = "30px"
  icon.style.borderRadius = "5px 0px 0px 5px"
  icon.style.border = "1px solid #CCC"
  icon.style.cursor = "pointer"
  icon.style.boxShadow = "0 2px 5px rgba(0,0,0,0.2)"

  const container = document.createElement("div")
  container.id = "react-container"
  container.style.width = "300px"
  container.style.height = "90vh"
  container.style.overflowY = "hidden"
  container.style.backgroundColor = "#FFF"
  container.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)"
  container.style.borderRadius = "8px"
  container.style.maxHeight = "705px"

  containerWrapper.appendChild(icon)
  containerWrapper.appendChild(container)
  document.body.appendChild(containerWrapper)

  icon.addEventListener("click", () => toggleContainer())

  const root = createRoot(container)
  root.render(<App />)
})
