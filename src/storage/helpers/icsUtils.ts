import { Event } from "../content/Settings/ExportImport/ExternalCalendarExport"

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
  Mon: "MO",
  Tue: "TU",
  Wed: "WE",
  Thu: "TH",
  Fri: "FR",
  Sat: "SA",
  Sun: "SU",
} as const

const WEEKDAY_TO_RAW_WEEKDAY = [
  "Sun",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
] as const

/**
 * Workday's course start date may indicate the start of the
 * academic session, or the actual start date of the section
 * (first class).
 *
 * We use a simple heuristic: If given start date has same
 * weekday as first meeting day of the course, given date is
 * the real start date. Otherwise, it needs to be offset
 * accordingly. Additionally, if the session starts within a
 * week (e.g. winter session usually starts on Tuesday),
 * sections before the start date in the week (e.g. Monday sections)
 * must have their start dates offset to the 2nd recurrence.
 *
 * Note that we cannot rely on the recurrence rule to specify
 * the first instance of the event, despite this working in
 * some calendar implementations. According to RFC 5545 3.8.5.3:
 *
 *   > The recurrence set generated with a "DTSTART" property
 *   > value not synchronized  with the recurrence rule is undefined.
 *
 * Therefore this offset calculation is necessary for all events,
 * not just for when the term starts within the week.
 */
export const calculateRealCourseStartDate = (
  workdayStartDate: Date,
  meetingDays: string[]
): number => {
  const rawStartWeekday = workdayStartDate.getDay()
  const givenStartWeekday = WEEKDAY_TO_RAW_WEEKDAY[rawStartWeekday]

  if (givenStartWeekday === meetingDays[0]) return 0

  const actualStartWeekday = WEEKDAY_TO_RAW_WEEKDAY.findIndex(
    (x) => x === meetingDays[0]
  )

  if (actualStartWeekday === -1) throw `Weekday ${meetingDays[0]} is invalid!`

  const weekdayDifference = rawStartWeekday - actualStartWeekday

  if (weekdayDifference < 0) return Math.abs(weekdayDifference)

  if (meetingDays.length > 1) {
    const rawWeekdays = meetingDays.map((x) =>
      WEEKDAY_TO_RAW_WEEKDAY.findIndex((y) => x === y)
    )
    const possibleShifts = rawWeekdays.filter((x) => x > rawStartWeekday)
    if (possibleShifts.length > 0) return possibleShifts[0] - rawStartWeekday
  }

  return 6
}
