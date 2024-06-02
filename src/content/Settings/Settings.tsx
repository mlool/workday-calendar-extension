import { ColorTheme } from "../../helpers/courseColors"
import ThemePicker from "./ThemePicker"
import './Settings.css'
import { ISectionData } from "../App/App.types"

interface ISettingsProps {
  colorTheme: ColorTheme,
  sections: ISectionData[],
  setColorTheme: (theme: ColorTheme) => void
}

const Settings = ({colorTheme, sections, setColorTheme}: ISettingsProps) => {

  const handleExport = () => {
    const json = JSON.stringify(sections, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <div className="SettingsHeader">Theme</div>
      <hr />
      <ThemePicker colorTheme={colorTheme} setColorTheme={setColorTheme}/>
      <div className="SettingsHeader">Tools</div>
      <hr />
      <div>Coming soon ......</div>
      <div className="SettingsHeader">Export/Import</div>
      <hr />
      <div className="SettingsButton" onClick={handleExport}>Export Calendar</div>
      <div className="SettingsHeader">Contact Us</div>
      <hr />
    </div>
  )
}

export default Settings