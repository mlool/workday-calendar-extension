// import React from 'react'
import { useEffect, useState } from 'react'
import './App.css'
// import Form from '../Form/Form'
import CalendarContainer from '../CalendarContainer/CalendarContainer'
import { ISectionData, baseSection } from './App.types'
import Form from '../Form/Form'

function App() {
  const [newSection, setNewSection] = useState<ISectionData>(baseSection)
  const [sections, setSections] = useState<ISectionData[]>([])
  const [invalidSection, setInvalidSection] = useState<boolean>(false)
  const [currentWorklistNumber, setCurrentWorklistNumber] = useState<number>(0)

  useEffect(() => {
    const handleStorageChange = () => {
      chrome.storage.sync.get(['newSection'], (result) => {
        if (result.newSection !== undefined) {
          let newSection: ISectionData = result.newSection
          newSection.worklistNumber = currentWorklistNumber
          setNewSection(newSection)
        }
      })
    };
    chrome.storage.onChanged.addListener((handleStorageChange));
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, []);

  useEffect(() => {
    chrome.storage.sync.get(['newSection'], (result) => {
      if (result.newSection !== undefined) {
        setNewSection(newSection)
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.get(['sections'], (result) => {
      if (result.sections !== undefined) {
        setSections(result.sections)
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.get(['currentWorklistNumber'], (result) => {
      if (result.currentWorklistNumber !== undefined) {
        setCurrentWorklistNumber(result.currentWorklistNumber)
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.set({ sections: sections })
  }, [sections])

  useEffect(() => {
    let updatedNewSection: ISectionData = {...newSection}
    updatedNewSection.worklistNumber = currentWorklistNumber
    chrome.storage.sync.set({ newSection: updatedNewSection })
  }, [newSection])

  useEffect(() => {
    const updateNewSection = {...newSection}
    updateNewSection.worklistNumber = currentWorklistNumber
    setNewSection(updateNewSection)
    chrome.storage.sync.set({ currentWorklistNumber: currentWorklistNumber })
  }, [currentWorklistNumber])

  return (
    <div className="App">
      <CalendarContainer 
        sections={sections} 
        setSections={setSections} 
        newSection={newSection} 
        setInvalidSection={setInvalidSection}
        currentWorklistNumber={currentWorklistNumber}
        setCurrentWorklistNumber={setCurrentWorklistNumber}
      />

      <Form 
        currentWorklistNumber={currentWorklistNumber}
        newSection={newSection} 
        sections={sections} 
        invalidSection={invalidSection} 
        setNewSection={setNewSection} 
        setSections={setSections}
      />

      <button type='button' onClick={() => setSections([])}>Clear</button>
    </div>
  )
}

export default App
