import { useEffect, useState } from 'react'
import { ISectionData, Term_String_Map, Term } from '../App/App.types'
import Calendar from '../Calendar/Calendar';
import './CalendarContainer.css'

interface IProps {
  sections: ISectionData[],
  newSection: ISectionData,
  currentWorklistNumber: Number,
  currentTerm: Term,
  setCurrentWorklistNumber: (num: number) => void,
  setSections: (data: ISectionData[]) => void,
  setInvalidSection: (state: boolean) => void,
  setCurrentTerm: (term: Term) => void;
}

const CalendarContainer = ({sections, newSection, currentWorklistNumber, setSections, setInvalidSection, setCurrentWorklistNumber, currentTerm, setCurrentTerm}:IProps) => {
  const WORKLISTCOUNT = [0, 1, 2, 3]
  const TERMS = [Term.winterOne, Term.winterTwo, Term.summerOne, Term.summerTwo]
  

  return (
    <div className="CalendarContainer">
      <div className='HeaderSectionContainer'>
        <div style={{padding: '3px 5px'}}>Worklists: </div>
        {WORKLISTCOUNT.map((num) => 
          (<div 
            className='HeaderButton' 
            id={`work${num}`} 
            onClick={() => setCurrentWorklistNumber(num)} 
            style={{backgroundColor: num === currentWorklistNumber? "#9ce8ff":""}}>{num}</div>)
        )}
        <div style={{padding: '3px 5px'}}>Terms: </div>
        {TERMS.map((term) => (
            <div
              className='HeaderButton'
              id={`term_${Term_String_Map[term]}`}
              onClick={() => setCurrentTerm(term)} 
              style={{backgroundColor: term === currentTerm ? "#9ce8ff" : ""}}>{Term_String_Map[term]}
            </div>
          ))
        }
      </div>
        
      <Calendar 
        sections={sections.filter((section) => section.worklistNumber === currentWorklistNumber && section.term == currentTerm)} 
        newSection={newSection} 
        setSections={setSections} 
        setInvalidSection={setInvalidSection} 
      />
    </div>
  );
}

export default CalendarContainer