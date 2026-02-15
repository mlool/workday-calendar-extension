import Schedule from "../../objects/Schedule"
import DownloadICSIcon from "../Icons/DownloadICSIcon"

interface IProps {
    disabled: boolean,
    schedule: Schedule,
    currentSession: string,
    currentTerm: number,
    currentWorklistNumber: number
}

const DownloadICS = ({ disabled, schedule, currentSession, currentTerm, currentWorklistNumber }: IProps) => {

    const getDayMap = (day: string) => {
        const map: { [key: string]: string } = {
            "Mon": "MO", "Tue": "TU", "Wed": "WE", "Thu": "TH", "Fri": "FR", "Sat": "SA", "Sun": "SU"
        }
        return map[day]
    }

    const getDayIndex = (day: string) => {
        const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        return days.indexOf(day)
    }

    const formatTime = (time: string) => {
        return time.replace(":", "") + "00"
    }

    const formatDate = (date: Date) => {
        const yyyy = date.getFullYear()
        const mm = String(date.getMonth() + 1).padStart(2, "0")
        const dd = String(date.getDate()).padStart(2, "0")
        return `${yyyy}${mm}${dd}`
    }

    const getFirstOccurrence = (startDateStr: string, days: string[]): string => {
        const start = new Date(startDateStr + "T00:00:00");
        const dayIndices = days.map(d => getDayIndex(d));

        let current = new Date(start);
        // Safety break after 14 days
        for (let i = 0; i < 14; i++) {
            if (dayIndices.includes(current.getDay())) {
                return formatDate(current);
            }
            current.setDate(current.getDate() + 1);
        }
        return formatDate(start); // Fallback
    }

    const onClick = () => {
        if (disabled) return

        let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//UBC Workday Calendar Extension//EN\n"

        schedule.getSections().forEach(section => {
            if (section.getWorklistNumber() !== currentWorklistNumber) return
            if (section.getSession() !== currentSession) return
            if (section.getIsCustom()) return

            section.getSectionDetails().forEach(detail => {
                if (!detail.getTerms().includes(currentTerm)) return

                const days = detail.getDays()
                if (!days || days.length === 0) return

                const startTime = detail.getStartTime()
                const endTime = detail.getEndTime()
                const startDate = detail.getStartDate()
                const endDate = detail.getEndDate()
                const location = detail.getLocation()

                if (!startDate || !endDate || !startTime || !endTime) return

                const firstDate = getFirstOccurrence(startDate, days)
                const startDateTime = `${firstDate}T${formatTime(startTime)}`
                const endDateTime = `${firstDate}T${formatTime(endTime)}`
                const recurrenceRule = `FREQ=WEEKLY;BYDAY=${days.map(getDayMap).join(",")};UNTIL=${formatDate(new Date(endDate + "T00:00:00"))}T235959`

                icsContent += "BEGIN:VEVENT\n"
                icsContent += `SUMMARY:${section.getCode()}\n`
                icsContent += `DTSTART:${startDateTime}\n`
                icsContent += `DTEND:${endDateTime}\n`
                icsContent += `RRULE:${recurrenceRule}\n`
                if (location) icsContent += `LOCATION:${location}\n`
                icsContent += `DESCRIPTION:${section.getName()} - ${section.getInstructors().join(", ")}\n`
                icsContent += "END:VEVENT\n"
            })
        })

        icsContent += "END:VCALENDAR"

        const blob = new Blob([icsContent], { type: "text/calendar" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `schedule-${currentSession}-${currentTerm}.ics`
        a.click()
        URL.revokeObjectURL(url)
    }

    return (
        <DownloadICSIcon disabled={disabled} size={22} onClick={onClick} />
    )
}

export default DownloadICS