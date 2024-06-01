import { ColorTheme } from "../../helpers/courseColors"
import ThemePicker from "./ThemePicker"

interface ISettingsProps {
  colorTheme: ColorTheme,
  setColorTheme: (theme: ColorTheme) => void
}

const Settings = ({colorTheme, setColorTheme}: ISettingsProps) => {
  return (
    <div>
        <ThemePicker colorTheme={colorTheme} setColorTheme={setColorTheme}/>
    </div>
  )
}

export default Settings