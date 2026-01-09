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
        ; (element as HTMLElement).click()
    })
}

// Function to autofill the menus in "Find Course Sections"
async function startAutoFill() {
    console.log("Starting autofill...")

    waitAndClick('[data-uxi-widget-type="selectinput"]', 0) // open start date dropdown
        .then(() => waitAndClick('[data-automation-label="Future Periods"]')) // select future periods
        .then(() =>
            waitAndClick('[data-automation-label="2025-26 UBC-V Academic Year"]')
        ) // select UBC V
        .then(() =>
            waitAndClick(
                '[data-automation-label="2025-26 Winter Term 1 (UBC-V) (2025-09-02-2025-12-05)"]'
            )
        ) // select Winter Term 1
        .then(() =>
            waitAndClick(
                '[data-automation-label="2025-26 Winter Term 2 (UBC-V) (2026-01-05-2026-04-10)"]'
            )
        ) // select Winter Term 2
        .then(() => waitAndClick('[data-automation-id="promptSearchButton"]', 0)) // close start date dropdown
        .then(() => console.log("Autofilling start date complete"))

    waitAndClick('[data-automation-id="multiselectInputContainer"]', 1) // open level dropdown
        .then(() => waitAndClick('[data-automation-label="Undergraduate"]')) // select Undergraduate
        .then(() => waitAndClick('[data-automation-id="promptSearchButton"]', 1)) // close level dropdown
        .then(() => console.log("Autofilling academic level complete"))
}

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
                        if (popup && isCourseSectionsPage) {
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

export function initializeAutofill() {
    const isAutofillEnabled = localStorage.getItem("autofillEnabled") === "true"
    if (isAutofillEnabled) {
        observePopup()
    }
}
