import { ColorTheme, getNewSectionColor } from "../../helpers/courseColors";
import { ISectionData, Term, baseSection } from "../App/App.types";
import "./Form.css";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { useState } from "react";

interface IProps {
  newSection: ISectionData;
  sections: ISectionData[];
  invalidSection: boolean;
  currentWorklistNumber: number;
  setNewSection: (data: ISectionData) => void;
  setSections: (data: ISectionData[]) => void;
  currentTerm: Term;
  colorTheme: ColorTheme;
  setColorTheme: (theme: ColorTheme) => void;
  setSelectedSection: (section: ISectionData | null) => void;
}

const Form = ({
  newSection,
  sections,
  invalidSection,
  currentWorklistNumber,
  setNewSection,
  setSections,
  currentTerm,
  colorTheme,
  setColorTheme,
  setSelectedSection,
}: IProps) => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

  const onAdd = () => {
    if (invalidSection) return;
    let updatedNewSection = newSection;
    updatedNewSection.worklistNumber = currentWorklistNumber;
    updatedNewSection.color = getNewSectionColor(
      sections,
      updatedNewSection,
      colorTheme
    );

    let newSections = [...sections];

    newSections.push(updatedNewSection);
    setSections(newSections);
    chrome.storage.local.set({ newSection: baseSection });
  };

  const onCancel = () => {
    // setNewSection(baseSection)
    chrome.storage.local.set({ newSection: baseSection });
  };

  const onClear = () => {
    let newSections: ISectionData[] = [];
    sections.forEach((section) => {
      if (section.worklistNumber !== currentWorklistNumber) {
        newSections.push({ ...section });
      }
    });
    setSections(newSections);
  };

  return (
    <div className="NewSectionForm">
      {showConfirmation && (
        <ConfirmationModal
          title="Confirm Clear Worklist"
          message={`Clearing the worklist will remove all sections from both terms under worklist ${currentWorklistNumber}. Are you sure you want to continue?`}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => {
            onClear();
            setShowConfirmation(false);
            setSelectedSection(null);
          }}
        />
      )}
      <div className="NewSectionInfo">
        <div className="NewSectionCode">{newSection.code}</div>
        <div>{newSection.name}</div>
      </div>
      <div className="NewSectionButtonContainer">
        <div
          className="NewSectionButton"
          title="Cancel"
          onClick={onCancel}
          style={{
            backgroundColor:
              invalidSection && !newSection.code && !newSection.name
                ? "#c4c4c4"
                : "",
          }}
        >
          Cancel
        </div>
        <div
          className="NewSectionButton"
          title="Add Section"
          onClick={onAdd}
          style={{ backgroundColor: invalidSection ? "#c4c4c4" : "" }}
        >
          Add Section
        </div>
      </div>
      <div
        className="ClearWorklistButton"
        title="Clear Worklist"
        onClick={() => setShowConfirmation(true)}
      >
        Clear Worklist
      </div>
    </div>
  );
};

export default Form;
