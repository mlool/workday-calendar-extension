import { ISectionData, Term } from "../App/App.types"
import { convertToMatrix, getEndHour } from "./calendarHelpers"
import "./Calendar.css"
import { useContext } from "react"
import { ModalDispatchContext, ModalPreset } from "../ModalLayer"

interface IProps {
  sections: ISectionData[]
  newSection: ISectionData | null
  currentWorklistNumber: number
  currentTerm: Term
  selectedSection: ISectionData | null
  setSections: (data: ISectionData[]) => void
  setSectionConflict: (state: boolean) => void
  setSelectedSection: (section: ISectionData | null) => void
}

const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"]

const Calendar = ({
  sections,
  newSection,
  currentWorklistNumber,
  setSectionConflict,
  currentTerm,
  setSelectedSection,
}: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext)

  const calendarSections = sections.filter(
    (section) =>
      section.worklistNumber === currentWorklistNumber &&
      (section.term === currentTerm || section.term === Term.winterFull)
  )
  const sectionsToRender = convertToMatrix(
    calendarSections,
    newSection,
    setSectionConflict,
    currentTerm
  )

  const times: string[] = []
  for (let hour = 7; hour <= getEndHour(sectionsToRender); hour++) {
    times.push(`${hour}:00`)
    times.push(`${hour}:30`)
  }

  return (
    <div className="calendar">
      <div className="header">
        <div className="time-marker"></div>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="header-cell">
            {day}
          </div>
        ))}
      </div>
      <div className="body">
        <div className="time-markers">
          {times.map((time, index) => (
            <div
              key={index}
              className={`time-marker ${
                time.endsWith(":30") ? "half-hour" : ""
              }`}
            >
              {time.endsWith(":00") ? time : ""}
            </div>
          ))}
        </div>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="body-column">
            {sectionsToRender[day]?.map((cell, index) => (
              <div
                key={index}
                className="body-cell"
                style={{ backgroundColor: cell.color }}
                onClick={() => {
                  if (cell.sectionContent === null) return
                  setSelectedSection(cell.sectionContent)
                  dispatchModal({
                    preset: ModalPreset.SectionPopup,
                    additionalData: cell.sectionContent,
                  })
                }}
              >
                {cell.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Calendar
