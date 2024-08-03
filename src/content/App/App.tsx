import { useEffect, useState, useContext } from "react"
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
} from "../Settings/Theme/courseColors"
import { ModalLayer, ModalDispatchContext, ModalPreset } from "../ModalLayer"
import { versionOneFiveZeroUpdateNotification } from "../utils"
import { findCourseId } from "../../backends/scheduler/nameSearchApi"
import {
  processRawSections,
  readSectionData,
  writeSectionData,
} from "../../storage/sectionStorage"
import { ValidVersionData } from "../../storage/legacyStorageMigrators"
import { VersionWithNoNumber } from "../../storage/helpers/unnumberedVersionTypeGuards"

function App() {
  const [newSection, setNewSection] = useState<ISectionData | null>(null)
  const [sections, setSections] = useState<ISectionData[]>([])
  const [sectionConflict, setSectionConflict] = useState<boolean>(false)
  const [currentWorklistNumber, setCurrentWorklistNumber] = useState<number>(0)
  const [currentTerm, setCurrentTerm] = useState<Term>(Term.One)
  const [currentView, setCurrentView] = useState<Views>(Views.calendar)
  const [colorTheme, setColorTheme] = useState<ColorTheme>(ColorTheme.Green)

  const dispatchModal = useContext(ModalDispatchContext)

  const handleSectionImport = async (sections: ISectionData[]) => {
    dispatchModal({
      preset: ModalPreset.ImportStatus,
      additionalData: "Loading...",
    })
    const fetchedCourseIDs: string[] = []
    await sections.reduce(async (promise, section) => {
      await promise
      if (!section.courseID) {
        const courseID = await findCourseId(section.code)
        if (!courseID) {
          return
        }
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
  }

  // const prevColorTheme = useRef(colorTheme);
  // const prevSections = useRef(sections);
  // Sync initial state with chrome storage on mount
  useEffect(() => {
    const syncInitialState = () => {
      chrome.storage.sync.get("sections", (result) => {
        if (result.sections !== undefined) {
          handleSectionImport(assignColors(result.sections, ColorTheme.Green))
          chrome.storage.sync.remove("sections", function () {
            console.log("Sections reset to empty.")
          })
        }
      })

      // we used to persist this, but no longer need to
      chrome.storage.local.remove("currentTerm")

      readSectionData().then((x) => setSections(assignColors(x, colorTheme)))

      chrome.storage.local.get(
        ["colorTheme", "currentWorklistNumber"],
        (result) => {
          if (result.colorTheme !== undefined) {
            setColorTheme(result.colorTheme)
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
        const newVal: ISectionData = changes.newSection.newValue
        if (newVal === null) return
        setNewSection(newVal)
        if (newVal.terms.size <= 1) {
          //Don't set the term to WF, just keep the term to what is selected
          setCurrentTerm(newVal.terms.values().next().value)
        }
      }
    }

    syncInitialState()
    chrome.storage.onChanged.addListener(handleStorageChange)
    versionOneFiveZeroUpdateNotification()
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, []) // Run only once on mount

  // Update chrome storage whenever relevant state changes
  useEffect(() => {
    writeSectionData(sections)
    // alert(JSON.stringify(sections, null, 2))
  }, [sections])

  useEffect(() => {
    chrome.storage.local.set({ currentWorklistNumber })
  }, [currentWorklistNumber])

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
    chrome.storage.local.set({ newSection: null })
  }

  const handleDeleteSection = (sectionToDelete: ISectionData) => {
    setSections(sections.filter((s) => s !== sectionToDelete))
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
  }

  const handleImportSections = async (
    newData: ValidVersionData | VersionWithNoNumber,
    worklistNumber?: number
  ) => {
    const importedSections = await processRawSections(newData)
    const allSections = worklistNumber
      ? [
          ...sections,
          ...importedSections.filter(
            (x) => x.worklistNumber === worklistNumber
          ),
        ]
      : [...sections, ...importedSections]
    const finalSections = assignColors(allSections, colorTheme)
    setSections(finalSections)
    await writeSectionData(finalSections)
  }

  return (
    <ModalLayer
      currentWorklistNumber={currentWorklistNumber}
      handleClearWorklist={handleClearWorklist}
      handleDeleteSection={handleDeleteSection}
    >
      <div className="App">
        <TopBar
          currentView={currentView}
          setCurrentView={setCurrentView}
          sections={sections}
        />
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
            />

            <Form
              newSection={newSection}
              sectionConflict={sectionConflict}
              handleAddNewSection={handleAddNewSection}
              handleCancel={handleCancelNewSection}
            />
          </div>
        ) : (
          <Settings
            colorTheme={colorTheme}
            sections={sections}
            setColorTheme={setColorTheme}
            handleImportSections={handleImportSections}
          />
        )}
      </div>
    </ModalLayer>
  )
}

export default App
