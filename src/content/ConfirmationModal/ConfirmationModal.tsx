import { ISectionData } from "../App/App.types"
import "./ConfirmationModal.css"

interface IProps {
  title: string
  message: string
  onCancel: () => void
  onConfirm: (sections?: ISectionData[]) => void
  sections?: ISectionData[]
}

const ConfirmationModal = ({
  title,
  message,
  onCancel,
  onConfirm,
  sections,
}: IProps) => {
  const handleConfirm = () => {
    if (sections) {
      onConfirm(sections)
    } else {
      onConfirm()
    }
  }

  return (
    <div className="ConfirmationModalBackground">
      <div className="ConfirmationModal">
        <div className="ConfirmationModalHeader">{title}</div>
        <div className="ConfirmationModalBody">
          <div className="ConfiramtionModalBodyContent">{message}</div>
          <div className="ConfirmationModalButtonContainer">
            <div className="ConfirmationModalCancelButton" onClick={onCancel}>
              Cancel
            </div>
            <div className="ConfirmationModalButton" onClick={handleConfirm}>
              Confirm
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ConfirmationModal
