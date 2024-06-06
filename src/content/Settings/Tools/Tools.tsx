import { useEffect, useState } from 'react';
import './Tools.css';
import '../Settings.css';
import InfoModal from '../../InfoModal/InfoModal';
import QuestionIcon from '../../Icons/QuestionIcon';

interface IProps {
    setInfoPopupMessage: (message: string) => void;
}

const Tools = ({setInfoPopupMessage}:IProps) => {
  const [autofillEnabled, setAutofillEnabled] = useState(false);

  useEffect(() => {
    // Retrieve the stored state from localStorage
    const storedAutofillEnabled = localStorage.getItem('autofillEnabled') === 'true';
    setAutofillEnabled(storedAutofillEnabled);
  }, []);

  const handleAutofillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked;
    setAutofillEnabled(isEnabled);
    // Store the state in localStorage
    localStorage.setItem('autofillEnabled', isEnabled.toString());

    const event = new CustomEvent('autofillToggle', { detail: { enabled: isEnabled } });
    window.dispatchEvent(event);
  };

  return (
    <div>
        <div className="SettingsHeader">Tools</div>
        <hr className='Divider' />
        <div className="ToolsBodyContainer">
            <div className='ToolItem'>
                <div className="ToolContainer">
                  <div><input type="checkbox" checked={autofillEnabled} onChange={handleAutofillChange} /></div>                
                  <div>Enable Autofill</div>
                </div>
                <div className='ToolItemInfoButton' onClick={() => setInfoPopupMessage("Autofills Find Course Sections")}>
                  <QuestionIcon size={16} color='black' />
                </div>
            </div>
        </div>
    </div>
  );
};

export default Tools;
