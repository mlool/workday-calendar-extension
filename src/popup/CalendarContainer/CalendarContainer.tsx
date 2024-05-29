import { useEffect, useState } from 'react'
import { ISectionData } from '../App/App.types'
import Calendar from '../Calendar/Calendar';
import './CalendarContainer.css'

interface IProps {
  sections: ISectionData[],
  newSection: ISectionData,
  currentWorklistNumber: Number,
  setCurrentWorklistNumber: (num: number) => void,
  setSections: (data: ISectionData[]) => void,
  setInvalidSection: (state: boolean) => void;
}

const CalendarContainer = ({sections, newSection, currentWorklistNumber, setSections, setInvalidSection, setCurrentWorklistNumber}:IProps) => {
  const WORKLISTCOUNT = [0, 1, 2, 3, 4, 5]

  return (
    <div className="CalendarContainer">
      <div className='WorklistContainer'>
        {WORKLISTCOUNT.map((num) => 
          (<div 
            className='WorklistButton' 
            id={`work${num}`} 
            onClick={() => setCurrentWorklistNumber(num)} 
            style={{backgroundColor: num === currentWorklistNumber? "#9ce8ff":""}}>{num}</div>)
        )}
      </div>
      <Calendar 
        sections={sections.filter((section) => section.worklistNumber === currentWorklistNumber)} 
        newSection={newSection} 
        setSections={setSections} 
        setInvalidSection={setInvalidSection} 
      />
    </div>
  );
}

export default CalendarContainer