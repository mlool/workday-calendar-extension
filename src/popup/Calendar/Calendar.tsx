import { useEffect, useState } from 'react'
import { ISectionData } from '../App/App.types'
import { CellFormat, convertToMatrix, mock } from './utils'
import './Calendar.css'

interface IProps {
  sections: ISectionData[],
  setSections: (data: ISectionData[]) => void
}

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];

const times: string[] = [];
for (let hour = 7; hour <= 20; hour++) {
    times.push(`${hour}:00`);
    times.push(`${hour}:30`);
}

const Calendar = ({sections, setSections}:IProps) => {
  const [timeMatrix, setTimeMatrix] = useState<{[id: string]: CellFormat[]}>(convertToMatrix([]))

  useEffect(() => {
    console.log(sections)
    setTimeMatrix(convertToMatrix(sections))
  }, [sections])

  return (
    <div className="calendar">
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
            {timeMatrix[day]?.map((cell, index) => (
              <div key={index} className="body-cell" style={{backgroundColor: cell.color}}>
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