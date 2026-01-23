import Schedule from "../../objects/Schedule"
import DownloadICSIcon from "../Icons/DownloadICSIcon"

interface IProps {
    disabled: boolean,
    schedule: Schedule,
    currentSession: string,
    currentTerm: number
}

const DownloadICS = ({ disabled, schedule, currentSession, currentTerm }: IProps) => {
    const onClick = () => {

    }

    return (
        <DownloadICSIcon disabled={disabled} size={22} onClick={onClick} />
    )
}

export default DownloadICS