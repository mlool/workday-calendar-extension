import "./ExportImportPopup.css"
import CloseIcon from "../../../Icons/CloseIcon"
import { useState } from "react"

interface IProps {
  onCancel: () => void
  handleImport: (
    event: React.ChangeEvent<HTMLInputElement>,
    worklistNumber: number
  ) => void
}

const ImportCalendarPopup = ({ onCancel, handleImport }: IProps) => {
  const [selectedWorklist, setSelectedWorklist] = useState<number>(0)
  return (
    <div className="CalendarBackground">
      <div className="CalendarPopup">
        <div className="CalendarPopupHeader">
          <div>Import Worklist</div>
          <div className="CalendarPopupCloseButton" onClick={onCancel}>
            <CloseIcon size={16} color="white" />
          </div>
        </div>
        <div className="CalendarPopupBody">
          Choose the worklist to import to:
          <div className="CalendarPopupButtonContainer">
            <div>Worklist: </div>
            {[0, 1, 2, 3].map((worklist) => (
              <div
                key={worklist}
                className="CalendarPopupButton"
                style={
                  selectedWorklist === worklist
                    ? { backgroundColor: "rgb(156, 232, 255)" }
                    : {}
                }
                onClick={() => setSelectedWorklist(worklist)}
              >
                {worklist}
              </div>
            ))}
          </div>
          <div className="CalendarButtonContainer">
            <div className="CalendarButtonCancel" onClick={onCancel}>
              Cancel
            </div>
            <div className="CalendarButtonConfirm" onClick={() => handleImport}>
              <input
                type="file"
                accept="application/json"
                onChange={(e) => {
                  handleImport(e, selectedWorklist)
                  onCancel()
                }}
                style={{ display: "none" }}
                id="import-file"
              />
              <label htmlFor="import-file">Confirm</label>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ImportCalendarPopup
