import TabBar from "../../components/TabBar"
import { ISectionData, Term_String_Map, Term } from "../App/App.types"
import Calendar from "../Calendar/Calendar"
import "./CalendarContainer.css"

interface IProps {
  sections: ISectionData[]
  newSection: ISectionData | null
  currentWorklistNumber: number
  currentTerm: Term
  setCurrentWorklistNumber: (num: number) => void
  setSections: (data: ISectionData[]) => void
  setSectionConflict: (state: boolean) => void
  setCurrentTerm: (term: Term) => void
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
        <TabBar
          label="Worklists"
          items={WORKLISTCOUNT}
          onClickHandler={setCurrentWorklistNumber}
          isSelected={(x) => x === currentWorklistNumber}
        />
        <TabBar
          label="Terms"
          items={TERMS}
          onClickHandler={(term) => (canSwitchTerms() ? setCurrentTerm(term) : null)}
          isSelected={(x) => x === currentTerm}
          isHighlighted={() => newSection?.term === Term.winterFull}
          tabTextBuilder={(x) => Term_String_Map[x]}
        />
      </div>

      <Calendar
        sections={sections}
        currentWorklistNumber={currentWorklistNumber}
        newSection={newSection}
        setSections={setSections}
        setSectionConflict={setSectionConflict}
        currentTerm={currentTerm}
      />
    </div>
  )
}

export default CalendarContainer
