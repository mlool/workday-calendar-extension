import { useEffect, useState } from 'react'
import { ISectionData, Term, baseSection } from '../App/App.types'

interface IProps {
    newSection: ISectionData,
    sections: ISectionData[],
    setNewSection: (data: ISectionData) => void,
    setSections: (data: ISectionData[]) => void
}

const Form = ({newSection, sections, setNewSection, setSections}: IProps) => {
  const onAdd = () => {
    let newSections = [...sections]
    newSections.push(newSection)
    setSections(newSections)
    setNewSection(baseSection)
  }

  return (
    <div>
        <div>{newSection.code}</div>
        <div>{newSection.name}</div>
        <button title="Add Section" type="button" onClick={onAdd}>Add Section</button>
    </div>
  )
}

export default Form