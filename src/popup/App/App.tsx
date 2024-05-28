import React from 'react'
import { useEffect, useState } from 'react'
import './App.css'
import Form from '../Form/Form'
import Calendar from '../Calendar/Calendar'
import { ISectionData, baseSection } from './App.types'

function App() {
  const [newSection, setNewSection] = useState<ISectionData>(baseSection)
  const [sections, setSections] = useState<ISectionData[]>([])

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

  return (
    <div className="App">
      <Calendar sections={sections} setSections={setSections} newSection={newSection}/>
      <Form newSection={newSection} sections={sections} setNewSection={setNewSection} setSections={setSections}/>
      <button type='button' onClick={() => setSections([])}>Clear</button>
    </div>
  )
}

export default App
