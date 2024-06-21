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
import { filterSectionsByWorklist, findCourseInfo } from "../utils"

export let sessionSecureToken: string | null = null

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
  // const prevColorTheme = useRef(colorTheme);
  // const prevSections = useRef(sections);
  // Sync initial state with chrome storage on mount
  useEffect(() => {
    const fetchSecureToken = async () => {
      const headers = new Headers({
        "Accept": "application/json",
        "Content-Type": "application/json",
        "Session-Secure-Token": "",
      });
    
      const urlencoded = new URLSearchParams();
    
      const requestOptions = {
        method: "POST",
        body: urlencoded,
        redirect: "follow" as RequestRedirect,
        headers: headers
      };

      return fetch(
        "https://wd10.myworkday.com/ubc/app-root",
        requestOptions
      )
        .then((response) => response.json())
        .then((data) => {
          try {
            sessionSecureToken = data["sessionSecureToken"]
          } catch (error) {
            console.error("Error parsing data:", error)
            return null
          }
        })
        .catch((error) => {
          console.error("Error fetching course data:", error)
          return null
        })
    }

    const syncInitialState = () => {
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
