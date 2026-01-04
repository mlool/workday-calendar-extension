import Schedule from "../../objects/Schedule"
import Section, { SectionSchedule } from "../../objects/Section"
import { useState, useEffect } from "react"

import Calendar from "../Calendar/Calendar"
import CalendarControls from "../CalendarControls/CalendarControls";
import ProgressBar from "../ProgressBar/ProgressBar";

function App() {
  const [currWorklist, setCurrWorklist] = useState<number>(0);
  const [currentTerm, setCurrentTerm] = useState<number>(1);
  const [schedule, setSchedule] = useState<Schedule>(new Schedule())
  const [newSection, setNewSection] = useState<Section | null>(null)

  useEffect(() => {
    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes.newSection) {
        const newVal: string | null = changes.newSection.newValue
        if (newVal === null) return
        const newSection = Section.getSectionFromJSON(JSON.parse(newVal))
        setNewSection(newSection)
        console.log(newSection)
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

    schedule.importFromChromeStorage().then((newSchedule) => {
      console.log(newSchedule.getSectionSchedule(0, "2025W"))
      setSchedule(newSchedule);
    });

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  const sectionSchedules = schedule.getSections().flatMap(section => section.getSectionSchedule());

  return (
    <div>
      <CalendarControls worklist={currWorklist} term={currentTerm} setWorklist={setCurrWorklist} setTerm={setCurrentTerm} />
      <Calendar schedule={sectionSchedules} newSection={newSection?.getSectionSchedule()} />
      <ProgressBar />
    </div>
  )
}

export default App
