import ExtensionStorage from "../objects/ExtensionStorage"

const getAutomationLabel = (session: string) => {
    switch (session) {
        case "2029W":
            return ["2029-30 UBC-V Academic Year", "2029-30 Winter Term 1 (UBC-V)", "2029-30 Winter Term 2 (UBC-V)"]
        case "2029S":
            return ["2028-29 UBC-V Academic Year", "2028-29 Summer Session (UBC-V)"]
        case "2028W":
            return ["2028-29 UBC-V Academic Year", "2028-29 Winter Term 1 (UBC-V)", "2028-29 Winter Term 2 (UBC-V)"]
        case "2028S":
            return ["2027-28 UBC-V Academic Year", "2028 Summer Session (UBC-V)"]
        case "2027W":
            return ["2027-28 UBC-V Academic Year", "2027-28 Winter Term 1 (UBC-V)", "2027-28 Winter Term 2 (UBC-V)"]
        case "2027S":
            return ["2026-27 UBC-V Academic Year", "2027 Summer Session (UBC-V)"]
        case "2026W":
            return ["2026-27 UBC-V Academic Year", "2026-27 Winter Term 1 (UBC-V)", "2026-27 Winter Term 2 (UBC-V)"]
        case "2026S":
            return ["2025-26 UBC-V Academic Year", "2026 Summer Session (UBC-V)"]
        case "2025W":
            return ["2025-26 UBC-V Academic Year", "2025-26 Winter Term 1 (UBC-V)", "2025-26 Winter Term 2 (UBC-V)"]
        case "2025S":
            return ["2024-25 UBC-V Academic Year", "2025 Summer Session (UBC-V)"]
        case "2024W":
            return ["2024-25 UBC-V Academic Year", "2024-25 Winter Term 1 (UBC-O)", "2024-25 Winter Term 2 (UBC-V)"]
        case "2024S":
            return ["2023-24 UBC-V Academic Year", "2024 Summer Session (UBC-V)"]
        case "2023W":
            return ["2023-24 UBC-V Academic Year", "2023-24 Winter Term 1 (UBC-V)", "2023-24 Winter Term 2 (UBC-V)"]
        case "2023S":
            return ["2022-23 UBC-V Academic Year", "2023 Summer Session (UBC-V)"]
    }
}


function wait(ms: number = 500): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

function waitForElm(
    selector: string,
    index: number,
    timeoutMs: number = 1000
): Promise<Element | null> {
    return new Promise((resolve) => {
        const find = () => {
            const elements = document.querySelectorAll(selector);
            return elements.length > index ? elements[index] : null;
        };

        const existing = find();
        if (existing) return resolve(existing);

        const observer = new MutationObserver(() => {
            const el = find();
            if (el) {
                observer.disconnect();
                clearTimeout(timeoutId);
                resolve(el);
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true,
        });

        const timeoutId = setTimeout(() => {
            observer.disconnect();
            resolve(null);
        }, timeoutMs);
    });
}

async function waitAndClick(
    selector: string,
    index: number = 0,
    timeoutMs: number = 3000
): Promise<boolean> {
    await wait(200);

    const element = await waitForElm(selector, index, timeoutMs);
    if (!element) return false;

    (element as HTMLElement).click();
    return true;
}

function scrollActiveListToBottom(): void {
    const container = document.querySelector(
        '[data-automation-id="activeListContainer"]'
    ) as HTMLElement | null;

    if (!container) return;

    container.scrollTop = container.scrollHeight;
}

// Academic Year in the form of: 2025-26 UBC-V Academic Year"
// Term in the form of: "2025-26 Winter Term 1"
async function findAndClickTerm(academicYear: string, term: string) {
    console.log(`Finding and clicking term ${academicYear} ${term}`)
    await waitAndClick('[data-automation-label="Past Periods"]') // select past periods
    await wait(500)
    scrollActiveListToBottom();
    await wait(500)
    await waitAndClick(`[data-automation-label="${academicYear}"]`)
    await waitAndClick(`[data-automation-label*="${term}"]`)
    await waitAndClick(`[data-automation-id="backButton"]`);
    await waitAndClick(`[data-automation-id="backButton"]`);
    await wait(500)

    await waitAndClick('[data-automation-label="Current Periods"]')
    await waitAndClick(`[data-automation-label="${academicYear}"]`)
    await waitAndClick(`[data-automation-label*="${term}"]`)
    await waitAndClick(`[data-automation-id="backButton"]`);
    await waitAndClick(`[data-automation-id="backButton"]`);
    await wait(500)

    await waitAndClick('[data-automation-label="Future Periods"]')
    await waitAndClick(`[data-automation-label="${academicYear}"]`)
    await waitAndClick(`[data-automation-label*="${term}"]`)
    await waitAndClick(`[data-automation-id="backButton"]`);
    await waitAndClick(`[data-automation-id="backButton"]`);
}

// Function to autofill the menus in "Find Course Sections"
async function startAutoFill() {
    const isAutoFillEnabled = await ExtensionStorage.getIsAutoFillEnabled()
    if (!isAutoFillEnabled) return;

    const currentSession = await ExtensionStorage.getCurrentSession()
    const automationLabel = getAutomationLabel(currentSession)

    if (automationLabel === undefined || automationLabel.length === 0) {
        alert("Failed to find Automation Label, please contact the developers")
        return;
    }


    console.log(`Starting autofill for session ${currentSession}`)

    await waitAndClick('[data-uxi-widget-type="selectinput"]', 0) // open start date dropdown

    if (automationLabel.length === 2) {
        await findAndClickTerm(automationLabel[0], automationLabel[1])
    } else if (automationLabel.length === 3) {
        await findAndClickTerm(automationLabel[0], automationLabel[1])
        await wait(1000)
        await findAndClickTerm(automationLabel[0], automationLabel[2])
    }

    await waitAndClick('[data-automation-id="promptSearchButton"]', 0) // close start date dropdown
    console.log("Autofilling start date complete")

    await waitAndClick('[data-automation-id="multiselectInputContainer"]', 1) // open level dropdown
    await waitAndClick('[data-automation-label="Undergraduate"]') // select Undergraduate
    await waitAndClick('[data-automation-id="promptSearchButton"]', 1) // close level dropdown
    console.log("Autofilling academic level complete")
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
