import React, { useContext, useEffect, useState } from "react"
import "./Tools.css"
import "../Settings.css"
import QuestionIcon from "../../Icons/QuestionIcon"
import { ModalDispatchContext, ModalPreset } from "../../ModalLayer"

const Tools = () => {
  const dispatchModal = useContext(ModalDispatchContext)
  const [autofillEnabled, setAutofillEnabled] = useState(false)
  const [hideProfilePicture, setHideProfilePicture] = useState(false)

  useEffect(() => {
    // Retrieve the stored state from localStorage
    const storedAutofillEnabled =
      localStorage.getItem("autofillEnabled") === "true"
    setAutofillEnabled(storedAutofillEnabled)
    const storedHideProfilePicture =
      localStorage.getItem("hideProfilePicture") === "true"
    setHideProfilePicture(storedHideProfilePicture)
  }, [])

  const handleAutofillChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked
    setAutofillEnabled(isEnabled)
    // Store the state in localStorage
    localStorage.setItem("autofillEnabled", isEnabled.toString())

    const event = new CustomEvent("autofillToggle", {
      detail: { enabled: isEnabled },
    })
    window.dispatchEvent(event)
  }

  const handleHidePfpChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isEnabled = e.target.checked
    setHideProfilePicture(isEnabled)
    localStorage.setItem("hideProfilePicture", isEnabled.toString())

    // Dispatch a custom event to notify about the change
    const event = new CustomEvent("hideProfilePictureToggle", {
      detail: { enabled: isEnabled },
    })
    window.dispatchEvent(event)
  }

  return (
    <div>
      <div className="SettingsHeader">Tools</div>
      <hr className="Divider" />
      <div className="SettingsBodyContainer">
        <div className="ToolItem">
          <div className="ToolContainer">
            <div>
              <input
                type="checkbox"
                checked={autofillEnabled}
                onChange={handleAutofillChange}
              />
            </div>
            <div>Enable Autofill</div>
          </div>
          <div
            className="ToolItemInfoButton"
            onClick={() =>
              dispatchModal({ preset: ModalPreset.AutofillSettingInfo })
            }
          >
            <QuestionIcon size={16} />
          </div>
          <div className="ToolContainer">
            <div>
              <input
                type="checkbox"
                checked={hideProfilePicture}
                onChange={handleHidePfpChange}
              />
            </div>
            <div>Hide Profile Picture</div>
          </div>
          <div
            className="ToolItemInfoButton"
            onClick={() => dispatchModal({ preset: ModalPreset.HidePfpInfo })}
          >
            <QuestionIcon size={16} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default Tools
