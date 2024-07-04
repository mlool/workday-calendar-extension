import { extractSection } from "./utils"
import { createRoot } from "react-dom/client"
import "../index.css"
import App from "./App/App"
import { observeDOMAndAddCopyScheduleButtons } from "../domManipulators/copySchedules"

// Function to apply visibility based on stored settings
function applyVisibility(hide: boolean): void {
  //console.log('hide? ', hide);

  const selectors = [
    "img.wdappchrome-aax",
    "img.wdappchrome-aaam",
    "img.gwt-Image.WN0P.WF5.WO0P.WJ0P.WK0P.WIEW",
  ]

  const profilePictures = document.querySelectorAll(selectors.join(", "))
  profilePictures.forEach((img) => {
    ;(img as HTMLImageElement).style.visibility = hide ? "hidden" : "visible"
  })
}

// Function to set up a MutationObserver
function observeMutations(hide: boolean): void {
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement
          if (
            element.matches(
              "img.wdappchrome-aax, img.wdappchrome-aaam, img.gwt-Image.WN0P.WF5.WO0P.WJ0P.WK0P.WIEW"
            )
          ) {
            ;(element as HTMLImageElement).style.visibility = hide
              ? "hidden"
              : "visible"
          }
          const nestedImages = element.querySelectorAll(
            "img.wdappchrome-aax, img.wdappchrome-aaam, img.gwt-Image.WN0P.WF5.WO0P.WJ0P.WK0P.WIEW"
          )
          nestedImages.forEach((img) => {
            ;(img as HTMLImageElement).style.visibility = hide
              ? "hidden"
              : "visible"
          })
        }
      })
    })
  })

  observer.observe(document.body, { childList: true, subtree: true })
}

// Function to initialize and set up event listeners
function initializePfpVisibility() {
  // Run applyVisibility on initialization
  const hideProfilePicture =
    localStorage.getItem("hideProfilePicture") === "true"
  applyVisibility(hideProfilePicture)

  // Set up a custom event listener for changes in local storage
  window.addEventListener("hideProfilePictureToggle", (event) => {
    const hide = (event as CustomEvent).detail.enabled
    applyVisibility(hide)
  })

  // Set up MutationObserver
  observeMutations(hideProfilePicture)
}

// Call the initialize function when the content script is loaded
initializePfpVisibility()

function waitForElm(selector: string, index: number) {
  return new Promise((resolve) => {
    const existingElements = document.querySelectorAll(selector)
    if (existingElements.length > index) {
      return resolve(existingElements[index])
    }
    const observer = new MutationObserver(() => {
      const existingElements = document.querySelectorAll(selector)
      if (existingElements.length > index) {
        observer.disconnect()
        resolve(existingElements[index])
      }
    })
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    })
  })
}

function waitAndClick(selector: string, index: number = 0): Promise<void> {
  return waitForElm(selector, index).then((element) => {
    ;(element as HTMLElement).click()
  })
}

// Function to autofill the menus in "Find Course Sections"
async function startAutoFill() {
  console.log("Starting autofill...")

  waitAndClick('[data-uxi-widget-type="selectinputicon"]', 0) // open start date dropdown
    .then(() => waitAndClick('[data-automation-label="Future Periods"]')) // select future periods
    .then(() =>
      waitAndClick('[data-automation-label="2024-25 UBC-V Academic Year"]')
    ) // select UBC V
    .then(() =>
      waitAndClick(
        '[data-automation-label="2024-25 Winter Term 1 (UBC-V) (2024-09-03-2024-12-06)"]'
      )
    ) // select Winter Term 1
    .then(() =>
      waitAndClick(
        '[data-automation-label="2024-25 Winter Term 2 (UBC-V) (2025-01-06-2025-04-08)"]'
      )
    ) // select Winter Term 2
    .then(() => waitAndClick('[data-automation-id="promptSearchButton"]', 0)) // close start date dropdown
    .then(() => console.log("Autofilling start date complete"))

  waitAndClick('[data-automation-id="multiselectInputContainer"]', 1) // open level dropdown
    .then(() => waitAndClick('[data-automation-label="Undergraduate"]')) // select Undergraduate
    .then(() => waitAndClick('[data-automation-id="promptSearchButton"]', 1)) // close level dropdown
    .then(() => console.log("Autofilling academic level complete"))
}

const isAutofillEnabled = localStorage.getItem("autofillEnabled") === "true"
let hasAlreadyAutofilled = false

// Observe the DOM for the "Find Course Sections" popup
function observePopup() {
  const observer = new MutationObserver((mutationsList, observer) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            const popup = node.querySelector(
              '[data-automation-id="editPopup"] [data-automation-id="pageHeaderTitleText"]'
            )
            const isCourseSectionsPage =
              document.title === "Find Course Sections - Workday"
            if (popup && isCourseSectionsPage && !hasAlreadyAutofilled) {
              hasAlreadyAutofilled = true
              startAutoFill()
              observer.disconnect() // Stop observing after the popup is found and autofill is triggered
            }
          }
        })
      }
    })
  })
  // Start observing the entire document for changes
  observer.observe(document.body, { childList: true, subtree: true })
}

function initializeAutofill() {
  if (isAutofillEnabled) {
    observePopup()
  }
}

initializeAutofill()

// Function to add a button to a given HTML element
function addButtonToElement(element: Element, reskinButton?: boolean): void {
  // Creating a button element
  const button: HTMLButtonElement = document.createElement("button")
  // Setting the button text content to '+'
  button.textContent = "+"
  // Add custom button id
  button.id = "add-section-button"
  // Adding an event listener for when the button is clicked
  if (reskinButton) {
    button.addEventListener("click", () => {
      handleButtonClick(element, true)
    })
  } else {
    button.addEventListener("click", () => {
      handleButtonClick(element)
    })
  }

  // Styling the button
  if (reskinButton) {
    button.style.padding = "5px 10px"
  } else {
    button.style.padding = "10px 20px"
  }

  button.style.fontSize = "16px"
  button.style.color = "#333"
  button.style.backgroundColor = "#EEF1F2"
  button.style.boxShadow = "0 0 0 1px #CED3D9"
  button.style.cursor = "pointer"
  button.style.marginRight = "10px"
  if (
    element.previousElementSibling &&
    element.previousElementSibling.getAttribute("data-automation-id") ===
      "checkbox"
  ) {
    button.style.marginLeft = "24px"
  }
  button.style.borderRadius = "5px"
  button.style.transition = "all 120ms ease-in"
  button.style.border = "none"
  button.style.outline = "none"
  button.style.textAlign = "center" // Center the text horizontally

  // Adding display flex and align-items center to the button's parent
  const parentElement = element.parentElement
  if (parentElement) {
    parentElement.style.display = "flex"
    parentElement.style.alignItems = "center"
  }

  // Adding event listeners for mouse enter and leave to change button style
  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#CED3D9"
    button.style.boxShadow = "0 0 0 1px #9DA9AF"
  })

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#EEF1F2"
    button.style.boxShadow = "0 0 0 1px #CED3D9"
  })

  // Inserting the button before the given element
  if (reskinButton && reskinButton === true) {
    element.appendChild(button)
    return
  }
  element.parentNode?.insertBefore(button, element)
}

export const handleCourseLoading = (isLoading: boolean) => {
  const courseLoadingEvent = new CustomEvent("isCourseLoading", {
    detail: {
      isLoading: isLoading,
    },
  })
  document.dispatchEvent(courseLoadingEvent)
}

// Function to handle button click event
async function handleButtonClick(
  element: Element,
  isReskinButton?: boolean
): Promise<void> {
  toggleContainer(true)
  handleCourseLoading(true)
  const selectedSection = await extractSection(
    element,
    isReskinButton !== null && isReskinButton === true
  )
  if (!selectedSection) return
  // Getting existing sections from Chrome storage and adding the new section
  await chrome.storage.local.set({ newSection: selectedSection })
  handleCourseLoading(false)
}

// Function to observe DOM changes and add buttons to matching elements
function observeDOMAndAddButtons(): void {
  // Configuration for the mutation observer
  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: false,
  }

  // Callback function for the mutation observer
  const callback: MutationCallback = (mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            // Finding matching elements within the added node
            const matchingElements = node.querySelectorAll(
              '[data-automation-id="compositeContainer"] > div'
            ) // last time buttons gone, this selector broke
            // Adding buttons to matching elements
            matchingElements.forEach((matchingElement) => {
              // Check if the element already has a button as a previous sibling
              const previousSibling = matchingElement.previousElementSibling
              const isButtonAlreadyPresent =
                previousSibling && previousSibling.id === "add-section-button"
              const isCourseInfo =
                matchingElement.getAttribute("class") === "WMUF WKUF"

              if (!isButtonAlreadyPresent && isCourseInfo) {
                addButtonToElement(matchingElement)
              }
            })
            const matchingElementsForReskinExtension = document
              .getElementById("react-root")
              ?.querySelectorAll("div.AddButtonGoHere")
            matchingElementsForReskinExtension?.forEach((matchingElement) => {
              const matchingElementChild = matchingElement.firstElementChild
              const isButtonAlreadyPresent =
                matchingElementChild &&
                matchingElementChild.id === "add-section-button"
              if (!isButtonAlreadyPresent) {
                addButtonToElement(matchingElement, true)
              }
            })
          }
        })
      }
    })
  }

  // Creating a new mutation observer instance
  const observer: MutationObserver = new MutationObserver(callback)
  // Observing changes to the document body with the specified configuration
  observer.observe(document.body, config)
}

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
