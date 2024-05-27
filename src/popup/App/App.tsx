import React from 'react'
import { useEffect, useState } from 'react'
import './App.css'
import Form from '../Form/Form'
import Calendar from '../Calendar/Calendar'
import { ISectionData, baseSection } from './App.types'

function App() {
  const [newSection, setNewSection] = useState<ISectionData>(baseSection)
  const [sections, setSections] = useState<ISectionData[]>()

  useEffect(() => {console.log(newSection)}, [newSection])

  return (
    <div className="App">
      <Calendar />
      <Form newSection={newSection} setNewSection={setNewSection} setSections={setSections}/>
    </div>
  )
}

export default App
