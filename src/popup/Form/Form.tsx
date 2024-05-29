import { ISectionData, baseSection } from '../App/App.types'

interface IProps {
    newSection: ISectionData,
    sections: ISectionData[],
    invalidSection: boolean,
    currentWorklistNumber: number,
    setNewSection: (data: ISectionData) => void,
    setSections: (data: ISectionData[]) => void
}

const Form = ({newSection, sections, invalidSection, currentWorklistNumber, setNewSection, setSections}: IProps) => {
  const onAdd = () => {
    let updatedNewSection: ISectionData = {...newSection}
    updatedNewSection.worklistNumber = currentWorklistNumber
    
    let newSections = [...sections]
    
    newSections.push(updatedNewSection)
    setSections(newSections)
    setNewSection(baseSection)
  }

  return (
    <div>
        <div>{newSection.code}</div>
        <div>{newSection.name}</div>
        <button title="Add Section" type="button" onClick={onAdd} style={{backgroundColor: invalidSection? "grey": ""}}>Add Section</button>
    </div>
  )
}

export default Form