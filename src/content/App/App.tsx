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
} from "../Settings/Theme/courseColors"
import { ModalAction, ModalLayer, ModalPreset } from "../ModalLayer"
import { versionOneFiveZeroUpdateNotification } from "../utils"
import {
  loadSectionDataFromJSON,
  appendNewSections,
} from "../../storage/sectionStorage"
import { postAlertIfHasErrors } from "../../storage/errors"
import {
  sendProgressUpdateToAll,
  readSectionData,
  writeSectionData,
} from "../../storage/sectionDataBrowserClient"
import ProgressBar from "../ProgressBar/ProgressBar"

function App() {
  const [newSection, setNewSection] = useState<ISectionData | null>(null)
  const [sections, setSections] = useState<ISectionData[]>([])
  const [sectionConflict, setSectionConflict] = useState<boolean>(false)
  const [currentWorklistNumber, setCurrentWorklistNumber] = useState<number>(0)
  const [currentTerm, setCurrentTerm] = useState<Term>(Term.One)
  const [currentView, setCurrentView] = useState<Views>(Views.calendar)
  const [colorTheme, setColorTheme] = useState<ColorTheme>(ColorTheme.Green)

  // const prevColorTheme = useRef(colorTheme);
  // const prevSections = useRef(sections);
  // Sync initial state with chrome storage on mount
  useEffect(() => {
    const syncInitialState = () => {
      // we used to persist this, but no longer need to
      chrome.storage.local.remove("currentTerm")

      readSectionData().then((x) => {
        setSections(assignColors(x.data, colorTheme))
        postAlertIfHasErrors(x)
      })

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
        const newVal: string | null = changes.newSection.newValue
        if (newVal === null) return
        const newData = loadSectionDataFromJSON<ISectionData>(newVal)
        setNewSection(newData)
        if (newData.terms.size <= 1) {
          //Don't set the term to WF, just keep the term to what is selected
          setCurrentTerm(newData.terms.values().next().value)
        }
      } else if (changes.sections) {
        const newVal: string | null = changes.sections.newValue
        if (newVal === null) return
        readSectionData().then((sections) => {
          setSections(assignColors(sections.data, colorTheme))
        })
      }
    }

    syncInitialState()
    chrome.storage.onChanged.addListener(handleStorageChange)
    versionOneFiveZeroUpdateNotification()
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, []) // Run only once on mount

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

    // TODO: this could be faulty, remove/change to deep comparison?
    if (JSON.stringify(newSections) !== JSON.stringify(sections)) {
      setSections(newSections)
      writeSectionData(newSections)
    }

    // Update refs
    // prevColorTheme.current = colorTheme;
    // prevSections.current = sections;
    // }
  }, [colorTheme, sections]) // React only if these values change

  const handleAddNewSection = async () => {
    const updatedNewSection = newSection!
    updatedNewSection.worklistNumber = currentWorklistNumber
    updatedNewSection.color = getNewSectionColor(
      sections,
      updatedNewSection,
      colorTheme
    )

    const updatedSections = [...sections, updatedNewSection]
    setSections(updatedSections)
    setNewSection(null)
    await writeSectionData(updatedSections)
    chrome.storage.local.set({ newSection: null })
  }

  const handleDeleteSection = async (sectionToDelete: ISectionData) => {
    const updatedSections = sections.filter((s) => s !== sectionToDelete)
    setSections(updatedSections)
    await writeSectionData(updatedSections)
  }

  const handleCancelNewSection = () => {
    setNewSection(null)
    chrome.storage.local.set({ newSection: null })
  }

  const handleClearWorklist = async () => {
    const updatedSections = sections.filter(
      (x) => x.worklistNumber !== currentWorklistNumber
    )
    setSections(updatedSections)
    await writeSectionData(updatedSections)
  }

  const handleImportSections = async (
    newData: string | undefined,
    modalDispatcher: React.Dispatch<ModalAction>,
    worklistNumber?: number
  ) => {
    modalDispatcher({
      preset: ModalPreset.ImportStatus,
      additionalData: <ProgressBar message={"Loading Progress: "} />,
    })
    const previousSectionsLength = sections.length

    const allSections = await appendNewSections(
      sections,
      newData,
      sendProgressUpdateToAll,
      worklistNumber
    )
    const finalSections = assignColors(allSections.data, colorTheme)

    const newSections = finalSections.slice(previousSectionsLength)

    const tempWlNum = newSections[0].worklistNumber
    const hasMultipleWorklists = newSections.some(
      (section) => section.worklistNumber !== tempWlNum
    )
    if (hasMultipleWorklists) {
      modalDispatcher({
        preset: ModalPreset.ImportStatus,
        additionalData:
          "Warning! You are attempting to import sections from multiple worklists into one worklist. This is not supported as it may cause unexpected behavior. Please use the 'Import All Worklists' button instead.",
      })
    } else {
      setSections(finalSections)
      postAlertIfHasErrors(allSections)
      await writeSectionData(finalSections)
      modalDispatcher({
        preset: ModalPreset.ImportStatus,
        additionalData:
          "Import Successful! Your courses should now be viewable in your worklist",
      })
    }
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
