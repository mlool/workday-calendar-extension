import { useContext } from "react"
import { ISectionData } from "../App/App.types"
import {
  getAllSavedScheduleIDs,
  addCoursesToSavedSchedule,
} from "./syncSavedSchedulesHelper"
import { ModalDispatchContext, ModalPreset } from "../ModalLayer"
import "../Form/Form.css"

interface IProps {
  sections: ISectionData[]
}
const SyncSavedSchedules = (props: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext)

  const dispatchInstructions = () => {
    dispatchModal({
      preset: ModalPreset.SyncInstructions,
      additionalData: {
        syncErrors: null,
        onCancel: () => {
          return
        },
        onConfirm: () => beginSync(),
      },
    })
  }
  const beginSync = async () => {
    const scheduleID = getAllSavedScheduleIDs()
    if (scheduleID) {
      const possibleErrors = await addCoursesToSavedSchedule(
        props.sections,
        scheduleID[0]
      )
      if (possibleErrors) {
        dispatchModal({
          preset: ModalPreset.SyncErrors,
          additionalData: possibleErrors,
        })
      } else {
        dispatchModal({
          preset: ModalPreset.SyncConfirm,
        })
      }
    } else {
      alert(
        `No saved schedule was detected. The most likely issue is that you are not on the "View My Saved Schedules" page. Please head to that page and try again.`
      )
      return
    }
  }

  return (
    <button
      className="SyncWorklistButton"
      title="Sync Worklist"
      disabled={props.sections.length === 0}
      onClick={() => dispatchInstructions()}
    >
      Sync Worklist To Saved Schedules
    </button>
  )
}

export default SyncSavedSchedules
