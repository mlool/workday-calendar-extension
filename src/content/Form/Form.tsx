import { ColorTheme, getNewSectionColor } from '../../helpers/courseColors'
import { ISectionData, Term } from '../App/App.types'
import './Form.css'
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal'
import { useState } from 'react';

interface IProps {
    newSection: ISectionData | null,
    sections: ISectionData[],
    sectionConflict: boolean,
    currentWorklistNumber: number,
    setNewSection: (data: ISectionData | null) => void,
    setSections: (data: ISectionData[]) => void,
    currentTerm: Term;
    colorTheme: ColorTheme,
    setColorTheme: (theme: ColorTheme) => void,
    setSelectedSection: (section: ISectionData | null) => void;
}

const Form = ({newSection, sections, sectionConflict, currentWorklistNumber, setNewSection, setSections, colorTheme, setSelectedSection}: IProps) => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false)
  
  const onAdd = () => {
    if (sectionConflict) return;
    let updatedNewSection = newSection!;
    updatedNewSection.worklistNumber = currentWorklistNumber
    updatedNewSection.color = getNewSectionColor(sections, updatedNewSection, colorTheme)

    let newSections = [...sections]
    
    newSections.push(updatedNewSection)
    setSections(newSections)
    setNewSection(null);
  }

  const onCancel = () => {
    setNewSection(null);
  };

  const onClear = () => {
    let newSections:ISectionData[] = []
    sections.forEach((section) => {
      if (section.worklistNumber !== currentWorklistNumber) {
        newSections.push({...section})
      }
    })
    setSections(newSections)
  }

  return (
    <div className='NewSectionForm'>
      {showConfirmation && 
        <ConfirmationModal 
          title='Confirm Clear Worklist' 
          message={`Clearing the worklist will remove all sections from both terms under worklist ${currentWorklistNumber}. Are you sure you want to continue?` }
          onCancel={() => setShowConfirmation(false)} 
          onConfirm={() => {
                      onClear()
                      setShowConfirmation(false)
                      setSelectedSection(null)
                    }}
        />
      }
      <div className="NewSectionInfo">
        <div className="NewSectionCode">{newSection?.code}</div>
        <div>{newSection?.name}</div>
      </div>
      <div className='NewSectionButtonContainer'>
        <div className="NewSectionButton" title="Cancel"onClick={onCancel} style={{backgroundColor: (sectionConflict && (!newSection?.code && !newSection?.name)) ? "#c4c4c4" : "" }}>Cancel</div>
        <div className="NewSectionButton" title="Add Section" onClick={onAdd} style={{backgroundColor: sectionConflict? "#c4c4c4": ""}}>Add Section</div>
      </div>
      <div className="ClearWorklistButton" title="Clear Worklist" onClick={() => setShowConfirmation(true)}>Clear Worklist</div>
    </div>
  )
}

export default Form
