import { Dispatch, SetStateAction, useMemo, useEffect } from "react"
import TabBar from "../../components/TabBar"
import { ISectionData, Term_String_Map, Term } from "../App/App.types"
import Calendar from "../Calendar/Calendar"
import { convertToMatrix } from "../Calendar/calendarHelpers"
import "./CalendarContainer.css"
import { filterSections } from "../utils"

interface IProps {
  sections: ISectionData[]
  newSection: ISectionData | null
  currentWorklistNumber: number
  currentTerm: Term
  setCurrentWorklistNumber: (num: number) => void
  setSectionConflict: (state: boolean) => void
  setCurrentTerm: Dispatch<SetStateAction<Term>>
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
  const TERMS = [Term.One, Term.Two]

  const { sectionsToRender, conflict } = useMemo(() => {
    const calendarSectionsTermOne = filterSections(
      sections,
      currentWorklistNumber,
      Term.One
    )
    const calendarSectionsTermTwo = filterSections(
      sections,
      currentWorklistNumber,
      Term.Two
    )

    const sectionsToRenderTermOne = convertToMatrix(
      calendarSectionsTermOne,
      newSection,
      Term.One
    )
    const sectionsToRenderTermTwo = convertToMatrix(
      calendarSectionsTermTwo,
      newSection,
      Term.Two
    )

    return {
      conflict: sectionsToRenderTermOne[0] || sectionsToRenderTermTwo[0],
      sectionsToRender:
        currentTerm === Term.One
          ? sectionsToRenderTermOne[1]
          : sectionsToRenderTermTwo[1],
    }
  }, [sections, newSection, currentWorklistNumber, currentTerm])

  useEffect(() => {
    setSectionConflict(conflict)
  }, [conflict, setSectionConflict])

  const canSwitchTerms = (): boolean => {
    return !(newSection !== null && newSection.terms.size <= 1)
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
          isHighlighted={(x) => newSection !== null && newSection.terms.has(x)}
          tabTextBuilder={(x) => Term_String_Map[x]}
          disableBackgroundTabs={!canSwitchTerms()}
        />
      </div>

      <Calendar sectionsToRender={sectionsToRender} />
    </div>
  )
}

export default CalendarContainer
