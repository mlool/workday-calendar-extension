import {
  calculateRealCourseStartDate,
  formatDateArray,
  generateICal,
  WEEKDAY_TO_RAW_WEEKDAY,
  WORKDAY_TO_ICS_WEEKDAY_MAP,
} from "../../../storage/helpers/icsUtils"
import "./ExportImport.css"
import { useState } from "react"
import ExportCalendarPopup from "./ExportImportPopups/ExportCalendarPopup"
import { convertVancouverDateStringToDate } from "../../../storage/helpers/vancouverDatetimeUtils"
import { readSectionData } from "../../../storage/sectionStorage"
import { postAlertIfHasErrors } from "../../../storage/errors"

// Interface for formatting section details into calendar event
export interface Event {
  title: string
  description: string
  location?: string
  recurrenceRule: string
  start: number[]
  end: number[]
}

const ExternalCalendarExport = () => {
  const [showPopup, setShowPopup] = useState(false)

  // Formats section details into an event and generates download link
  const handleExternalCalendarExport = async (worklistNumber: number) => {
    const res = await readSectionData()
    postAlertIfHasErrors(res)
    const sections = res.data
    // Dictionary to store formatted events grouped by worklist
    const formattedEventsByWorklist: { [worklist: number]: Event[] } = {}

    // Loop through all sections
    for (let i = 0; i < sections.length; i++) {
      // Some classes (Ex. multi term classes) have multiple sectionDetails (one for each term)
      for (let j = 0; j < sections[i].sectionDetails.length; j++) {
        // Save as constants for code readability later
        const days = sections[i].sectionDetails[j].days as Array<
          keyof typeof WEEKDAY_TO_RAW_WEEKDAY
        >
        const startTime = sections[i].sectionDetails[j].startTime
        const endTime = sections[i].sectionDetails[j].endTime
        const worklist = sections[i].worklistNumber
        const dateRange = sections[i].sectionDetails[j].dateRange

        // Map to new format
        const formattedDays = days
          .map(
            (day) =>
              WORKDAY_TO_ICS_WEEKDAY_MAP[
                day as keyof typeof WORKDAY_TO_ICS_WEEKDAY_MAP
              ]
          )
          .join(",")

        const dateRangesArray = dateRange.split(" - ")

        const startDate = dateRangesArray[0]
        const workdayStartDate = convertVancouverDateStringToDate(startDate)
        const endDate = dateRangesArray[dateRangesArray.length - 1] // Sometimes for multi term classes you have more than two dates

        const startDateParts = startDate.split("-")
        const baseYear = parseInt(startDateParts[0])
        const baseMonth = parseInt(startDateParts[1])
        let baseDay = parseInt(startDateParts[2])
        baseDay += calculateRealCourseStartDate(workdayStartDate, days)

        const endDateParts = endDate.split("-")
        const endDateArr = [
          parseInt(endDateParts[0]),
          parseInt(endDateParts[1]),
          parseInt(endDateParts[2]),
          23,
          59,
        ]

        // Split start and endtimes into useable format
        const [startHourString, startMinuteString] = startTime.split(":")

        const startHour = parseInt(startHourString)
        const startMinute = parseInt(startMinuteString)

        const [endHourString, endMinuteString] = endTime.split(":")

        const endHour = parseInt(endHourString)
        const endMinute = parseInt(endMinuteString)

        // Create event
        const event: Event = {
          title: sections[i].code,
          description: sections[i].name,
          recurrenceRule:
            "FREQ=WEEKLY;BYDAY=" +
            formattedDays +
            ";INTERVAL=1;UNTIL=" +
            formatDateArray(endDateArr),
          start: [baseYear, baseMonth, baseDay, startHour, startMinute],
          end: [baseYear, baseMonth, baseDay, endHour, endMinute],
        }

        if (worklist === worklistNumber) {
          if (
            !Object.prototype.hasOwnProperty.call(
              formattedEventsByWorklist,
              worklist
            )
          ) {
            formattedEventsByWorklist[worklist] = []
          }
          formattedEventsByWorklist[worklist].push(event)
        }
      }
    }

    // Loop through formatted events grouped by worklist
    for (const worklist in formattedEventsByWorklist) {
      const eventsForWorklist = formattedEventsByWorklist[worklist]
      // Generate ICS string for this worklist's events
      const calendarString = generateICal(eventsForWorklist)
      // Convert string to downloadable blob
      const blob = new Blob([calendarString], {
        type: "text/calendar;charset=utf-8",
      })
      const url = URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = `worklist_${worklist}.ics` // Download filename with worklist number

      link.click()

      URL.revokeObjectURL(url)
    }

    toggleWorklistButtons()
  }

  const toggleWorklistButtons = () => {
    setShowPopup(!showPopup)
  }

  return (
    <div>
      {showPopup && (
        <ExportCalendarPopup
          onCancel={() => setShowPopup(false)}
          exportFunction={handleExternalCalendarExport}
        />
      )}
      <div className="ExportImportButton" onClick={toggleWorklistButtons}>
        Export To External Calendar
      </div>
    </div>
  )
}

export default ExternalCalendarExport
