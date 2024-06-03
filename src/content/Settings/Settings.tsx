import { ColorTheme } from '../../helpers/courseColors';
import ThemePicker from './ThemePicker';
import './Settings.css';
import { ISectionData } from '../App/App.types';
import DiscordButton from '../DiscordButton/DiscordButton';
import React, { useState, useEffect } from 'react';

interface ISettingsProps {
  colorTheme: ColorTheme;
  sections: ISectionData[];
  setColorTheme: (theme: ColorTheme) => void;
}

const Settings = ({ colorTheme, sections, setColorTheme }: ISettingsProps) => {

  const handleExport = () => {
    const json = JSON.stringify(sections, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule.json';
    link.click();
    URL.revokeObjectURL(url);
  };

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
    <div className="Settings">
      <div className="SettingsHeader">Theme</div>
      <hr className='Divider' />
      <div className="SettingsItems">
        <ThemePicker colorTheme={colorTheme} setColorTheme={setColorTheme} />
      </div>
      <div className="SettingsHeader">Tools</div>
      <hr className='Divider' />
      <div className="SettingsItems">
        <div>Coming soon ......</div>
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
      </div>
      <div className="SettingsHeader">Export/Import</div>
      <hr className='Divider' />
      <div className="SettingsItems">
        <div className="SettingsButton" onClick={handleExport}>
          Export Calendar
        </div>
      </div>
      <div className="SettingsHeader">Contact Us</div>
      <hr className='Divider' />
      <div className="SettingsItems">
        <DiscordButton />
      </div>
    </div>
  );
};

export default Settings;
