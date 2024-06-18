import { ISectionData } from "../App/App.types";
import "./Form.css";
import { useContext } from "react";
import { ModalDispatchContext, ModalPreset } from "../ModalLayer";

interface IProps {
  sections: ISectionData[];
  newSection: ISectionData | null;
  sectionConflict: boolean;
  handleAddNewSection: () => void;
  handleCancel: () => void;
}

const Form = (props: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext);

  return (
    <div className="NewSectionForm">
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
        onClick={() =>
          dispatchModal({ preset: ModalPreset.ConfirmClearWorklist })
        }
      >
        Clear Worklist
      </div>
    </div>
  );
};

export default Form;
