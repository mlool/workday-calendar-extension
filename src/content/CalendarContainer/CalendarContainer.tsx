import { ISectionData, Term_String_Map, Term, baseSection } from '../App/App.types'
import Calendar from '../Calendar/Calendar';
import './CalendarContainer.css'

interface IProps {
  sections: ISectionData[],
  newSection: ISectionData,
  currentWorklistNumber: number,
  currentTerm: Term,
  setCurrentWorklistNumber: (num: number) => void,
  setSections: (data: ISectionData[]) => void,
  setInvalidSection: (state: boolean) => void,
  setCurrentTerm: (term: Term) => void;
}

const CalendarContainer = ({sections, newSection, currentWorklistNumber, setSections, setInvalidSection, setCurrentWorklistNumber, currentTerm, setCurrentTerm}:IProps) => {
  const WORKLISTCOUNT = [0, 1, 2, 3]
  const TERMS = [Term.winterOne, Term.winterTwo]

  const getBackgroundColour = (term: Term): string => {
    if(currentTerm == term){
      return "#9ce8ff";
    } else if (newSection.code !== baseSection.code){
      return "#f7faff" //Gray out if section selected & not correct term
    } else {
      return ""
    }
  }

  const getFontColor = (term: Term): string => {
    if(currentTerm == term){
      return "black";
    } else if (newSection.code !== baseSection.code){
      return "#d4d4d4" //Gray out if section selected & not correct term
    } else {
      return ""
    }
  }
  

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
              onClick={() => newSection.code === baseSection.code ? setCurrentTerm(term) : null} 
              style={{backgroundColor: getBackgroundColour(term), color: getFontColor(term)}}>{Term_String_Map[term]}
            </div>
          ))
        }
      </div>
        
      <Calendar 
        sections={sections} 
        currentWorklistNumber={currentWorklistNumber}
        newSection={newSection} 
        setSections={setSections} 
        setInvalidSection={setInvalidSection} 
        currentTerm={currentTerm}
      />
    </div>
  );
}

export default CalendarContainer