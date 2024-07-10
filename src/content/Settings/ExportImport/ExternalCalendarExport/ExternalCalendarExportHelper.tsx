import { Event } from "./ExternalCalendarExport"

// Constructs calendar string according to ical specification
export const generateICal = (events: Event[]): string => {
  let iCalString = `BEGIN:VCALENDAR\r\n`
  iCalString += `VERSION:2.0\r\n`
  iCalString += `PRODID:-//WorkdayCalendarExtension//EN\r\n`
  iCalString += `METHOD:INFO\r\n`

  // Loop through events and build iCal strings
  events.forEach((event) => {
    iCalString += buildICalString(event)
  })

  // Add closing tag only if there are events
  if (events.length > 0) {
    iCalString += `END:VCALENDAR\r\n`
  }

  return iCalString
}

// Helper for generateIcal. Builds Ical string for individual events
function buildICalString(event: Event) {
  // Single VCALENDAR block for each event
  let iCalString = `BEGIN:VEVENT\r\n`
  iCalString += `UID:${Math.random().toString(36).substring(2, 15)}\r\n`
  iCalString += `DTSTAMP:${getCurrentDateTime()}\r\n`

  // Event details
  iCalString += `DTSTART:${formatDateArray(event.start)}\r\n`
  iCalString += `DTEND:${formatDateArray(event.end)}\r\n`
  iCalString += `SUMMARY:${event.title}\r\n`
  iCalString += `DESCRIPTION:${event.description}\r\n`

  // Optional location
  if (event.location) {
    iCalString += `LOCATION:${event.location}\r\n`
  }

  // Recurrence rule (if provided)
  if (event.recurrenceRule) {
    iCalString += `RRULE:${event.recurrenceRule}\r\n`
  }

  // Closing tag
  iCalString += `END:VEVENT\r\n`

  return iCalString
}

// Custom DateTime to adhere to ical spec
function getCurrentDateTime() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0") // Add leading zero for single-digit months
  const day = String(now.getDate()).padStart(2, "0") // Add leading zero for single-digit days
  const hour = String(now.getHours()).padStart(2, "0") // Add leading zero for single-digit hours
  const minute = String(now.getMinutes()).padStart(2, "0") // Add leading zero for single-digit minutes

  return `${year}${month}${day}T${hour}${minute}00`
}

// Custom date array formatting to adhere to ical spec
export const formatDateArray = (dateArray: number[]): string => {
  if (dateArray.length !== 5) {
    throw new Error(
      "Invalid date array length. Expected 5 elements (YYYY, MM, DD, HH, mm)."
    )
  }

  const [year, month, day, hour, minute] = dateArray

  // Ensure two-digit formatting for month, day, hour, and minute
  const monthStr = String(month).padStart(2, "0")
  const dayStr = String(day).padStart(2, "0")
  const hourStr = String(hour).padStart(2, "0")
  const minuteStr = String(minute).padStart(2, "0")

  return `${year}${monthStr}${dayStr}T${hourStr}${minuteStr}00`
}

export const WORKDAY_TO_ICS_WEEKDAY_MAP = {
  Sun: "SU",
  Mon: "MO",
  Tue: "TU",
  Wed: "WE",
  Thu: "TH",
  Fri: "FR",
  Sat: "SA",
} as const

export const calculateActualCourseStartDate = (
  workdayStartDate: Date,
  meetingDays: string[]
) => {
  const startDateOffsets = { MO: 6, TU: 0, WE: 1, TH: 2, FR: 3 } as const

  const rawStartWeekday = workdayStartDate.getDay()
  const startWeekday = Object.values(WORKDAY_TO_ICS_WEEKDAY_MAP)[rawStartWeekday]

  // Workday's course start date may be set to be the start of the winter session,
  // or the actual start date of the section (first class).
  // - If given start date is not a Tuesday, it is the actual start date
  // - If given start day is a Tuesday...
  //   - and first meeting day is Tuesday, it is the actual start date
  //   - and first meeting day is NOT Tuesday, it is NOT the actual start date and
  //     must be offset accordingly.
  if (startWeekday !== "TU" || startWeekday === meetingDays[0]) return workdayStartDate

  if (startWeekday === meetingDays[0]) {
    // Course actually starts on tuesday
  }
}
