import { ISectionData } from "../App/App.types"

export interface ScheduleItem {
  text: string
  instanceId: string
}

export async function addCoursesToSavedSchedule(
  sections: ISectionData[],
  scheduleID: string
) {
  let sectionString = ""
  for (const section of sections) {
    sectionString += "15194$" + section.courseID
    if (section !== sections[sections.length - 1]) {
      sectionString += ","
    }
  }
  const urlencoded = new URLSearchParams()
  urlencoded.append("selected", sectionString)
  urlencoded.append("additionalParameter", scheduleID)

  const requestOptions = {
    method: "POST",
    body: urlencoded,
    redirect: "follow" as RequestRedirect,
  }

  return fetch(
    "https://wd10.myworkday.com/ubc/mass-select-action/2997$20406/13710$370.htmld",
    requestOptions
  )
    .then((response) => response.json())
    .then((data) => {
      console.log(data)
      const urlencoded = new URLSearchParams()
      urlencoded.append("_flowExecutionKey", data["flowExecutionKey"])
      urlencoded.append("_eventId_submit", "296")
      urlencoded.append("sessionSecureToken", data["sessionSecureToken"])

      const requestOptions = {
        method: "POST",
        body: urlencoded,
        redirect: "follow" as RequestRedirect,
      }

      return fetch(
        "https://wd10.myworkday.com/ubc/flowController.htmld",
        requestOptions
      )
        .then((response) => response.json())
        .then((data) => {
          const errors: string[] = []
          if (data["unassociatedErrorNodes"]) {
            for (const error of data["unassociatedErrorNodes"]) {
              errors.push(error["message"])
            }
            return errors
          }
          return null
        })
        .catch((error) => {
          console.error("Error with flow controller:", error)
          return null
        })
    })
    .catch((error) => {
      console.error("Error making schedule:", error)
      return null
    })
}

export function getAllSavedScheduleIDs() {
  const selectedItems = document.querySelectorAll(
    '[data-automation-id^="selectedItem_15873"]'
  )

  if (selectedItems.length) {
    const ids = []
    for (let i = 0; i < selectedItems.length; i++) {
      const item = selectedItems[i]
      if (item instanceof HTMLElement && item.dataset.automationId) {
        const idParts = item.dataset.automationId.split("_")
        ids.push(idParts[1])
      }
    }
    return ids
  } else {
    console.error("No SelectedItem elements found")
    return null
  }
}
