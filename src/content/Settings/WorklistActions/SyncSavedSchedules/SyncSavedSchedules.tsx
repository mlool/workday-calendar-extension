import { useContext, useState } from "react"
import { ISectionData } from "../../../App/App.types"
import {
  getAllSavedScheduleIDs,
  savedScheduleTerm,
} from "./syncSavedSchedulesHelper"
import { ModalDispatchContext, ModalPreset } from "../../../ModalLayer"
import { addCoursesToSavedSchedule } from "../../../../backends/workday/savedSchedulesApi"
import "./SyncSavedSchedules.css"
import QuestionIcon from "../../../Icons/QuestionIcon"
import { filterSections } from "../../../utils"
import TabBar from "../../../../components/TabBar"

interface IProps {
  sections: ISectionData[]
}
const SyncSavedSchedules = (props: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedWorklist, setSelectedWorklist] = useState<number>(0)

  const dispatchInstructions = () => {
    dispatchModal({
      preset: ModalPreset.SyncInstructions,
    })
  }

  const beginSync = async () => {
    const scheduleID = getAllSavedScheduleIDs()
    if (scheduleID) {
      const possibleErrors = await addCoursesToSavedSchedule(
        filterSections(props.sections, selectedWorklist, savedScheduleTerm()),
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

  const handleClick = () => {
    setIsOpen(!isOpen)
  }

  return (
    <div className="sync-drawer">
      <div className="title" onClick={handleClick}>
        Sync To Saved Schedules {isOpen ? "\u25B2" : "\u25BC"}
      </div>
      {isOpen && (
        <div className="drawer-content">
          <div className="instructions-container">
            <div className="instructions-prompt">Instructions</div>
            <div
              className="instructions-info-button"
              onClick={dispatchInstructions}
            >
              <QuestionIcon size={16} />
            </div>
          </div>
          <div className="worklist-container">
            <div>Worklist: </div>
            {[0, 1, 2, 3].map((worklist) => (
              <div
                key={worklist}
                className="worklist-buttton"
                style={
                  selectedWorklist === worklist
                    ? { backgroundColor: "rgb(156, 232, 255)" }
                    : {}
                }
                onClick={() => setSelectedWorklist(worklist)}
              >
                {worklist}
              </div>
            ))}
            <button className="sync-button" onClick={beginSync}>
              Sync
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SyncSavedSchedules
