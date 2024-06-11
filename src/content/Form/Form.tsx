import { ISectionData } from "../App/App.types";
import "./Form.css";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import { useState } from "react";

interface IProps {
  newSection: ISectionData | null;
  sectionConflict: boolean;
  currentWorklistNumber: number;
  handleAddNewSection: () => void;
  handleClearWorklist: () => void;
  handleCancel: () => void;
}

const Form = (props: IProps) => {
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);

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
