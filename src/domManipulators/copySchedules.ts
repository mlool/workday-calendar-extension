import { findCourseInfo } from "../backends/scheduler/nameSearchApi"
import { toggleContainer, handleCourseLoading } from "../content"
import { handleProgressUpdate } from "../backends/scheduler/nameSearchHelpers"
// import { writeNewSection } from "../storage/sectionDataBrowserClient"
import { fetchWorkdayData } from "../backends/workday/idSearchApi"
import { extractIdFromDOM } from "../content/utils"
import { ISectionData } from "../content/App/App.types"
import {
  readSectionData,
  writeSectionData,
} from "../storage/sectionDataBrowserClient"
//-------------------- Copy Saved Schedule and Course Schedule Buttons --------------------

// Function to observe DOM changes and add buttons to matching elements
export function observeDOMAndAddCopyScheduleButtons(): void {
  // Configuration for the mutation observer
  const config: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: false,
  }

  const callback: MutationCallback = (mutationsList) => {
    mutationsList.forEach((mutation) => {
      if (mutation.addedNodes.length > 0) {
        mutation.addedNodes.forEach((node) => {
          if (node instanceof Element) {
            // Find all matching elements using the selector for the saved schedule page
            const matchingElementsSavedSchedule = node.querySelectorAll(
              '[data-automation-id="decorationWrapper"][id="56$381809"] > div'
            )

            // Get the course name element (you might need to adjust the selector)
            const courseNameElement = node.querySelector(
              '[role="presentation"]'
            )

            let counter: number = 0
            matchingElementsSavedSchedule.forEach((matchingElement) => {
              if (courseNameElement) {
                addCopyScheduleButton(
                  courseNameElement,
                  matchingElement,
                  counter,
                  "saved"
                )
                counter++
              }
            })

            const matchingElementCourseSchedule = node.querySelector(
              '[data-automation-id="gridTitleLabel"][title="My Enrolled Courses"]'
            )

            // Only add the one table on the course schedule page
            if (courseNameElement && matchingElementCourseSchedule) {
              addCopyScheduleButton(
                courseNameElement,
                matchingElementCourseSchedule,
                0,
                "course"
              )
            }
          }
        })
      }
    })
  }
  const observer: MutationObserver = new MutationObserver(callback)
  observer.observe(document.body, config)
}

// Function to add a button to a given HTML element
function addCopyScheduleButton(
  element: Element,
  buttonElement: Element,
  counter: number,
  buttonType: string
): void {
  // Creating a button element
  const button: HTMLButtonElement = document.createElement("button")

  // Two options for buttonType are "saved" and
  // Setting the button text content and custom id
  if (buttonType === "saved") {
    button.textContent = "Copy Saved Schedule Into Extension"
    button.id = "add-schedule-button"
  } else if (buttonType === "course") {
    button.textContent = "Copy Course Schedule Into Extension"
    button.id = "import-registered-button"
  } else {
    console.error("Invalid button type")
    return
  }

  // Adding an event listener for when the button is clicked
  button.addEventListener("click", () => {
    if (element === null) {
      alert("No saved schedule found")
      return
    }
    handleCopyScheduleButtonClick(element, counter, buttonType)
  })

  // Styling the button
  button.style.padding = "10px 20px"
  button.style.fontSize = "14px"
  button.style.color = "#fff"
  button.style.backgroundColor = "#007bff" // Blue color
  button.style.boxShadow = "0 0 0 1px #0056b3"
  button.style.cursor = "pointer"
  button.style.marginLeft = "10px"
  button.style.borderRadius = "5px"
  button.style.transition = "all 120ms ease-in"
  button.style.border = "none"
  button.style.outline = "none"
  button.style.textAlign = "center" // Center the text horizontally

  // Adding display flex and align-items center to the button's parent
  const parentElement = buttonElement.parentElement
  if (parentElement) {
    parentElement.style.display = "flex"
    parentElement.style.alignItems = "center"
  }

  // Adding event listeners for mouse enter and leave to change button style
  button.addEventListener("mouseenter", () => {
    button.style.backgroundColor = "#0056b3"
    button.style.boxShadow = "0 0 0 1px #004085"
  })

  button.addEventListener("mouseleave", () => {
    button.style.backgroundColor = "#007bff"
    button.style.boxShadow = "0 0 0 1px #0056b3"
  })

  if (buttonType === "saved") {
    // Inserting the button after the given element
    buttonElement.parentNode?.insertBefore(button, buttonElement.nextSibling)
  } else if (buttonType === "course") {
    // Inserting the button after the last child element
    buttonElement.parentNode?.appendChild(button)
  } else {
    console.error("Invalid button type")
    return
  }
}

async function handleCopyScheduleButtonClick(
  element: Element,
  counter: number,
  buttonType: string
): Promise<void> {
  // Ensure the drawer opens when a button is clicked
  toggleContainer(true)
  handleCourseLoading(true)
  const tables = document.querySelectorAll('[data-automation-id="table"]')

  // Check if table exists
  if (!tables.length) {
    console.error("Tables not found.")
    return
  }

  if (counter < 0 || counter >= tables.length) {
    console.error(
      `Invalid counter value. Valid range: 0 to ${tables.length - 1}`
    )
    return
  }

  const table = tables[counter]

  const tableData: string[][] = []

  const tableRows = table.querySelectorAll("tr")

  tableRows.forEach((row) => {
    const rowData: string[] = []

    const rowCells = row.querySelectorAll("td, th")

    rowCells.forEach((cell) => {
      const cellText = cell.textContent ? cell.textContent.trim() : ""

      rowData.push(cellText)
    })
    tableData.push(rowData)

    for (const cell of rowCells) {
      const courseId = extractIdFromDOM(cell)
      if (courseId) {
        rowData.push(courseId)
        break
      }
    }
  })

  const selectedSections: ISectionData[] = []
  const currentWorklistNumber = (
    await chrome.storage.local.get("currentWorklistNumber")
  ).currentWorklistNumber
  const skippedCourses = []
  for (let i = 2; i < tableData.length; i++) {
    // Change column that course code is being taken from depending on button type
    const code =
      buttonType === "saved"
        ? tableData[i][3].slice(0, tableData[i][3].indexOf(" - "))
        : tableData[i][4].slice(0, tableData[i][4].indexOf(" - "))

    let selectedSection = null
    try {
      if (tableData[i][tableData[i].length - 1] !== "") {
        // eslint-disable-next-line no-await-in-loop
        selectedSection = await fetchWorkdayData(
          tableData[i][tableData[i].length - 1]
        )
      } else {
        // eslint-disable-next-line no-await-in-loop
        selectedSection = await findCourseInfo(code)
      }
    } catch {
      skippedCourses.push(code)
      continue
    }

    if (!selectedSection) {
      console.error("Unable to retrieve selected section")
      continue
    }

    selectedSection.worklistNumber = currentWorklistNumber
    selectedSections.push(selectedSection)
    handleProgressUpdate(((i - 2) / (tableData.length - 2)) * 100)
  }

  if (skippedCourses.length > 0) {
    let message = ""
    skippedCourses.forEach((course) => {
      message = message + ", " + course
    })
    message =
      message +
      " are skipped. This could be due to the course being asynchronus, online, or an error has occured during import. If you think a mistake has happened, don't hesitate to reach out to us through discord. Which can be found in the settings page."
    alert(message)
  }

  const currentSections: ISectionData[] = (await readSectionData()).data
  await writeSectionData(currentSections.concat(selectedSections))
  handleCourseLoading(false)
}
