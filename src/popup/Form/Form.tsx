import { useEffect, useState } from 'react'
import { ISectionData, Term, baseSection } from '../App/App.types'

interface IProps {
    newSection: ISectionData,
    sections: ISectionData[],
    setNewSection: (data: ISectionData) => void,
    setSections: (data: ISectionData[]) => void
}

const Form = ({newSection, sections, setNewSection, setSections}: IProps) => {
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

  const convertTo24 = (time: string) => {
    const regex = /^(\d{1,2}):(\d{2})\s*(a\.m\.|p\.m\.)$/i;
    const match = time.match(regex);

    if (!match) {
      throw new Error("Invalid time format");
    }

    let [_, hours, minutes, period] = match;
    let hoursNumber = parseInt(hours, 10);

    if (period.toLowerCase() === "p.m." && hoursNumber !== 12) {
      hoursNumber += 12;
    } else if (period.toLowerCase() === "a.m." && hoursNumber === 12) {
      hoursNumber = 0;
    }

    // Ensure hours and minutes are two digits
    const formattedHours = hoursNumber.toString().padStart(2, '0');
    const formattedMinutes = minutes.padStart(2, '0');

    return `${formattedHours}:${formattedMinutes}`;
  }

  const getFromTitle = (input: string) => {
    let updatedNewSection = {...newSection}
    updatedNewSection.title = input
    const parts = input.split(' - ');
    if (parts.length === 2) {
        const code = parts[0];
        const name = parts[1];
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
        updatedNewSection.startTime = convertTo24(startTime)
        updatedNewSection.endTime = convertTo24(endTime)
        updatedNewSection.term = dateRange === "2024-09-03 - 2024-12-05"? Term.winterOne: Term.winterTwo
    }
    setNewSection(updatedNewSection)
  }

  const onAdd = () => {
    let newSections = [...sections]
    newSections.push(newSection)
    setSections(newSections)
    setNewSection(baseSection)
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
        <button title="Add Section" type="button" onClick={onAdd}>Add Section</button>
    </div>
  )
}

export default Form