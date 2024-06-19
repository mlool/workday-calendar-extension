import { ISectionData } from "../App/App.types";
import "./Form.css";
import { useContext, useState } from "react";
import { ModalDispatchContext, ModalPreset } from "../ModalLayer";
import SyncSavedSchedules from "../SyncSavedSchedules/SyncSavedSchedules";

interface IProps {
  sections: ISectionData[];
  newSection: ISectionData | null;
  sectionConflict: boolean;
  handleAddNewSection: () => void;
  handleCancel: () => void;
  currentWorklist: number;
}

const Form = (props: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext);
  const [isSyncComponentVisible, setIsSyncComponentVisible] = useState(false);

  const handleSyncClick = () => {
    setIsSyncComponentVisible(true);
  };

  const closeSyncComponent = () => {
    setIsSyncComponentVisible(false);
  };

  let sectionsForWorklist:ISectionData[] = []
  for (const section of props.sections) {
    if(section.worklistNumber == props.currentWorklist) {
      sectionsForWorklist.push(section)
    }
  }

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
        disabled={sectionsForWorklist.length == 0}
        onClick={handleSyncClick}
      >
        Sync Worklist To Saved Schedules
      </button>
      <SyncSavedSchedules sections={sectionsForWorklist}  isVisible={isSyncComponentVisible} onClose={closeSyncComponent}/>
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
