import { ColorTheme } from "../../../helpers/courseColors"
import ThemePicker from "../ThemePicker"
import "../Settings.css"
interface IProps {
  colorTheme: ColorTheme
  setColorTheme: (theme: ColorTheme) => void
}

const Theme = ({ colorTheme, setColorTheme }: IProps) => {
  return (
    <div>
      <div className="SettingsHeader">Theme</div>
      <hr className="Divider" />
      <div className="SettingsBodyContainer">
        <ThemePicker colorTheme={colorTheme} setColorTheme={setColorTheme} />
      </div>
    </div>
  )
}

export default Theme
