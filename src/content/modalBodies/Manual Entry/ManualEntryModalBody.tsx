import { Dispatch, SetStateAction } from "react"
import "./ManualEntryModalBody.css"

interface ManualEntryBodyProps {
  handleURLUpdate: Dispatch<SetStateAction<unknown>>
}

export default function ManualEntryModalBody(props: ManualEntryBodyProps) {
  const message =
    "Want to add a course manually? Click on the course in Workday and paste its URL below."
  return (
    <div className="manual-entry-body">
      <label>{message}</label>
      <input
        name="manualEntryUrl"
        className="manual-entry-input"
        placeholder="https://wd10.myworkday.com..."
        onChange={(e) => props.handleURLUpdate(e.target.value)}
      />
    </div>
  )
}
