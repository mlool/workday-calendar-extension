import { useEffect, useState } from 'react'
import './App.css'
import CalendarContainer from '../CalendarContainer/CalendarContainer'
import { ISectionData, baseSection } from './App.types'
import Form from '../Form/Form'
import { assignColors, ColorTheme } from '../../helpers/courseColors'
import ThemePicker from '../ThemePicker/ThemePicker'

function App() {
  const [newSection, setNewSection] = useState<ISectionData>(baseSection)
  const [sections, setSections] = useState<ISectionData[]>([])
  const [invalidSection, setInvalidSection] = useState<boolean>(false)
  const [currentWorklistNumber, setCurrentWorklistNumber] = useState<number>(0)
  const [colorTheme, setColorTheme] = useState<ColorTheme>(ColorTheme.Green)

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
      let theme = colorTheme
      chrome.storage.sync.get(['colorTheme'], (result) => {
        if(result.colorTheme !== undefined){
          theme = result.colorTheme
          setColorTheme(theme)
        }
      })

      chrome.storage.sync.get(['sections'], (result) => {
      if (result.sections !== undefined) {
        // assign a color
        let sections: ISectionData[] = assignColors(result.sections, theme)
        setSections(sections)
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
    chrome.storage.sync.set({ newSection: newSection })
  }, [newSection])

  useEffect(() => {
    chrome.storage.sync.set({ currentWorklistNumber: currentWorklistNumber })
  }, [currentWorklistNumber])

  useEffect(() => {
    chrome.storage.sync.set({ colorTheme: colorTheme })

    let newSections: ISectionData[] = assignColors(sections, colorTheme)
    setSections(newSections)
  }, [colorTheme])

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
        colorTheme={colorTheme}
      />
      <ThemePicker colorTheme={colorTheme} setColorTheme={setColorTheme}/>
    </div>
  )
}

export default App
