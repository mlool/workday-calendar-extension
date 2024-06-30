import "../Settings.css"
import { ISectionData } from "../../App/App.types"
import SyncSavedSchedules from "./SyncSavedSchedules/SyncSavedSchedules"

interface IProps {
  sections: ISectionData[]
}

const WorklistActions = (props: IProps) => {
  return (
    <div>
      <div className="SettingsHeader">Worklist Actions</div>
      <hr className="Divider" />
      <div className="SettingsBodyContainer">
        <SyncSavedSchedules sections={props.sections} />
      </div>
    </div>
  )
}

export default WorklistActions
