import { useEffect, useState } from 'react'
import './App.css'
import CalendarContainer from '../CalendarContainer/CalendarContainer'
import { ISectionData, Term, Views, baseSection } from './App.types'
import Form from '../Form/Form'
import TopBar from '../TopBar/TopBar'

function App() {
  const [newSection, setNewSection] = useState<ISectionData>(baseSection)
  const [sections, setSections] = useState<ISectionData[]>([])
  const [invalidSection, setInvalidSection] = useState<boolean>(false)
  const [currentWorklistNumber, setCurrentWorklistNumber] = useState<number>(0)
  const [currentTerm, setCurrentTerm] = useState<Term>(Term.winterOne)
  const [currentView, setCurrentView] = useState<Views>(Views.calendar)

  useEffect(() => {
    const handleStorageChange = () => {
      chrome.storage.sync.get(['newSection', 'currentTerm'], (result) => {
        if (result.newSection !== undefined && newSection.code !== result.newSection.code) {
          setNewSection(result.newSection)
        }
      })
    };
    chrome.storage.onChanged.addListener((handleStorageChange));
    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };
  }, [chrome.storage.sync.get(['newSection'])]);

  // Is this code needed, is it not just doing the same thing as above?
  useEffect(() => {
    chrome.storage.sync.get(['newSection'], (result) => {
      if (result.newSection !== undefined) {
        console.log(result.newSection)
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
    chrome.storage.sync.get(['currentWorklistNumber'], (result) => {
      if (result.currentWorklistNumber !== undefined) {
        setCurrentWorklistNumber(result.currentWorklistNumber)
      }
    })
  }, [])

  useEffect(() => {
    chrome.storage.sync.get(['currentTerm'], (result) => {
      if (result.currentTerm !== undefined) {
        setCurrentTerm(result.currentTerm)
      }
    })
  }, [])

  //I think we prob want to move the setters which are dependent on the react state above the 
  //getters or else we can overwrite an updated state
  useEffect(() => {
    chrome.storage.sync.set({ sections: sections })
  }, [sections])

  useEffect(() => {
    chrome.storage.sync.set({ newSection: newSection })
    if (newSection.code !== baseSection.code)
      {
        setCurrentTerm(newSection.term)
      }
  }, [newSection])

  useEffect(() => {
    chrome.storage.sync.set({ currentWorklistNumber: currentWorklistNumber })
  }, [currentWorklistNumber])

  useEffect(() => {
    chrome.storage.sync.set({ currentTerm: currentTerm })
  }, [currentTerm])
  

  return (
    // <div className="App">
    //   {/* <TopBar currentView={currentView} setCurrentView={setCurrentView}/> */}
    //   {/* {currentView === Views.calendar ?  */}
        <div className="CalendarviewContainer">
          <CalendarContainer 
            sections={sections} 
            setSections={setSections} 
            newSection={newSection} 
            setInvalidSection={setInvalidSection}
            currentWorklistNumber={currentWorklistNumber}
            setCurrentWorklistNumber={setCurrentWorklistNumber}
            currentTerm={currentTerm}
            setCurrentTerm={setCurrentTerm}
          />

          <Form 
            currentWorklistNumber={currentWorklistNumber}
            newSection={newSection} 
            sections={sections} 
            invalidSection={invalidSection} 
            setNewSection={setNewSection} 
            setSections={setSections}
            currentTerm={currentTerm}
          />
        </div>
    //      {/* :
    //     <div>
    //       Settings Page
    //     </div>
    //   } */}
    // </div>
  )
}

export default App
