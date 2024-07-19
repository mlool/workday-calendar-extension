import { ISectionData, Views } from "../App/App.types"
import SettingsIcon from "../Icons/SettingsIcon"
import CalendarIcon from "../Icons/CalendarIcon"
import "./TopBar.css"
import ShareIcon from "../Icons/ExternalLinkIcon"

interface IProps {
  currentView: Views
  setCurrentView: (view: Views) => void
  sections: ISectionData[]
}

const TopBar = ({ currentView, setCurrentView, sections }: IProps) => {
  const handleWebPage = () => {
    const targetUrl = "https://ubcstudenthub.ca/calendar"
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
        <button
          style={{
            border: "2px solid white",
            color: "white",
            backgroundColor: "transparent",
            borderRadius: "8px",
            cursor: "pointer",
            marginRight: "6px",
          }}
          onClick={handleWebPage}
        >
          <span style={{ display: "flex", alignItems: "center" }}>
            Student Hub
            <ShareIcon size={18} color={"white"} />
          </span>
        </button>
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
