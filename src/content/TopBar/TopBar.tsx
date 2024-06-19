import { Views } from "../App/App.types"
import SettingsIcon from "../Icons/SettingsIcon"
import CalendarIcon from "../Icons/CalendarIcon"
import "./TopBar.css"

interface IProps {
  currentView: Views
  setCurrentView: (view: Views) => void
}

const TopBar = ({ currentView, setCurrentView }: IProps) => {
  return (
    <div className="TopBar">
      <div className="TopBarTextContainer">
        {currentView === Views.calendar ? "My Schedule" : "Settings"}
      </div>
      <div className="TopBarButtonContainer">
        <div
          className="IconContainer"
          onClick={() => setCurrentView(Views.calendar)}
        >
          <CalendarIcon size={24} color={"white"} />
        </div>
        <div
          className="IconContainer"
          onClick={() => setCurrentView(Views.settings)}
        >
          <SettingsIcon size={24} color={"white"} />
        </div>
      </div>
    </div>
  )
}

export default TopBar
