import { useState } from "react";
import { ISectionData } from "../App/App.types";
import ConfirmationModal from "../ConfirmationModal/ConfirmationModal";
import {
  getAllSavedScheduleIDs,
  addCoursesToSavedSchedule,
} from "./syncSavedSchedulesHelper";

interface IProps {
  sections: ISectionData[];
  isVisible: boolean;
  onClose: () => void;
}
const SyncSavedSchedules = (props: IProps) => {
  const [showInstructions, setShowInstructions] = useState<boolean>(true);
  const [confirmationMessage, setConfirmationMessage] =
    useState<boolean>(false);

  const beginSync = async () => {
    const scheduleID = getAllSavedScheduleIDs();
    if (scheduleID) {
      await addCoursesToSavedSchedule(props.sections, scheduleID[0]);
      setConfirmationMessage(true);
    } else {
      alert(
        `No saved schedule was detected. The most likely issue is that you are not on the "View My Saved Schedules" page. Please head to that page and try again.`
      );
    }
  };

  return (
    <div style={{ display: props.isVisible ? "block" : "none" }}>
      {showInstructions && (
        <ConfirmationModal
          title="Sync Saved Schedules Instructions"
          message={`Please note that you must be on the "View Saved Schedules" page. If you have multiple schedules, click the "add course sections" button on the one you which to add to, otherwise it will add to the first one. You must have all requirements (for example class requires lab and lecture) in your worklist.`}
          onCancel={props.onClose}
          onConfirm={() => {
            beginSync();
          }}
        />
      )}
      {confirmationMessage && (
        <ConfirmationModal
          title="Success"
          message={`Any matching classes were added to this saved schedule! Please refresh page to see changes.`}
          onCancel={props.onClose}
          onConfirm={() => {
            setConfirmationMessage(false);
            props.onClose();
          }}
        />
      )}
    </div>
  );
};

export default SyncSavedSchedules;
