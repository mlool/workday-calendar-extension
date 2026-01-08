import Schedule from "../../objects/Schedule";
import ExportIcon from "../Icons/ExportIcon";
import InputIcon from "../Icons/InputIcon";
import "./WorklistControl.css"

interface IProps {
    schedule: Schedule;
    worklist: number;
    currentSession: string;
    setSchedule: (schedule: Schedule) => void;
}

const WorklistControl: React.FC<IProps> = ({ schedule, worklist, currentSession, setSchedule }) => {
    return (
        <div className="worklist-control-container">
            <div
                className="worklist-delete-button"
                onClick={() => {
                    const newSchedule = schedule.clearWorklist(worklist, currentSession)
                    setSchedule(newSchedule)
                }}
            >
                Clear Worklist {worklist} for {currentSession}
            </div>

            <div className="icon-button" title="Export Worklist" onClick={() => schedule.downloadScheduleAsJSON(worklist, currentSession)}>
                <ExportIcon size={20} />
            </div>

            <div className="icon-button" title="Import Worklist">
                <input
                    type="file"
                    accept="application/json"
                    onChange={async (e) => {
                        console.log(await e.target.files?.[0].text())
                        const newSchedule = schedule.getScheduleFromExternalJSON(await e.target.files?.[0].text() ?? "", currentSession, worklist)
                        setSchedule(newSchedule)
                    }}
                    style={{ display: "none" }}
                    id="import-file"
                />
                <label htmlFor="import-file">
                    <InputIcon size={20} />
                </label>
            </div>
        </div>
    )
}

export default WorklistControl