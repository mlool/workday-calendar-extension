import "../Form/Form.css"
import { useContext } from "react"
import { ModalDispatchContext, ModalPreset } from "../ModalLayer"
import { findCourseInfo } from "../../backends/scheduler/nameSearchApi"

const ManualCourseEntry = () => {
  const dispatchModal = useContext(ModalDispatchContext)

  const postModal = () => {
    dispatchModal({
      preset: ModalPreset.ManualCourseEntry,
      additionalData: handleManualEntrySubmit,
    })
  }

  const handleManualEntrySubmit = async (manualUrl: string) => {
    const selectedSection = await findCourseInfo("MANUAL_ENTRY", manualUrl)
    await chrome.storage.local.set({ newSection: selectedSection })
  }

  return (
    <button
      className="ManualEntryButton"
      title="Manual Entry"
      onClick={() => postModal()}
    >
      Add Course By Link
    </button>
  )
}

export default ManualCourseEntry
