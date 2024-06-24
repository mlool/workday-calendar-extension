import { ISectionData, Term_String_Map, Term, baseSection } from '../App/App.types'
import Calendar from '../Calendar/Calendar';
import './CalendarContainer.css'

interface IProps {
  sections: ISectionData[],
  newSection: ISectionData,
  currentWorklistNumber: number,
  currentTerm: Term,
  selectedSection: ISectionData | null,
  setCurrentWorklistNumber: (num: number) => void,
  setSections: (data: ISectionData[]) => void,
  setInvalidSection: (state: boolean) => void,
  setCurrentTerm: (term: Term) => void;
  setSelectedSection: (section: ISectionData | null) => void;
}

const CalendarContainer = ({sections, newSection, currentWorklistNumber, setSections, setInvalidSection, setCurrentWorklistNumber, currentTerm, setCurrentTerm, selectedSection, setSelectedSection}:IProps) => {
  const WORKLISTCOUNT = [0, 1, 2, 3]
  const TERMS = [Term.winterOne, Term.winterTwo]

  const getBackgroundColour = (term: Term): string => {
    if(currentTerm === term){
      return "#9ce8ff";
    } else if (newSection.term === Term.winterFull) {
      return "#ffa500"; //If not selected term, but newSection term is winterFull, orange to indicate course in other term also
    } else if (newSection.code !== baseSection.code){
      return "#f7faff" //Gray out if section selected & not correct term
    } else {
      return ""
    }
  }

  const canSwitchTerms = (term: Term): boolean => {
    let rsf = true;
    if (newSection.code !== baseSection.code) {
      rsf = false //False if we have a section selected
    }

    if(newSection.term === Term.winterFull) {
      rsf = true //But if our term is winterFull, then we should allow switching term no matter what
    }
    return rsf;
  }

  const getFontColor = (term: Term): string => {
    if(currentTerm === term){
      return "black";
    } else if (newSection.term === Term.winterFull) {
      return "black"; //black still
    } else if (newSection.code !== baseSection.code){
      return "#d4d4d4" //Gray out if section selected & not correct term
    } else {
      return ""
    }
  }
  

  return (
    <div className="CalendarContainer">
      <div className='HeaderItemContainer'>
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
              onClick={() => canSwitchTerms(term) ? setCurrentTerm(term) : null} 
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
        selectedSection={selectedSection}
        setSelectedSection={setSelectedSection}
      />
    </div>
  );
}

export default CalendarContainer