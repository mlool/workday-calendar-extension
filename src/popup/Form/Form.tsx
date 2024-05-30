import { useEffect } from 'react'
import { ISectionData, baseSection } from '../App/App.types'
import { ColorTheme, getNewSectionColor } from '../../helpers/courseColors'

interface IProps {
    newSection: ISectionData,
    sections: ISectionData[],
    invalidSection: boolean,
    currentWorklistNumber: number,
    setNewSection: (data: ISectionData) => void,
    setSections: (data: ISectionData[]) => void,
    colorTheme: ColorTheme,
}

const Form = ({newSection, sections, invalidSection, currentWorklistNumber, setNewSection, setSections, colorTheme}: IProps) => {
  const onAdd = () => {
    if (invalidSection) return;
    let updatedNewSection: ISectionData = {...newSection, color: getNewSectionColor(sections.filter((sec) => sec.worklistNumber == currentWorklistNumber), newSection, colorTheme)}
    updatedNewSection.worklistNumber = currentWorklistNumber
    
    let newSections = [...sections]
    
    newSections.push(updatedNewSection)
    setSections(newSections)
    setNewSection(baseSection)
  }

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
        <button title="Clear Worklist" type="button" onClick={onClear}>Clear</button>
    </div>
  )
}

export default Form