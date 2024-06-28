import '../Form/Form.css'
import { useContext } from 'react'
import { ModalDispatchContext, ModalPreset } from '../ModalLayer'

const ManualCourseEntry = () => {
  const dispatchModal = useContext(ModalDispatchContext)

    const handleManualCourseEntry = () => {
      dispatchModal({ preset: ModalPreset.ManualCourseEntry })
    }
  return (
    <button
      className="ManualEntryButton"
      title="Sync Worklist"
      onClick={() => handleManualCourseEntry()}
    >
      Manually Add Course
    </button>
  )
}

export default ManualCourseEntry
