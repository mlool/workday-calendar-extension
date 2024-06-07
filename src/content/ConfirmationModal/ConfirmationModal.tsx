import './ConfirmationModal.css'
import parse from 'html-react-parser';

interface IProps {
    title: string,
    message: string,
    onCancel: () => void,
    onConfirm: () => void
}

const ConfirmationModal = ({title, message, onCancel, onConfirm}:IProps) => {
  return (
    <div className='ConfirmationModalBackground'>
        <div className='ConfirmationModal'>
            <div className='ConfirmationModalHeader'>
                {title}
            </div>
            <div className='ConfirmationModalBody'>
                <div className='ConfiramtionModalBodyContent'>
                    {parse(message)}
                </div>
                <div className='ConfirmationModalButtonContainer'>
                    <div className='ConfirmationModalCancelButton' onClick={onCancel}>Cancel</div>
                    <div className='ConfirmationModalButton' onClick={onConfirm}>Confirm</div>
                </div>
            </div>
        </div>
    </div>
  );
}

export default ConfirmationModal