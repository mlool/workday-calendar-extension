import { formatDateArray, generateICal } from "./ExternalCalendarExportHelper"
import "../ExportImport.css"
import { useState } from "react"
import { ISectionData } from "../../../App/App.types"
import ExportCalendarPopup from "../ExportImportPopups/ExportCalendarPopup"

// Interface for formatting section details into calendar event
export interface Event {
  title: string
  description: string
  location?: string
  recurrenceRule: string
  start: number[]
  end: number[]
}

interface IProps {
  sections: ISectionData[]
}

const ExternalCalendarExport = ({ sections }: IProps) => {
  const [showPopup, setShowPopup] = useState(false)

  // Formats section details into an event and generates download link
  const handleExternalCalendarExport = (
    sections: ISectionData[],
    worklistNumber: number
  ) => {
    // Dictionary to store formatted events grouped by worklist
    const formattedEventsByWorklist: { [worklist: number]: Event[] } = {}

    // Loop through all sections
    for (let i = 0; i < sections.length; i++) {
      // Some classes (Ex. multi term classes) have multiple sectionDetails (one for each term)
      for (let j = 0; j < sections[i].sectionDetails.length; j++) {
        // Save as constants for code readability later
        const days = sections[i].sectionDetails[j].days
        const startTime = sections[i].sectionDetails[j].startTime
        const endTime = sections[i].sectionDetails[j].endTime
        const worklist = sections[i].worklistNumber
        const dateRange = sections[i].sectionDetails[j].dateRange

        // Dictionary of required format
        const dayMap = {
          Mon: "MO",
          Tue: "TU",
          Wed: "WE",
          Thu: "TH",
          Fri: "FR",
        }

        // Map to new format
        const formattedDays = days
          .map((day) => dayMap[day as keyof typeof dayMap])
          .join(",")

        const dateRangesArray = dateRange.split(" - ")

        const startDate = dateRangesArray[0]
        const endDate = dateRangesArray[dateRangesArray.length - 1] // Sometimes for multi term classes you have more than two dates

        const startDateParts = startDate.split("-")
        const baseYear = parseInt(startDateParts[0])
        const baseMonth = parseInt(startDateParts[1])
        let baseDay = parseInt(startDateParts[2])

        const endDateParts = endDate.split("-")
        const endDateArr = [
          parseInt(endDateParts[0]),
          parseInt(endDateParts[1]),
          parseInt(endDateParts[2]),
          23,
          59,
        ]

        // ------------------------------------------------------------------------------------------ //
        // Need to offset if class has a meeting starting a different day
        // Since winter terms start on Tuesdays, if class meets only on mondays, class starts on week 2
        // Will need to find different solution when summer term support is added
        const offsets = { Mon: 6, Tue: 0, Wed: 1, Thu: 2, Fri: 3 }

        const firstDay = days[0]

        if (firstDay !== "Mon") {
          baseDay += offsets[firstDay as keyof typeof offsets]
        } else {
          if (days.length === 1) {
            baseDay += offsets["Mon"]
          } else {
            baseDay += offsets[days[1] as keyof typeof offsets]
          }
        }
        // ------------------------------------------------------------------------------------------ //

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
          sections={sections}
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
