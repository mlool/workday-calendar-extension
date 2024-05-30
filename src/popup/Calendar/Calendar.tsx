import { ISectionData } from '../App/App.types'
import { CellFormat, convertToMatrix } from './utils'
import SectionPopup from '../SectionPopup/SectionPopup'
import './Calendar.css'
import { useState } from 'react'

interface IProps {
  sections: ISectionData[],
  newSection: ISectionData,
  setSections: (data: ISectionData[]) => void,
  setInvalidSection: (state: boolean) => void;
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const times: string[] = [];
for (let hour = 7; hour <= 20; hour++) {
    times.push(`${hour}:00`);
    times.push(`${hour}:30`);
}

const Calendar = ({sections, newSection, setSections, setInvalidSection}:IProps) => {
  const [selectedSection, setSelectedSection] = useState<ISectionData | null>(null)

  return (
    <div className="calendar">
      {selectedSection && <SectionPopup selectedSection={selectedSection} sections={sections} setSections={setSections} setSelectedSection={setSelectedSection}/>}
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
            {convertToMatrix(sections, newSection, setInvalidSection)[day]?.map((cell, index) => (
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