import DiscordButton from "../../DiscordButton/DiscordButton"
import "../Settings.css"

const Contact = () => {
  return (
    <div>
      <div className="SettingsHeader">Contact Us</div>
      <hr className="Divider" />
      <div className="SettingsBodyContainer">
        <DiscordButton />
      </div>
    </div>
  )
}

export default Contact
