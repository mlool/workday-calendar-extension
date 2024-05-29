// import React from 'react'
import { useEffect, useState } from 'react'
import './App.css'
// import Form from '../Form/Form'
import Calendar from '../Calendar/Calendar'
import { ISectionData, baseSection } from './App.types'
import Form from '../Form/Form'

function App() {
  const [newSection, setNewSection] = useState<ISectionData>(baseSection)
  const [sections, setSections] = useState<ISectionData[]>([])
  const [invalidSection, setInvalidSection] = useState<boolean>(false)

  useEffect(() => {
    const handleStorageChange = () => {
      chrome.storage.sync.get(['newSection'], (result) => {
        if (result.newSection !== undefined) {
          setNewSection(result.newSection)
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
        setNewSection(result.newSection)
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
    chrome.storage.sync.set({ sections: sections })
  }, [sections])

  useEffect(() => {
    chrome.storage.sync.set({ newSection: newSection })
  }, [newSection])

  return (
    <div className="App">
      <Calendar sections={sections} setSections={setSections} newSection={newSection} setInvalidSection={setInvalidSection}/>
      <Form newSection={newSection} sections={sections} invalidSection={invalidSection} setNewSection={setNewSection} setSections={setSections}/>
      <button type='button' onClick={() => setSections([])}>Clear</button>
    </div>
  )
}

export default App
