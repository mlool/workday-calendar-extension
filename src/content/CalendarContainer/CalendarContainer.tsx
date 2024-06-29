import { ISectionData, Term_String_Map, Term } from "../App/App.types"
import Calendar from "../Calendar/Calendar"
import { CellFormat, convertToMatrix } from "../Calendar/calendarHelpers"
import "./CalendarContainer.css"

interface IProps {
  sections: ISectionData[]
  newSection: ISectionData | null
  currentWorklistNumber: number
  currentTerm: Term
  selectedSection: ISectionData | null
  setCurrentWorklistNumber: (num: number) => void
  setSections: (data: ISectionData[]) => void
  setSectionConflict: (state: boolean) => void
  setCurrentTerm: (term: Term) => void
  setSelectedSection: (section: ISectionData | null) => void
}

const CalendarContainer = ({
  sections,
  newSection,
  currentWorklistNumber,
  setSections,
  setSectionConflict,
  setCurrentWorklistNumber,
  currentTerm,
  setCurrentTerm,
  selectedSection,
  setSelectedSection,
}: IProps) => {
  const WORKLISTCOUNT = [0, 1, 2, 3]
  const TERMS = [Term.winterOne, Term.winterTwo]

  const getBackgroundColour = (term: Term): string => {
    if (currentTerm === term) {
      return "#9ce8ff"
    } else if (newSection?.term === Term.winterFull) {
      return "#ffa500" //If not selected term, but newSection term is winterFull, orange to indicate course in other term also
    } else if (newSection !== null) {
      return "#f7faff" //Gray out if section selected & not correct term
    } else {
      return ""
    }
  }

  const getSectionMatrix = (term: Term) => {
    const calendarSectionsTermOne = sections.filter(
      (section) =>
        section.worklistNumber === currentWorklistNumber &&
        (section.term === Term.winterOne || section.term === Term.winterFull)
    )

    const calendarSectionsTermTwo = sections.filter(
      (section) =>
        section.worklistNumber === currentWorklistNumber &&
        (section.term === Term.winterTwo || section.term === Term.winterFull)
    )

    const sectionsToRenderTermOne = convertToMatrix(
      calendarSectionsTermOne,
      newSection,
      Term.winterOne
    )

    const sectionsToRenderTermTwo = convertToMatrix(
      calendarSectionsTermTwo,
      newSection,
      Term.winterTwo
    )

    setSectionConflict(sectionsToRenderTermOne[0] || sectionsToRenderTermTwo[0])
    return term === Term.winterOne
      ? sectionsToRenderTermOne[1]
      : sectionsToRenderTermTwo[1]
  }

  const canSwitchTerms = (): boolean => {
    let rsf = true
    if (newSection !== null) {
      rsf = false //False if we have a section selected
    }

    if (newSection?.term === Term.winterFull) {
      rsf = true //But if our term is winterFull, then we should allow switching term no matter what
    }
    return rsf
  }

  const getFontColor = (term: Term): string => {
    if (currentTerm === term) {
      return "black"
    } else if (newSection?.term === Term.winterFull) {
      return "black" //black still
    } else if (newSection !== null) {
      return "#d4d4d4" //Gray out if section selected & not correct term
    } else {
      return ""
    }
  }

  return (
    <div className="CalendarContainer">
      <div className="HeaderItemContainer">
        <div style={{ padding: "3px 5px" }}>Worklists: </div>
        {WORKLISTCOUNT.map((num) => (
          <div
            key={num}
            className="HeaderButton"
            id={`work${num}`}
            onClick={() => setCurrentWorklistNumber(num)}
            style={{
              backgroundColor: num === currentWorklistNumber ? "#9ce8ff" : "",
            }}
          >
            {num}
          </div>
        ))}
        <div style={{ padding: "3px 5px" }}>Terms: </div>
        {TERMS.map((term) => (
          <div
            key={term}
            className="HeaderButton"
            id={`term_${Term_String_Map[term]}`}
            onClick={() => (canSwitchTerms() ? setCurrentTerm(term) : null)}
            style={{
              backgroundColor: getBackgroundColour(term),
              color: getFontColor(term),
            }}
          >
            {Term_String_Map[term]}
          </div>
        ))}
      </div>

      <Calendar
        setSelectedSection={setSelectedSection}
        sectionsToRender={getSectionMatrix(currentTerm)}
      />
    </div>
  )
}

export default CalendarContainer
