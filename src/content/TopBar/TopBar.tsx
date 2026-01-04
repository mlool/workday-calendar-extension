import { ISectionData, Views } from "../App/App.types"
import SettingsIcon from "../Icons/SettingsIcon"
import CalendarIcon from "../Icons/CalendarIcon"
import "./TopBar.css"

interface IProps {
  currentView: Views
  setCurrentView: (view: Views) => void
  sections: ISectionData[]
}

const TopBar = ({ currentView, setCurrentView, sections }: IProps) => {

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
