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
        <div className="worklist-delete-button" onClick={() => {
            const newSchedule = schedule.clearWorklist(worklist, currentSession)
            setSchedule(newSchedule)
        }}>
            Clear Worklist {worklist} for {currentSession}
            <InputIcon size={24} onClick={() => { }} />
            <ExportIcon size={24} onClick={() => { }} />
        </div>
    )
}

export default WorklistControl