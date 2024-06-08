import { useEffect, useState } from 'react';
import './App.css';
import CalendarContainer from '../CalendarContainer/CalendarContainer';
import { ISectionData, Term, Views, baseSection } from './App.types';
import Form from '../Form/Form';
import TopBar from '../TopBar/TopBar';
import Settings from '../Settings/Settings';
import { assignColors, ColorTheme } from '../../helpers/courseColors';

function App() {
  const [newSection, setNewSection] = useState<ISectionData>(baseSection);
  const [sections, setSections] = useState<ISectionData[]>([]);
  const [invalidSection, setInvalidSection] = useState<boolean>(false);
  const [currentWorklistNumber, setCurrentWorklistNumber] = useState<number>(0);
  const [currentTerm, setCurrentTerm] = useState<Term>(Term.winterOne);
  const [currentView, setCurrentView] = useState<Views>(Views.calendar);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(ColorTheme.Green);
  const [selectedSection, setSelectedSection] = useState<ISectionData | null>(null)
  // const prevColorTheme = useRef(colorTheme);
  // const prevSections = useRef(sections);
  // Sync initial state with chrome storage on mount
  useEffect(() => {
    const syncInitialState = () => {
      chrome.storage.sync.get([
        'newSection',
        'currentTerm',
        'colorTheme',
        'sections',
        'currentWorklistNumber',
      ], (result) => {
        if (result.newSection !== undefined) {
          setNewSection(result.newSection);
        }
        if (result.currentTerm !== undefined) {
          setCurrentTerm(result.currentTerm);
        }
        if (result.colorTheme !== undefined) {
          setColorTheme(result.colorTheme);
        }
        if (result.sections !== undefined) {
          setSections(
            assignColors(result.sections, result.colorTheme || ColorTheme.Green)
          );
        }
        if (result.currentWorklistNumber !== undefined) {
          setCurrentWorklistNumber(result.currentWorklistNumber);
        }
      });
    };

    const handleStorageChange = (
      changes: { [key: string]: chrome.storage.StorageChange },
      areaName: string
    ) => {
      if (areaName === 'sync') {
        if (changes.newSection && JSON.stringify(changes.newSection.newValue) !== JSON.stringify(newSection)) {
          setNewSection(changes.newSection.newValue);
        }
      }
    };

    syncInitialState();
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => {
      chrome.storage.onChanged.removeListener(handleStorageChange);
    };

  }, []); // Run only once on mount

  // Update chrome storage whenever relevant state changes
  useEffect(() => {
    chrome.storage.sync.set({ sections });
    // alert(JSON.stringify(sections, null, 2))
  }, [sections]);

  useEffect(() => {
    if (newSection.code !== baseSection.code) {
      if (newSection.term != Term.winterFull) {
        //Don't set the term to WF, just keep the term to what is selected
        setCurrentTerm(newSection.term);
      }
    }
  }, [newSection]);

  useEffect(() => {
    chrome.storage.sync.set({ currentWorklistNumber });
  }, [currentWorklistNumber]);

  useEffect(() => {
    chrome.storage.sync.set({ currentTerm });
  }, [currentTerm]);

  useEffect(() => {
    chrome.storage.sync.set({ colorTheme });
  }, [colorTheme]);

  useEffect(() => {
    // Check if there is a real change to trigger the update
    // if (prevColorTheme.current !== colorTheme || JSON.stringify(prevSections.current) !== JSON.stringify(sections)) {
    const newSections = assignColors(sections, colorTheme);

    if (JSON.stringify(newSections) !== JSON.stringify(sections)) {
      setSections(newSections);
    }

    // Update refs
    // prevColorTheme.current = colorTheme;
    // prevSections.current = sections;
    // }
  }, [colorTheme, sections]); // React only if these values change

  return (
    <div className="App">
      <TopBar currentView={currentView} setCurrentView={setCurrentView} />
      {currentView === Views.calendar ? (
        <div className="CalendarViewContainer">
          <CalendarContainer
            sections={sections}
            setSections={setSections}
            newSection={newSection}
            setInvalidSection={setInvalidSection}
            currentWorklistNumber={currentWorklistNumber}
            setCurrentWorklistNumber={setCurrentWorklistNumber}
            currentTerm={currentTerm}
            setCurrentTerm={setCurrentTerm}
            selectedSection={selectedSection}
            setSelectedSection={setSelectedSection}
          />

          <Form
            currentWorklistNumber={currentWorklistNumber}
            newSection={newSection}
            sections={sections}
            invalidSection={invalidSection}
            setNewSection={setNewSection}
            setSections={setSections}
            currentTerm={currentTerm}
            colorTheme={colorTheme}
            setColorTheme={setColorTheme}
            setSelectedSection={setSelectedSection}
          />
        </div>
      ) : (
        <Settings 
          colorTheme={colorTheme} 
          sections={sections}
          setColorTheme={setColorTheme}
          setSections={setSections}
        />
      )}
    </div>
  );
}

export default App;
