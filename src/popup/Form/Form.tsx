import { useEffect, useState } from 'react'
import { ISectionData, Term } from '../App/App.types'

interface IProps {
    newSection: ISectionData,
    setNewSection: (data: ISectionData) => void,
    setSections: (data: ISectionData[]) => void
}

const Form = ({newSection, setNewSection, setSections}: IProps) => {

  useEffect(() => {
    chrome.storage.sync.get(['newSection'], (result) => {
      if (result.newSection !== undefined) {
        setNewSection(result.newSection)
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.set({ newSection: newSection })
  }, [newSection])

  const getFromTitle = (input: string) => {
    let updatedNewSection = {...newSection}
    updatedNewSection.title = input
    const parts = input.split(' - ');
    if (parts.length === 2) {
        const code = parts[0].slice(1, -1);
        const name = parts[1].slice(1, -1);
        updatedNewSection.code = code
        updatedNewSection.name = name
    }
    setNewSection(updatedNewSection)
  }

  const getFromDetail = (input: string) => {
    let updatedNewSection = {...newSection}
    updatedNewSection.details = input
    const parts = input.split(' | ');
    if (parts.length === 4) {
        const location = parts[0];
        const days = parts[1].split(' ');
        const [startTime, endTime] = parts[2].split(' - ');
        const dateRange = parts[3];
    
        updatedNewSection.location = location
        updatedNewSection.days = days
        updatedNewSection.startTime = startTime
        updatedNewSection.endTime = endTime
        updatedNewSection.term = dateRange === "2024-09-03 - 2024-12-05"? Term.winterOne: Term.winterTwo
    }
    setNewSection(updatedNewSection)
  }

  return (
    <div>
        <form>
            <label>Title:</label>
            <input type='text' value={newSection.title} onChange={e => getFromTitle(e.target.value)}/>
            <br />
            <label>Section Detail:</label>
            <input type='text' value={newSection.details} onChange={e => getFromDetail(e.target.value)}/>
        </form>
        <button title="Add Section"/>
    </div>
  )
}

export default Form