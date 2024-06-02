import { ColorTheme, getNewSectionColor } from '../../helpers/courseColors'
import { ISectionData, Term, baseSection } from '../App/App.types'
import './Form.css'


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
  const onAdd = () => {
    if (invalidSection) return;
    let updatedNewSection = newSection;
    updatedNewSection.worklistNumber = currentWorklistNumber
    updatedNewSection.color = getNewSectionColor(sections, updatedNewSection, colorTheme)

    let newSections = [...sections]
    
    newSections.push(updatedNewSection)
    setSections(newSections)
    setNewSection(baseSection)
  }

  const onCancel = () => {
    setNewSection(baseSection)
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
      <div className="NewSectionInfo">
        <div>{newSection.code}</div>
        <div>{newSection.name}</div>
      </div>
      <div className='NewSectionButtonContainer'>
        <div className="NewSectionButton" title="Add Section" onClick={onAdd} style={{backgroundColor: invalidSection? "grey": ""}}>Add Section</div>
        <div className="NewSectionButton" title="Cancel"onClick={onCancel} style={{backgroundColor: (invalidSection && (!newSection.code && !newSection.name)) ? "grey" : "" }}>Cancel</div>
      </div>
      <div className="ClearWorklistButton" title="Clear Worklist" onClick={onClear}>Clear Worklist</div>
    </div>
  )
}

export default Form