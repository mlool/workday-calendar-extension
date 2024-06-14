import { Reducer, useEffect, useState } from "react";
import "./App.css";
import CalendarContainer from "../CalendarContainer/CalendarContainer";
import { ISectionData, Term, Views } from "./App.types";
import Form from "../Form/Form";
import TopBar from "../TopBar/TopBar";
import Settings from "../Settings/Settings";
import {
  assignColors,
  ColorTheme,
  getNewSectionColor,
} from "../../helpers/courseColors";
import {
  ModalAction,
  ModalAlignment,
  ModalConfig,
  ModalLayer,
  ModalPreset,
} from "../ModalLayer";
import SectionInfoBody from "../SectionPopup/SectionPopup";

function App() {
  const [newSection, setNewSection] = useState<ISectionData | null>(null);
  const [sections, setSections] = useState<ISectionData[]>([]);
  const [sectionConflict, setSectionConflict] = useState<boolean>(false);
  const [currentWorklistNumber, setCurrentWorklistNumber] = useState<number>(0);
  const [currentTerm, setCurrentTerm] = useState<Term>(Term.winterOne);
  const [currentView, setCurrentView] = useState<Views>(Views.calendar);
  const [colorTheme, setColorTheme] = useState<ColorTheme>(ColorTheme.Green);
  const [selectedSection, setSelectedSection] = useState<ISectionData | null>(
    null
  );
  // const prevColorTheme = useRef(colorTheme);
  // const prevSections = useRef(sections);
  // Sync initial state with chrome storage on mount
  useEffect(() => {
    const syncInitialState = () => {
      chrome.storage.local.get(
        ["currentTerm", "colorTheme", "sections", "currentWorklistNumber"],
        (result) => {
          if (result.currentTerm !== undefined) {
            setCurrentTerm(result.currentTerm);
          }
          if (result.colorTheme !== undefined) {
            setColorTheme(result.colorTheme);
          }
          if (result.sections !== undefined) {
            setSections(
              assignColors(
                result.sections,
                result.colorTheme || ColorTheme.Green
              )
            );
          }
          if (result.currentWorklistNumber !== undefined) {
            setCurrentWorklistNumber(result.currentWorklistNumber);
          }
        }
      );
    };

    const handleStorageChange = (changes: {
      [key: string]: chrome.storage.StorageChange;
    }) => {
      if (changes.newSection) {
        const newVal = changes.newSection.newValue;
        if (newVal === null) return;
        setNewSection(newVal);
        if (newVal.term !== Term.winterFull) {
          //Don't set the term to WF, just keep the term to what is selected
          setCurrentTerm(newVal.term);
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
    chrome.storage.local.set({ sections });
    // alert(JSON.stringify(sections, null, 2))
  }, [sections]);

  useEffect(() => {
    chrome.storage.local.set({ currentWorklistNumber });
  }, [currentWorklistNumber]);

  useEffect(() => {
    chrome.storage.local.set({ currentTerm });
  }, [currentTerm]);

  useEffect(() => {
    chrome.storage.local.set({ colorTheme });
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

  const handleAddNewSection = () => {
    let updatedNewSection = newSection!;
    updatedNewSection.worklistNumber = currentWorklistNumber;
    updatedNewSection.color = getNewSectionColor(
      sections,
      updatedNewSection,
      colorTheme
    );

    setSections([...sections, updatedNewSection]);
    setNewSection(null);
  };

  const handleDeleteSelectedSection = () => {
    setSections(sections.filter((s) => s !== selectedSection));
    setSelectedSection(null);
  };

  const handleCancelNewSection = () => {
    setNewSection(null);
    chrome.storage.local.set({ newSection: null });
  };

  const handleClearWorklist = () => {
    const updatedSections = sections.filter(
      (x) => x.worklistNumber !== currentWorklistNumber
    );
    setSections(updatedSections);
    setSelectedSection(null);
  };

  const modalReducer: Reducer<ModalConfig | null, ModalAction> = (
    conf: ModalConfig | null,
    action: ModalAction
  ): ModalConfig | null => {
    switch (action.preset) {
      case ModalPreset.CLEAR:
        return null;
      case ModalPreset.ConfirmClearWorklist:
        return {
          title: "Confirm Clear Worklist",
          body: `Clearing the worklist will remove all sections from both terms under worklist ${currentWorklistNumber}. Are you sure you want to continue?`,
          closeButtonText: "Cancel",
          actionButtonText: "Confirm",
          actionHandler: handleClearWorklist,
        };
      case ModalPreset.AutofillSettingInfo:
        return {
          title: "Info: Enable Autofill",
          body: 'Autofills "Find Course Sections".',
        };
      case ModalPreset.HidePfpInfo:
        return {
          title: "Info: Hide Profile Picture",
          body: "Hides your profile picture.",
        };
      case ModalPreset.SectionPopup:
        return {
          title: selectedSection!.code,
          body: <SectionInfoBody selectedSection={selectedSection!} />,
          closeButtonText: "Close",
          actionButtonText: "Remove",
          actionHandler: handleDeleteSelectedSection,
          cancelHandler: () => setSelectedSection(null),
          alignment: ModalAlignment.Top,
          hasTintedBg: false,
        };
      default:
        throw Error("ModalPreset not valid!");
    }
  };

  return (
    <ModalLayer
      reducer={modalReducer}
      children={
        <div className="App">
          <TopBar currentView={currentView} setCurrentView={setCurrentView} />
          {currentView === Views.calendar ? (
            <div className="CalendarViewContainer">
              <CalendarContainer
                sections={sections}
                setSections={setSections}
                newSection={newSection}
                setSectionConflict={setSectionConflict}
                currentWorklistNumber={currentWorklistNumber}
                setCurrentWorklistNumber={setCurrentWorklistNumber}
                currentTerm={currentTerm}
                setCurrentTerm={setCurrentTerm}
                selectedSection={selectedSection}
                setSelectedSection={setSelectedSection}
              />

              <Form
                newSection={newSection}
                sectionConflict={sectionConflict}
                handleAddNewSection={handleAddNewSection}
                handleCancel={handleCancelNewSection}
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
      }
    />
  );
}

export default App;
