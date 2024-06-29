import "../Form/Form.css"
import { useContext } from "react"
import { ModalDispatchContext, ModalPreset } from "../ModalLayer"
import { findCourseInfo } from "../../backends/scheduler/nameSearchApi"

const ManualCourseEntry = () => {
  const dispatchModal = useContext(ModalDispatchContext)

  const handleManualCourseEntry = () => {
    dispatchModal({
      preset: ModalPreset.ManualCourseEntry,
      additionalData: {
        onConfirm: async (searchTerm: string, manualUrl: string) => {
          console.log("reach")
          const selectedSection = await findCourseInfo(searchTerm, manualUrl)
          await chrome.storage.local.set({ newSection: selectedSection })
        },
      },
    })
  }
  return (
    <button
      className="ManualEntryButton"
      title="Manual Entry"
      onClick={() => handleManualCourseEntry()}
    >
      Add Course By Link
    </button>
  )
}

export default ManualCourseEntry
