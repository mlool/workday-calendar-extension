import { ISectionData, baseSection } from '../App/App.types'
import { ColorTheme, getNewSectionColor } from '../../helpers/courseColors'
import ThemePicker from '../ThemePicker/ThemePicker';

interface IProps {
    newSection: ISectionData,
    sections: ISectionData[],
    invalidSection: boolean,
    currentWorklistNumber: number,
    setNewSection: (data: ISectionData) => void,
    setSections: (data: ISectionData[]) => void,
    colorTheme: ColorTheme,
    setColorTheme: (theme: ColorTheme) => void
}

const Form = ({newSection, sections, invalidSection, currentWorklistNumber, setNewSection, setSections, colorTheme, setColorTheme}: IProps) => {
  const onAdd = () => {
    if (invalidSection) return;
    let updatedNewSection: ISectionData = {...newSection, color: getNewSectionColor(sections.filter((sec) => sec.worklistNumber == currentWorklistNumber), newSection, colorTheme)}
    updatedNewSection.worklistNumber = currentWorklistNumber
    
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
    <div>
      <div>{newSection.code}</div>
      <div>{newSection.name}</div>
      <button title="Add Section" type="button" onClick={onAdd} style={{backgroundColor: invalidSection? "grey": ""}}>Add Section</button>
      <button title="Cancel" type="button" onClick={onCancel} style={{backgroundColor: (invalidSection && (!newSection.code && !newSection.name)) ? "grey" : "" }}>Cancel</button>
      <div style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
        <button title="Clear Worklist" type="button" onClick={onClear}>Clear</button>
        <ThemePicker colorTheme={colorTheme} setColorTheme={setColorTheme}/>
      </div>
    </div>
  )
}

export default Form