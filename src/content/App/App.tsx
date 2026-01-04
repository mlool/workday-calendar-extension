import Schedule from "../../objects/Schedule"
import { SectionSchedule } from "../../objects/Section"
import { useState, useEffect } from "react"

import Calendar from "../Calendar/Calendar"
import CalendarControls from "../CalendarControls/CalendarControls";

function App() {
  const [currWorklist, setCurrWorklist] = useState<number>(0);
  const [currentTerm, setCurrentTerm] = useState<number>(1);
  const [schedule, setSchedule] = useState<Schedule>(new Schedule())

  useEffect(() => {
    schedule.importFromChromeStorage().then((newSchedule) => {
      console.log(newSchedule.getSectionSchedule(0, "2025W"))
      setSchedule(newSchedule);
    });
  }, [])

  const sectionSchedules = schedule.getSections().flatMap(section => section.getSectionSchedule());

  const mockNewSection: SectionSchedule = {
    code: "TEST 101",
    courseID: "000000",
    section: "101",
    instructors: [],
    day: ["Mon", "Wed"],
    startTime: "10:00",
    endTime: "11:30",
    term: 1,
    color: "", // This color will be overridden by logic but prop requires it
    location: "Earth"
  };

  return (
    <div>
      <CalendarControls worklist={currWorklist} term={currentTerm} setWorklist={setCurrWorklist} setTerm={setCurrentTerm} />
      <Calendar schedule={sectionSchedules} newSection={mockNewSection} />
    </div>
  )
}

export default App
