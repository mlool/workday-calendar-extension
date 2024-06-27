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

  const canSwitchTerms = (): boolean => {
    if (newSection !== null && newSection.term !== Term.winterFull) return false
    return true
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
          onClickHandler={(term) =>
            canSwitchTerms() ? setCurrentTerm(term) : null
          }
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
