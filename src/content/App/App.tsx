import { useEffect, useState } from "react"
import "./App.css"
import CalendarContainer from "../CalendarContainer/CalendarContainer"
import { ISectionData, Term, Views } from "./App.types"
import Form from "../Form/Form"
import TopBar from "../TopBar/TopBar"
import Settings from "../Settings/Settings"
import {
  assignColors,
  ColorTheme,
  getNewSectionColor,
} from "../../helpers/courseColors"
import { ModalLayer } from "../ModalLayer"
import {
  fetchSecureToken,
  filterSectionsByWorklist,
  findCourseId,
  findCourseInfo,
  versionOneFiveZeroUpdateNotification,
} from "../utils"
import InfoModal from "../InfoModal/InfoModal"

function App() {
  const [newSection, setNewSection] = useState<ISectionData | null>(null)
  const [sections, setSections] = useState<ISectionData[]>([])
  const [sectionConflict, setSectionConflict] = useState<boolean>(false)
  const [currentWorklistNumber, setCurrentWorklistNumber] = useState<number>(0)
  const [currentTerm, setCurrentTerm] = useState<Term>(Term.winterOne)
  const [currentView, setCurrentView] = useState<Views>(Views.calendar)
  const [colorTheme, setColorTheme] = useState<ColorTheme>(ColorTheme.Green)
  const [selectedSection, setSelectedSection] = useState<ISectionData | null>(
    null
  )
  const [importingInProgress, setImportInProgress] = useState(false)

  const handleSectionImport = async (sections: ISectionData[]) => {
    const fetchedCourseIDs: string[] = []
    await sections.reduce(async (promise, section) => {
      await promise
      if (!section.courseID) {
        const courseID = await findCourseId(section.code)
        fetchedCourseIDs.push(courseID)
      }
    }, Promise.resolve())

    const newSections = sections.map((s) => {
      if (s.courseID) return s
      return {
        ...s,
        courseID: fetchedCourseIDs.shift(),
      }
    })

    setSections(newSections)
    setImportInProgress(false)
  }

  // const prevColorTheme = useRef(colorTheme);
  // const prevSections = useRef(sections);
  // Sync initial state with chrome storage on mount
  useEffect(() => {
    const syncInitialState = () => {
      chrome.storage.sync.get(["sections"], (result) => {
        if (result.sections !== undefined) {
          setImportInProgress(true)
          handleSectionImport(assignColors(result.sections, ColorTheme.Green))
          chrome.storage.sync.set({ sections: undefined }, function () {
            console.log("Sections reset to empty.")
          })
        }
      })

      chrome.storage.local.get(
        ["currentTerm", "colorTheme", "sections", "currentWorklistNumber"],
        (result) => {
          if (result.currentTerm !== undefined) {
            setCurrentTerm(result.currentTerm)
          }
          if (result.colorTheme !== undefined) {
            setColorTheme(result.colorTheme)
          }
          if (result.sections !== undefined) {
            setSections(
              assignColors(
                result.sections,
                result.colorTheme || ColorTheme.Green
              )
            )
          }
          if (result.currentWorklistNumber !== undefined) {
            setCurrentWorklistNumber(result.currentWorklistNumber)
          }
        }
      )
    }

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes.newSection) {
        const newVal = changes.newSection.newValue
        if (newVal === null) return
        setNewSection(newVal)
        if (newVal.term !== Term.winterFull) {
          //Don't set the term to WF, just keep the term to what is selected
          setCurrentTerm(newVal.term)
        }
      }
    }
    // Set context-id
    findCourseInfo("CPSC_V 320-101")
    syncInitialState()
    fetchSecureToken()
    chrome.storage.onChanged.addListener(handleStorageChange)
    versionOneFiveZeroUpdateNotification()
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, []) // Run only once on mount

  // Update chrome storage whenever relevant state changes
  useEffect(() => {
    chrome.storage.local.set({ sections })
    // alert(JSON.stringify(sections, null, 2))
  }, [sections])

  useEffect(() => {
    chrome.storage.local.set({ currentWorklistNumber })
  }, [currentWorklistNumber])

  useEffect(() => {
    chrome.storage.local.set({ currentTerm })
  }, [currentTerm])

  useEffect(() => {
    chrome.storage.local.set({ colorTheme })
  }, [colorTheme])

  useEffect(() => {
    // Check if there is a real change to trigger the update
    // if (prevColorTheme.current !== colorTheme || JSON.stringify(prevSections.current) !== JSON.stringify(sections)) {
    const newSections = assignColors(sections, colorTheme)

    if (JSON.stringify(newSections) !== JSON.stringify(sections)) {
      setSections(newSections)
    }

    // Update refs
    // prevColorTheme.current = colorTheme;
    // prevSections.current = sections;
    // }
  }, [colorTheme, sections]) // React only if these values change

  const handleAddNewSection = () => {
    const updatedNewSection = newSection!
    updatedNewSection.worklistNumber = currentWorklistNumber
    updatedNewSection.color = getNewSectionColor(
      sections,
      updatedNewSection,
      colorTheme
    )

    setSections([...sections, updatedNewSection])
    setNewSection(null)
  }

  const handleDeleteSelectedSection = () => {
    setSections(sections.filter((s) => s !== selectedSection))
    setSelectedSection(null)
  }

  const handleCancelNewSection = () => {
    setNewSection(null)
    chrome.storage.local.set({ newSection: null })
  }

  const handleClearWorklist = () => {
    const updatedSections = sections.filter(
      (x) => x.worklistNumber !== currentWorklistNumber
    )
    setSections(updatedSections)
    setSelectedSection(null)
  }

  return (
    <ModalLayer
      currentWorklistNumber={currentWorklistNumber}
      handleClearWorklist={handleClearWorklist}
      handleDeleteSelectedSection={handleDeleteSelectedSection}
      setSelectedSection={setSelectedSection}
    >
      <div className="App">
        {importingInProgress && (
          <InfoModal message="Loading ...." onCancel={() => {}} />
        )}
        <TopBar currentView={currentView} setCurrentView={setCurrentView} />
        {currentView === Views.calendar ? (
          <div className="CalendarViewContainer">
            <CalendarContainer
              sections={sections}
              setSections={setSections}
              newSection={newSection}
              setSectionConflict={setSectionConflict}
              currentWorklistNumber={currentWorklistNumber}
              setCurrentWorklistNumber={setCurrentWorklistNumber}
              currentTerm={currentTerm}
              setCurrentTerm={setCurrentTerm}
              selectedSection={selectedSection}
              setSelectedSection={setSelectedSection}
            />

            <Form
              newSection={newSection}
              sectionConflict={sectionConflict}
              handleAddNewSection={handleAddNewSection}
              handleCancel={handleCancelNewSection}
              sections={filterSectionsByWorklist(
                sections,
                currentWorklistNumber
              )}
            />
          </div>
        ) : (
          <Settings
            colorTheme={colorTheme}
            sections={sections}
            setColorTheme={setColorTheme}
            setSections={setSections}
          />
        )}
      </div>
    </ModalLayer>
  )
}

export default App
