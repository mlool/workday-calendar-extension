import { ColorTheme } from '../../helpers/courseColors';
import ThemePicker from './ThemePicker';
import './Settings.css';
import { ISectionData } from '../App/App.types';
import DiscordButton from '../DiscordButton/DiscordButton';
import React, { useState } from 'react';
import InfoModal from '../InfoModal/InfoModal';
import Tools from './Tools/Tools';
import Theme from './Theme/Theme';
import ExportImport from './ExportImport/ExportImport';
import Contact from './Contact/Contact';

interface ISettingsProps {
  colorTheme: ColorTheme;
  sections: ISectionData[];
  setColorTheme: (theme: ColorTheme) => void;
  onImport: (data: ISectionData[]) => void;
}

const Settings = ({ colorTheme, sections, setColorTheme, onImport }: ISettingsProps) => {
  const [infoPopupMessage, setInfoPopupMessage] = useState<string>("")
  return (
    <div>
      {infoPopupMessage !== "" && <InfoModal message='Here are some information' onCancel={() => setInfoPopupMessage("")}/>}
      <div className="Settings">
        <Theme colorTheme={colorTheme} setColorTheme={setColorTheme} />
        <Tools setInfoPopupMessage={setInfoPopupMessage} />
        <ExportImport sections={sections} onImport={onImport} />
        <Contact />
      </div>
    </div>
  );
};

export default Settings;
