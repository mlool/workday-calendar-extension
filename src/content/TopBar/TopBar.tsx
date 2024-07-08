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
  const handleWebPage = () => {
    const targetUrl = "http://localhost:3000/Calendar"
    const newWindow = window.open(targetUrl, "_blank")
    if (!newWindow) {
      console.error("Failed to open new wndow")
      return
    }

    // Send a message to the new window after it has been opened
    const sendMessage = () => {
      if (newWindow && newWindow.closed === false) {
        newWindow.postMessage({ sections }, "*")
        console.log("Message sent:", { sections })
        clearInterval(intervalId)
      }
    }

    const intervalId = setInterval(sendMessage, 1000) // Try sending the message every second
  }

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
        <div onClick={handleWebPage}>Link to Webste</div>
      </div>
    </div>
  )
}

export default TopBar
