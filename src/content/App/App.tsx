import Schedule from "../../objects/Schedule"
import Section from "../../objects/Section"
import { useState, useEffect } from "react"

import Calendar from "../Calendar/Calendar"
import CalendarControls from "../CalendarControls/CalendarControls";
import NewSectionControl from "../NewSectionControl/NewSectionControl";
import SectionDetails from "../SectionDetails/SectionDetails";

import "./App.css"
import WorklistControl from "../WorklistControl/WorklistControl";
import ExtensionStorage from "../../objects/ExtensionStorage";

function App() {
  const [currWorklist, setCurrWorklist] = useState<number>(0);
  const [currentTerm, setCurrentTerm] = useState<number>(1);

  const [currentSession, setCurrentSession] = useState<string>("2025W");
  const [availableSessions, setAvailableSessions] = useState<string[]>([]);

  const [schedule, setSchedule] = useState<Schedule>(new Schedule())
  const [newSection, setNewSection] = useState<Section | null>(null)
  const [selectedSection, setSelectedSection] = useState<Section | null>(null)

  useEffect(() => {
    const syncInitialStorage = async () => {
      const fetchedNewSection = await ExtensionStorage.getNewSection()
      if (fetchedNewSection) {
        setNewSection(fetchedNewSection)
      }

      const fetchedSchedule = await ExtensionStorage.getSchedule()
      if (fetchedSchedule) {
        setSchedule(fetchedSchedule)
        setAvailableSessions(fetchedSchedule.getSessions());
        setCurrentSession(fetchedSchedule.getLatestSession());
      }

      const fetchedCurrentTerm = await ExtensionStorage.getCurrentTerm()
      if (fetchedCurrentTerm) {
        setCurrentTerm(fetchedCurrentTerm)
      }

      const fetchedCurrentSession = await ExtensionStorage.getCurrentSession()
      if (fetchedCurrentSession) {
        setCurrentSession(fetchedCurrentSession)
      }

      const fetchedCurrentWorklist = await ExtensionStorage.getCurrentWorklistNumber()
      if (fetchedCurrentWorklist) {
        setCurrWorklist(fetchedCurrentWorklist)
      }
    }

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange
    }) => {
      if (changes.newSection) {
        ExtensionStorage.getNewSection().then((updatedNewSection) => {
          if (!updatedNewSection || updatedNewSection.getCourseID() === newSection?.getCourseID()) return;
          setNewSection(updatedNewSection)
        })
      } else if (changes.schedule) {
        ExtensionStorage.getSchedule().then((newSchedule) => {
          if (!newSchedule || newSchedule.getId() === schedule.getId()) return;
          setSchedule(newSchedule);
        });
      } else if (changes.currentSession) {
        const newVal: string | null = changes.currentSession.newValue
        if (newVal === null) return
        setCurrentSession(newVal)
      } else if (changes.currentTerm) {
        const newVal: number | null = changes.currentTerm.newValue
        if (newVal === null) return
        setCurrentTerm(newVal)
      } else if (changes.currentWorklist) {
        const newVal: number | null = changes.currentWorklist.newValue
        if (newVal === null) return
        setCurrWorklist(newVal)
      }
    }

    syncInitialStorage()

    chrome.storage.onChanged.addListener(handleStorageChange);
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange)
    }
  }, [])

  useEffect(() => {
    ExtensionStorage.setSchedule(schedule)
    setAvailableSessions(schedule.getSessions());
    if (!schedule.getSessions().includes(currentSession)) setCurrentSession(schedule.getLatestSession());
  }, [schedule])

  useEffect(() => {
    if (newSection) {
      if (newSection.getTerms().size <= 1) {
        setCurrentTerm(newSection.getTerms().values().next().value ?? 1)
      }
      setAvailableSessions([newSection.getSession()])
      setCurrentSession(newSection.getSession())
    } else {
      ExtensionStorage.setNewSection(null)
      setAvailableSessions(schedule.getSessions())
      if (!schedule.getSessions().includes(currentSession)) setCurrentSession(schedule.getLatestSession());
    }
  }, [newSection])

  useEffect(() => {
    ExtensionStorage.setCurrentSession(currentSession)
    if (!availableSessions.includes(currentSession)) {
      setAvailableSessions([...availableSessions, currentSession].sort().reverse());
    }
  }, [currentSession])

  useEffect(() => {
    ExtensionStorage.setCurrentTerm(currentTerm)
  }, [currentTerm])

  useEffect(() => {
    ExtensionStorage.setCurrentWorklistNumber(currWorklist)
  }, [currWorklist])

  return (
    <div>
      <div className="top-bar"></div>
      <CalendarControls
        worklist={currWorklist}
        term={currentTerm}
        currentSession={currentSession}
        availableSessions={availableSessions}
        setCurrentSession={setCurrentSession}
        setWorklist={setCurrWorklist}
        setTerm={setCurrentTerm}
      />
      <Calendar
        schedule={schedule}
        newSection={newSection}
        worklist={currWorklist}
        term={currentTerm}
        session={currentSession}
        setSelectedSection={setSelectedSection}
      />
      <NewSectionControl
        newSection={newSection}
        schedule={schedule}
        setNewSection={setNewSection}
        setSchedule={setSchedule}
        worklist={currWorklist}
      />
      {selectedSection && <SectionDetails
        section={selectedSection}
        term={currentTerm}
        onClose={() => setSelectedSection(null)}
        onDelete={(section: Section) => {
          setSchedule(schedule.removeSection(section.getWorklistNumber(), section.getCourseID()))
          setSelectedSection(null)
        }}
      />}
      <WorklistControl
        schedule={schedule}
        worklist={currWorklist}
        currentSession={currentSession}
        setSchedule={setSchedule}
      />
    </div>
  )
}

export default App
