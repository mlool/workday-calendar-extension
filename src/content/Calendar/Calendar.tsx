import { ISectionData, Term} from '../App/App.types'
import { convertToMatrix, getEndHour } from './utils'
import SectionPopup from '../SectionPopup/SectionPopup'
import './Calendar.css'
import { useState } from 'react'

interface IProps {
  sections: ISectionData[],
  newSection: ISectionData,
  currentWorklistNumber: number,
  currentTerm: Term;
  setSections: (data: ISectionData[]) => void,
  setInvalidSection: (state: boolean) => void;
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const Calendar = ({sections, newSection, currentWorklistNumber, setSections, setInvalidSection, currentTerm}:IProps) => {
  const [selectedSection, setSelectedSection] = useState<ISectionData | null>(null)

  const calendarSections = sections.filter((section) => section.worklistNumber === currentWorklistNumber && (section.term === currentTerm || section.term == Term.winterFull))
  const sectionsToRender = convertToMatrix(calendarSections, newSection, setInvalidSection, currentTerm)

  let times: string[] = [];
  for (let hour = 7; hour <= getEndHour(sectionsToRender); hour++) {
    times.push(`${hour}:00`);
    times.push(`${hour}:30`);
  }

  return (
    <div className="calendar">
      {selectedSection && <SectionPopup selectedSection={selectedSection} sections={sections} setSections={setSections} setSelectedSection={setSelectedSection} />}
      <div className="header">
        <div className="time-marker"></div>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="header-cell">{day}</div>
        ))}
      </div>
      <div className="body">
        <div className="time-markers">
          {times.map((time, index) => (
            <div key={index} className={`time-marker ${time.endsWith(':30') ? 'half-hour' : ''}`}>{time.endsWith(':00') ? time : ''}</div>
          ))}
        </div>
        {daysOfWeek.map((day, index) => (
          <div key={index} className="body-column">
            {sectionsToRender[day]?.map((cell, index) => (
              <div 
                key={index} 
                className="body-cell" 
                style={{backgroundColor: cell.color}}
                onClick={() => {setSelectedSection(cell.sectionContent)}}
              >
                {cell.name}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default Calendar