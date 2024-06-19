import { useContext } from "react"
import { ISectionData } from "../App/App.types"
import {
  getAllSavedScheduleIDs,
  addCoursesToSavedSchedule,
} from "./syncSavedSchedulesHelper"
import { ModalDispatchContext, ModalPreset } from "../ModalLayer"

interface IProps {
  sections: ISectionData[]
  isVisible: boolean
  onClose: () => void
}
const SyncSavedSchedules = (props: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext)

  if (props.isVisible) {
    dispatchModal({
      preset: ModalPreset.SyncInstructions,
      additionalData: {
        syncErrors: null,
        onCancel: props.onClose,
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
          additionalData: {
            syncErrors: possibleErrors,
            oncancel: props.onClose,
            onConfirm: props.onClose,
          },
        })
      } else {
        dispatchModal({
          preset: ModalPreset.SyncConfirm,
          additionalData: {
            syncErrors: null,
            oncancel: props.onClose,
            onConfirm: props.onClose,
          },
        })
      }
    } else {
      alert(
        `No saved schedule was detected. The most likely issue is that you are not on the "View My Saved Schedules" page. Please head to that page and try again.`
      )
      return
    }
  }

  return <div></div>
}

export default SyncSavedSchedules
