import CloseIcon from '../Icons/CloseIcon'
import './SettingInfoModal.css'

interface IProps {
    content: JSX.Element;
    onClose: () => void
}


const SettingInfoModal = ({ onClose, content }: IProps): JSX.Element => {
    return (
        <div className='setting-info-modal-overlay' onClick={onClose}>
            <div className='setting-info-modal-popup' onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <h2 className="popup-title">Info</h2>
                    </div>
                    <CloseIcon size={16} onClose={onClose} />
                </div>
                <div className="popup-content">
                    {content}
                </div>
            </div>
        </div>
    )
}

export default SettingInfoModal