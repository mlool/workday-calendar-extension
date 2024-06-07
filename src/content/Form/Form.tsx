import { ColorTheme, getNewSectionColor } from '../../helpers/courseColors'
import { ISectionData, Term, Term_String_Map, baseSection } from '../App/App.types'
import './Form.css'
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal'
import { useState } from 'react';

interface IProps {
    newSection: ISectionData,
    sections: ISectionData[],
    invalidSection: boolean,
    currentWorklistNumber: number,
    setNewSection: (data: ISectionData) => void,
    setSections: (data: ISectionData[]) => void,
    currentTerm: Term;
    colorTheme: ColorTheme,
    setColorTheme: (theme: ColorTheme) => void
}

const Form = ({newSection, sections, invalidSection, currentWorklistNumber, setNewSection, setSections, currentTerm, colorTheme, setColorTheme}: IProps) => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  const [OnClearConfirmAction, setOnClearConfirmAction] = useState<() => void>(() => {});
  const [clearConfirmationMsg, setClearConfirmationMsg] = useState("");
  
  const onAdd = () => {
    if (invalidSection) return;
    let updatedNewSection = newSection;
    updatedNewSection.worklistNumber = currentWorklistNumber
    updatedNewSection.color = getNewSectionColor(sections, updatedNewSection, colorTheme)

    let newSections = [...sections]
    
    newSections.push(updatedNewSection)
    setSections(newSections)
    chrome.storage.sync.set({ newSection: baseSection });
  }

  const onCancel = () => {
    // setNewSection(baseSection)
    chrome.storage.sync.set({ newSection: baseSection });
  };


  const filterSections = (filterFn: (section: ISectionData) => boolean) => {
    const newSections: ISectionData[] = sections.filter(filterFn);
    setSections(newSections);
  };
  
  const onClear = () => {
    filterSections((section) => section.worklistNumber !== currentWorklistNumber);
  };
  
  const onClearSelectedTerm = () => {
    filterSections((section) => 
      section.worklistNumber !== currentWorklistNumber ||
      section.term !== currentTerm ||
      (section.term !== Term.summerFull && section.term !== Term.winterFull)
    );
  };


  const handleClearConfirm = (action: () => void, message: string) => {  
    setOnClearConfirmAction(() => action);
    setClearConfirmationMsg(message);
    setShowConfirmation(true)

  }


  return (
    <div className='NewSectionForm'>
      {showConfirmation && 
        <ConfirmationModal 
          title='Confirm Clear Worklist' 
          message={`Clearing the worklist will remove <span style="color: red;">all sections from ${clearConfirmationMsg} under worklist ${currentWorklistNumber}</span>. Are you sure you want to continue?` }
          onCancel={() => setShowConfirmation(false)} 
          onConfirm={() => {
                      OnClearConfirmAction();
                      setShowConfirmation(false)
                    }}
        />
      }
      <div className="NewSectionInfo">
        <div className="NewSectionCode">{newSection.code}</div>
        <div>{newSection.name}</div>
      </div>
      <div className='NewSectionButtonContainer'>
        <div className="NewSectionButton" title="Cancel"onClick={onCancel} style={{backgroundColor: (invalidSection && (!newSection.code && !newSection.name)) ? "#c4c4c4" : "" }}>Cancel</div>
        <div className="NewSectionButton" title="Add Section" onClick={onAdd} style={{backgroundColor: invalidSection? "#c4c4c4": ""}}>Add Section</div>
      </div>

     <div className='ClearSectionButtonContainer'>
        <div className="ClearWorklistButton" title="Clear Worklist" onClick={() => handleClearConfirm(onClear, "both terms")}>Clear Worklist</div>
        <div className="ClearWorklistButton" title={`Clear ${currentTerm} Sections`} onClick={() => handleClearConfirm(onClearSelectedTerm, `${Term_String_Map[currentTerm]}, including the sections spanning on two terms`)}>Clear {Term_String_Map[currentTerm]} Sections</div>
     </div>
    </div>
  )
}

export default Form