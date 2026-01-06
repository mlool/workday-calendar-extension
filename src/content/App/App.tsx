import Schedule from "../../objects/Schedule"
import Section, { SectionSchedule } from "../../objects/Section"
import { useState, useEffect } from "react"

import Calendar from "../Calendar/Calendar"
import CalendarControls from "../CalendarControls/CalendarControls";
import NewSectionControl from "../NewSectionControl/NewSectionControl";

function App() {
  const [currWorklist, setCurrWorklist] = useState<number>(0);
  const [currentTerm, setCurrentTerm] = useState<number>(1);
  const [schedule, setSchedule] = useState<Schedule>(new Schedule())
  const [newSection, setNewSection] = useState<Section | null>(null)

  useEffect(() => {
    const syncInitialStorage = async () => {
      const fetchedNewSection = await chrome.storage.local.get("newSection")
      if (fetchedNewSection.newSection) {
        const newSection = Section.getSectionFromJSON(JSON.parse(fetchedNewSection.newSection))
        setNewSection(newSection)
      }
      schedule.importFromChromeStorage().then((newSchedule) => {
        setSchedule(newSchedule);
      });
    }

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes.newSection) {
        const newVal: string | null = changes.newSection.newValue
        if (newVal === null) return
        const newSection = Section.getSectionFromJSON(JSON.parse(newVal))
        setNewSection(newSection)
        if (newSection.getTerms().size <= 1) {
          setCurrentTerm(newSection.getTerms().values().next().value ?? 1)
        }
      } else if (changes.sections) {
        const newSchedule: string | null = changes.sections.newValue
        if (newSchedule === null) return
        schedule.importFromChromeStorage().then((newSchedule) => {
          setSchedule(newSchedule);
        });
      }
    }

    syncInitialStorage()

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  useEffect(() => {
    console.log("Exporting to chrome storage")
    schedule.exportToChromeStorage()
  }, [schedule])

  const sectionSchedules = schedule.getSections().flatMap(section => section.getSectionSchedule());

  return (
    <div>
      <CalendarControls worklist={currWorklist} term={currentTerm} setWorklist={setCurrWorklist} setTerm={setCurrentTerm} />
      <Calendar schedule={sectionSchedules} newSection={newSection?.getSectionSchedule()} />
      <NewSectionControl newSection={newSection} schedule={schedule} setNewSection={setNewSection} setSchedule={setSchedule} />
    </div>
  )
}

export default App
