import { useState, useContext } from "react"
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
            data: possibleErrors,
            oncancel: props.onClose,
            onConfirm: props.onClose,
          },
        })
      } else {
        dispatchModal({
          preset: ModalPreset.SyncConfirm,
          additionalData: {
            data: "",
            oncancel: props.onClose,
            onConfirm: props.onClose,
          },
        })
      }
    } else {
      alert(
        `No saved schedule was detected. The most likely issue is that you are not on the "View My Saved Schedules" page. Please head to that page and try again.`
      )
    }
  }
  if (props.isVisible) {
    dispatchModal({
      preset: ModalPreset.SyncInstructions,
      additionalData: {
        data: null,
        onCancel: props.onClose,
        onConfirm: () => beginSync(),
      },
    })
  }

  return <div style={{ display: props.isVisible ? "block" : "none" }}></div>
}

export default SyncSavedSchedules
