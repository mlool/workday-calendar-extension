import { ColorTheme } from "../../helpers/courseColors"
import ThemePicker from "./ThemePicker"
import './Settings.css'

interface ISettingsProps {
  colorTheme: ColorTheme,
  setColorTheme: (theme: ColorTheme) => void
}

const Settings = ({colorTheme, setColorTheme}: ISettingsProps) => {
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
      <div>Coming soon ......</div>
    </div>
  )
}

export default Settings