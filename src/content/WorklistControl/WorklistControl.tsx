import Schedule from "../../objects/Schedule";
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
        </div>
    )
}

export default WorklistControl