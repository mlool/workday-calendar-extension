import { ISectionData } from "../content/App/App.types"

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
  
    const MassSelectSearchParams = new URLSearchParams()
    MassSelectSearchParams.append("selected", sectionString)
    MassSelectSearchParams.append("additionalParameter", scheduleID)
  
    const massSelectOptions = {
      method: "POST",
      body: MassSelectSearchParams,
      redirect: "follow" as RequestRedirect,
    }
  
    try {
      const massSelectResponse = await fetch(
        "https://wd10.myworkday.com/ubc/mass-select-action/2997$20406/13710$370.htmld",
        massSelectOptions
      )
  
      const massSelectData = await massSelectResponse.json()
  
      const flowControllerSearchParams = new URLSearchParams()
      flowControllerSearchParams.append(
        "_flowExecutionKey",
        massSelectData["flowExecutionKey"]
      )
      flowControllerSearchParams.append("_eventId_submit", "296")
      flowControllerSearchParams.append(
        "sessionSecureToken",
        massSelectData["sessionSecureToken"]
      )
  
      const flowControllerOptions = {
        method: "POST",
        body: flowControllerSearchParams,
        redirect: "follow" as RequestRedirect,
      }
  
      const flowControllerResponse = await fetch(
        "https://wd10.myworkday.com/ubc/flowController.htmld",
        flowControllerOptions
      )
  
      const flowControllerData = await flowControllerResponse.json()
      const errors: string[] = []
      if (flowControllerData["unassociatedErrorNodes"]) {
        for (const error of flowControllerData["unassociatedErrorNodes"]) {
          errors.push(error["message"])
        }
        return errors
      }
  
      return null
    } catch (error) {
      console.error("Error making schedule:", error)
      return null
    }
  }