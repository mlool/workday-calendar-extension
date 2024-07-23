import { Term, SectionDetail } from "../../content/App/App.types"

export interface RawWorkdayData {
  code: string
  name: string
  instructors: string[]
  sectionDetails: SectionDetail[]
  term: Term
}

export interface DetailsPath {
  label: string
  widget: string
}

export async function fetchSearchData(url: string) {
  try {
    const response = await fetch(url)
    return await response.json()
  } catch (error) {
    console.error("Error fetching data:", error)
    return null
  }
}

/**
 * Expects a dateRange in format "YYYY-MM-DD - YYYY-MM-DD".
 */
const parseSessionAndTermFromDateRange = (
  dateRange: string
): { session: string; terms: Set<Term> } => {
  const dates = dateRange.trim().split(" - ")
  const finalSessions: string[] = []
  const finalTerms = new Set<Term>()

  // we need to check term for both dates because workday
  // may give us a date range that spans multiple terms.
  // EXAMPLE: MEDD_V 429
  for (const date of dates) {
    const [year, month] = date.split("-").map(Number)

    switch (true) {
      case month >= 0 && month <= 3:
        finalSessions.push(`${year - 1}W`)
        finalTerms.add(Term.Two)
        break;
      case month >= 4 && month <= 5:
        finalSessions.push(`${year}S`)
        finalTerms.add(Term.One)
        break;
      case month >= 6 && month <= 7:
        finalSessions.push(`${year}S`)
        finalTerms.add(Term.Two)
        break;
      case month >= 8 && month <= 11:
        finalSessions.push(`${year}W`)
        finalTerms.add(Term.One)
        break;
      default:
        throw `Month ${month} parsed from Workday not valid!`
    }
  }

  if (finalSessions.length !== 1)
    throw `Illegal number of sessions found! ${finalSessions}`
  return { session: finalSessions[0], terms: finalTerms }
}

export function parseSessionAndTerms(rawTerm: string[]): {
  session: string
  terms: Set<Term>
} {
  const finalSessions: string[] = []
  const finalTerms = new Set<Term>()
  rawTerm.forEach((detail) => {
    const dateSegment = detail.split(" | ").at(-1)!
    const { session, terms } = parseSessionAndTermFromDateRange(dateSegment)
    finalSessions.push(session)
    terms.forEach(finalTerms.add)
  })

  if (finalSessions.length !== 1)
    throw `Illegal number of sessions found! ${finalSessions}`
  return { session: finalSessions[0], terms: finalTerms }
}

/**
 * SCRF-Floor 1-Room 100 | Tue Thu | 11:00 a.m. - 12:30 p.m. | 2024-09-03 - 2024-12-05
 */
export const parseSectionDetails = (details: string[]): SectionDetail[] => {
  let detailsArr: SectionDetail[] = []

  details.forEach((detail) => {
    const detailParts = detail.split(" | ")
    if (detailParts.length !== 3 && detailParts.length !== 4) {
      alert(JSON.stringify(detailParts))
      alert("Invalid section details format")
    }
    let location = ""
    let daysString = ""
    let timeRange = ""
    let dateRange = ""

    if (detailParts.length === 3) {
      // Without location
      ;[daysString, timeRange, dateRange] = detailParts
    } else {
      // With location
      ;[location, daysString, timeRange, dateRange] = detailParts
    }

    let days = daysString.split(" ")
    let [startTime, endTime] = timeRange.split(" - ")

    startTime = convertTo24HourFormat(startTime)
    endTime = convertTo24HourFormat(endTime)

    //Handle the "Fri (Alternate Weeks)" case, or any text that isn't a valid day
    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri"]

    days = days.reduce<string[]>((acc, str) => {
      const firstThreeChars = str.substring(0, 3)

      if (daysOfWeek.includes(firstThreeChars)) {
        acc.push(firstThreeChars)
      }

      return acc
    }, [])

    const termData = parseSessionAndTermFromDateRange(dateRange)
    termData.terms.forEach((term) =>
      detailsArr.push({
        term: term,
        days: days,
        startTime: startTime,
        endTime: endTime,
        dateRange: dateRange,
        location: location,
      })
    )
  })

  //Removing duplicates, some are from reading week split on workday
  const removeDuplicates = (arr: SectionDetail[]) => {
    const seen = new Set()
    return arr.filter((item) => {
      const serializedItem = JSON.stringify(item)
      return seen.has(serializedItem) ? false : seen.add(serializedItem)
    })
  }

  // Remove duplicates
  detailsArr = removeDuplicates(detailsArr)

  return detailsArr
}

// Convert times from 12-hour format to 24-hour format
const convertTo24HourFormat = (time: string): string => {
  const [timePart, period] = time.split(" ")
  // eslint-disable-next-line prefer-const
  let [hours, minutes] = timePart.split(":").map(Number)

  if (period && period.toLowerCase() === "p.m." && hours !== 12) {
    hours += 12
  } else if (period && period.toLowerCase() === "a.m." && hours === 12) {
    hours = 0
  }

  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`
}
