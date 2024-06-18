import { ISectionData } from "../App/App.types";
import "./Form.css";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import SyncSavedSchedules from "../SyncSavedSchedules/SyncSavedSchedules";
import { useState } from "react";

interface IProps {
  sections: ISectionData[];
  newSection: ISectionData | null;
  sectionConflict: boolean;
  currentWorklistNumber: number;
  handleAddNewSection: () => void;
  handleClearWorklist: () => void;
  handleCancel: () => void;
}

const Form = (props: IProps) => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [showSyncConfirmation, setShowSyncConfirmation] = useState<boolean>(false);

  let filteredSections:ISectionData[] = []
  for (const section of props.sections) {
    if(section.worklistNumber == props.currentWorklistNumber) {
      filteredSections.push(section)
    }
  }

  return (
    <div className="NewSectionForm">
      {showConfirmation && (
        <ConfirmationModal
          title="Confirm Clear Worklist"
          message={`Clearing the worklist will remove all sections from both terms under worklist ${props.currentWorklistNumber}. Are you sure you want to continue?`}
          onCancel={() => setShowConfirmation(false)}
          onConfirm={() => {
            props.handleClearWorklist();
            setShowConfirmation(false);
          }}
        />
      )}
      {showSyncConfirmation && (
        <ConfirmationModal
          title="Select Saved Schedule Name"
          message={`Please note that you will need to have an existing saved schedule made in Workday for both terms. If you do not have one made, go back and make an empty saved schedule with a 'dummy' course. You will have to do this twice, once for term 1 and once for term 2. Click confirm to continue`}
          onCancel={() => setShowSyncConfirmation(false)}
          onConfirm={(sections?: ISectionData[]) => {
            if (sections) {
                SyncSavedSchedules(filteredSections);
            }
            setShowSyncConfirmation(false);
        }}
          sections={filteredSections}
        />
      )}
      {props.newSection && (
        <div className="NewSectionInfo">
          <div className="NewSectionCode">{props.newSection.code}</div>
          <div>{props.newSection.name}</div>
        </div>
      )}
      <div className="NewSectionButtonContainer">
        <button
          className="NewSectionButton"
          disabled={props.newSection === null}
          title="Cancel"
          onClick={props.handleCancel}
        >
          Cancel
        </button>
        <button
          className="NewSectionButton"
          disabled={props.sectionConflict || props.newSection === null}
          title="Add Section"
          onClick={props.handleAddNewSection}
        >
          Add Section
        </button>
      </div>
      <button
        className="SyncWorklistButton"
        title="Sync Worklist"
        disabled={filteredSections.length == 0}
        onClick={() => setShowSyncConfirmation(true)}
      >
        Sync Worklist To Saved Schedules
      </button>
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
