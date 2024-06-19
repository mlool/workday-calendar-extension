import "./InfoModal.css"
import CloseIcon from "../Icons/CloseIcon"

interface IProps {
  message: string
  onCancel: () => void
}

const InfoModal = ({ message, onCancel }: IProps) => {
  return (
    <div className="InfoModalBackground">
      <div className="InfoModal">
        <div className="InfoModalHeader">
          <div className="InfoModalCloseButton" onClick={onCancel}>
            <CloseIcon size={16} color="white" />
          </div>
        </div>
        <div className="ConfirmationModalBody">
          <div className="ConfiramtionModalBodyContent">{message}</div>
        </div>
      </div>
    </div>
  )
}

export default InfoModal
