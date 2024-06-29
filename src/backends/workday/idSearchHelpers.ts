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

export function parseTerm(rawTerm: string[]): Term {
  //If the string includes 2024, check if it includes 2025 also, if it does then it is both W1 and W2, if only 2024, W1, else W2
  //@TODO: In future this also needs to work for summer terms. Perhaps switch from year based to month based to work for every year
  let includes2024 = false
  let includes2025 = false
  rawTerm.forEach((detail) => {
    includes2024 = includes2024 || detail.includes("2024")
    includes2025 = includes2025 || detail.includes("2025")
  })
  if (includes2024 && includes2025) return Term.winterFull
  if (includes2024) return Term.winterOne
  return Term.winterTwo
}

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

    //@TODO: Change for summer term support
    let term = dateRange.includes("2024") ? Term.winterOne : Term.winterTwo
    if (dateRange.includes("2024") && dateRange.includes("2025")) {
      // Case where only one section detail but two term course. Set this term to W1 and push a copy modified to be term 2
      term = Term.winterOne
      detailsArr.push({
        term: Term.winterTwo,
        days: days,
        startTime: startTime,
        endTime: endTime,
        dateRange: dateRange,
        location: location,
      })
    }

    detailsArr.push({
      term: term,
      days: days,
      startTime: startTime,
      endTime: endTime,
      dateRange: dateRange,
      location: location,
    })
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
