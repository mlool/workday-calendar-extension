import { ISectionData } from '../App/App.types';
import './ConfirmationModal.css'
import { useState } from 'react';

interface IProps {
    title: string;
    message: string;
    onCancel: () => void;
    onConfirm: (text?: string, sections?: ISectionData[]) => void;
    showTextField?: boolean;
    textFieldValue?: string; 
    onTextFieldChange?: (textValue: string) => void
    sections?: ISectionData[]
  }
  
  const ConfirmationModal = ({
    title,
    message,
    onCancel,
    onConfirm,
    showTextField = false,
    textFieldValue = '',
    onTextFieldChange,
    sections,
  }: IProps) => {
    const [internalTextField, setInternalTextField] = useState(textFieldValue);
  
    const handleTextFieldChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      setInternalTextField(event.target.value);
      onTextFieldChange?.(event.target.value);
    };
  
    const handleConfirm = () => {
      if (internalTextField) {
        onConfirm(internalTextField, sections); 
      }
      else {
        onConfirm()
      }
    };
  
    return (
      <div className='ConfirmationModalBackground'>
        <div className='ConfirmationModal'>
          <div className='ConfirmationModalHeader'>
            {title}
          </div>
          <div className='ConfirmationModalBody'>
            <div className='ConfiramtionModalBodyContent'>
              {message}
            </div>
            {showTextField && (
              <input
                type="text"
                className="ConfirmationModalTextField"
                value={internalTextField} 
                onChange={handleTextFieldChange}
              />
            )}
            <div className='ConfirmationModalButtonContainer'>
              <div className='ConfirmationModalCancelButton' onClick={onCancel}>
                Cancel
              </div>
              <div className='ConfirmationModalButton' onClick={handleConfirm}>
                Confirm
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  
  export default ConfirmationModal;