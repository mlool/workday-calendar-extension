import { ColorTheme } from '../../helpers/courseColors';
import ThemePicker from './ThemePicker';
import './Settings.css';
import { ISectionData } from '../App/App.types';
import DiscordButton from '../DiscordButton/DiscordButton';
import React, { useState, useEffect } from 'react';
import InfoModal from '../InfoModal/InfoModal';
import Tools from './Tools/Tools';
import Theme from './Theme/Theme';
import ExportImport from './ExportImport/ExportImport';
import Contact from './Contact/Contact';

interface ISettingsProps {
  colorTheme: ColorTheme;
  sections: ISectionData[];
  setColorTheme: (theme: ColorTheme) => void;
  setSections: (data: ISectionData[]) => void;
}

const Settings = ({ colorTheme, sections, setColorTheme, setSections }: ISettingsProps) => {

  const [infoPopupMessage, setInfoPopupMessage] = useState<string>("")
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
      {infoPopupMessage !== "" && <InfoModal message={infoPopupMessage} onCancel={() => setInfoPopupMessage("")}/>}
      <div className="Settings">
        <Theme colorTheme={colorTheme} setColorTheme={setColorTheme} />
        <Tools setInfoPopupMessage={setInfoPopupMessage} />
        <ExportImport sections={sections} setSections={setSections} />
        <div>
            <label>
              <input 
                type="checkbox" 
                checked={autofillEnabled} 
                onChange={handleAutofillChange} 
              />
              Enable Autofill
            </label>
          </div>
        <Contact />
      </div>
    </div>
  );
};

export default Settings;
