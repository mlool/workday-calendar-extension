import TabBar from "../../components/TabBar"
import { ISectionData, Term_String_Map, Term } from "../App/App.types"
import Calendar from "../Calendar/Calendar"
import { convertToMatrix } from "../Calendar/calendarHelpers"
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
  setSectionConflict,
  setCurrentWorklistNumber,
  currentTerm,
  setCurrentTerm,
}: IProps) => {
  const WORKLISTCOUNT = [0, 1, 2, 3]
  const TERMS = [Term.winterOne, Term.winterTwo]

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
          disableBackgroundTabs={!canSwitchTerms()}
        />
      </div>

      <Calendar sectionsToRender={getSectionMatrix(currentTerm)} />
    </div>
  )
}

export default CalendarContainer
