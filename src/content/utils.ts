import { defaultColorList } from "../helpers/courseColors"
import { sessionSecureToken } from "./App/App"
import {
  SectionDetail,
  Term,
  ISectionData,
  SupplementaryData,
} from "./App/App.types"

export async function extractSection(element: Element) {
  const courseLabels = element.parentElement?.querySelectorAll(
    '[data-automation-id="promptOption"]'
  ) // The div with the raw text of the course section data.
  // Checking if course labels exist and there are at least two of them
  if (!courseLabels || courseLabels.length < 2) {
    alert("Title or section details not found")
    return Promise.reject(new Error("Title or section details not found"))
  }

  // Extracting title
  const titleElement = courseLabels[0]
  const title = titleElement.textContent

  // Checking if title is missing
  if (!title) {
    alert("Title not found")
    return Promise.reject(new Error("Title not found"))
  }

  const code = title.slice(0, title.indexOf(" - "))

  const newSectionPromise = findCourseInfo(code)

  return Promise.all([newSectionPromise]).then(([newSection]) => {
    return newSection
  })
}

export async function findCourseInfo(code: string) {
  let requestOptions: RequestInit
  let headers: Headers

  const urlencoded = new URLSearchParams()
  urlencoded.append("q", code)
  urlencoded.append("clientRequestID", generateRandomHexId())

  if (sessionSecureToken) {
    urlencoded.append("sessionSecureToken", sessionSecureToken)

    headers = new Headers({
      "Session-Secure-Token": sessionSecureToken,
      "Content-Type": "application/x-www-form-urlencoded"
    })

    requestOptions = {
      method: "POST",
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
      headers: headers,
    }
  } else {
    requestOptions = {
      method: "POST",
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
    }
    headers = new Headers({
      "Content-Type": "application/x-www-form-urlencoded"
    })
  }
  return fetch(
    "https://wd10.myworkday.com/ubc/faceted-search2/c12/fs0/search.htmld",
    requestOptions
  )
    .then((response) => response.json())
    .then((data) => {
      try {
        const path = data["children"][0]["listItems"][0]
        const name = path["title"]["instances"][0]["text"]
        // const term = path["detailResultFields"][0]["instances"][0]["text"]
        const id = path["title"]["instances"][0]["instanceId"]

        const sectionDetailsArr: string[] = []
        for (const item of path["detailResultFields"][0]["instances"]) {
          sectionDetailsArr.push(item["text"])
        }
        const newSection: ISectionData = {
          code: code,
          name: name.slice(name.indexOf(" - ") + 3),
          sectionDetails: parseSectionDetails(sectionDetailsArr),
          term: getTermFromSectionDetailsString(sectionDetailsArr),
          worklistNumber: 0,
          color: defaultColorList[0],
          courseID: id.split("$")[1],
        }
        return newSection
      } catch (error) {
        console.error("Error parsing course data:", error)
        return null
      }
    })
    .catch((error) => {
      console.error("Error fetching course data:", error)
      return null
    })
}

export async function findSupplementaryData(code: string) {
  let requestOptions: RequestInit
  const urlencoded = new URLSearchParams()
  urlencoded.append("q", code)
  urlencoded.append("clientRequestID", generateRandomHexId())

  if (sessionSecureToken) {
    urlencoded.append("sessionSecureToken", sessionSecureToken)

    const headers = new Headers({
      "Session-Secure-Token": sessionSecureToken,
    })

    requestOptions = {
      method: "POST",
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
      headers: headers,
    }
  } else {
    requestOptions = {
      method: "POST",
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
    }
  }

  return fetch(
    "https://wd10.myworkday.com/ubc/faceted-search2/c12/fs0/search.htmld",
    requestOptions
  )
    .then((response) => response.json())
    .then((data) => {
      try {
        const path = data["children"][0]["listItems"][0]
        const instructors = path["detailResultFields"][2]["instances"]

        const instructorsArr: string[] = [""]
        if (instructors) {
          for (const item of instructors) {
            instructorsArr.push(item["text"])
          }
        }
        const locations = path["detailResultFields"][0]["instances"]

        const locationsArr: string[] = [""]
        if (locations) {
          for (const item of locations) {
            locationsArr.push(item["text"].split(" | ")[0])
          }
        }
        const newSupplementaryData: SupplementaryData = {
          instructors: instructorsArr,
          locations: locationsArr,
        }
        return newSupplementaryData
      } catch (error) {
        console.error("Error parsing course data:", error)
        return null
      }
    })
    .catch((error) => {
      console.error("Error fetching course data:", error)
      return null
    })
}

const parseSectionDetails = (details: string[]): SectionDetail[] => {
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
      })
    }

    detailsArr.push({
      term: term,
      days: days,
      startTime: startTime,
      endTime: endTime,
      dateRange: dateRange,
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

export async function findCourseId(name: string) {
  let requestOptions: RequestInit
  const urlencoded = new URLSearchParams()
  urlencoded.append("q", name)
  urlencoded.append("clientRequestID", generateRandomHexId())

  if (sessionSecureToken) {
    urlencoded.append("sessionSecureToken", sessionSecureToken)

    const headers = new Headers({
      "Session-Secure-Token": sessionSecureToken,
    })

    requestOptions = {
      method: "POST",
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
      headers: headers,
    }
  } else {
    requestOptions = {
      method: "POST",
      body: urlencoded,
      redirect: "follow" as RequestRedirect,
    }
  }

  return fetch(
    "https://wd10.myworkday.com/ubc/faceted-search2/c12/fs0/search.htmld",
    requestOptions
  )
    .then((response) => response.json())
    .then((data) => {
      try {
        const courseId =
          data["children"][0]["listItems"][0]["title"]["instances"][0][
            "instanceId"
          ]
        return courseId.split("$")[1]
      } catch (error) {
        console.error("Error parsing course data:", error)
        return null
      }
    })
    .catch((error) => {
      console.error("Error fetching course data:", error)
      return null
    })
}

export function isCourseFormatted(courseName: string) {
  const regexV = /^[A-Z]{3}_V [0-9]+-[0-9]+$/
  const regexO = /^[A-Z]{3}_O [0-9]+-[0-9]+$/

  return regexV.test(courseName) || regexO.test(courseName)
}

// Convert times from 12-hour format to 24-hour format
const convertTo24HourFormat = (time: string): string => {
  const [timePart, period] = time.split(" ")
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

const getTermFromSectionDetailsString = (
  sectionDetailsArray: string[]
): Term => {
  //If the string includes 2024, check if it includes 2025 also, if it does then it is both W1 and W2, if only 2024, W1, else W2
  //@TODO: In future this also needs to work for summer terms. Perhaps switch from year based to month based to work for every year
  let includes2024 = false
  let includes2025 = false
  sectionDetailsArray.forEach((detail) => {
    includes2024 = includes2024 || detail.includes("2024")
    includes2025 = includes2025 || detail.includes("2025")
  })
  if (includes2024 && includes2025) return Term.winterFull
  if (includes2024) return Term.winterOne
  return Term.winterTwo
}

export const filterSectionsByWorklist = (
  sections: ISectionData[],
  worklist: number
): ISectionData[] => {
  const sectionsForWorklist: ISectionData[] = []
  for (const section of sections) {
    if (section.worklistNumber === worklist) {
      sectionsForWorklist.push(section)
    }
  }
  return sectionsForWorklist
}

// Function to generate a random lowercase hexadecimal string
function generateRandomHexId(): string {
  const hexChars = "0123456789abcdef";
  let result = "";
  for (let i = 0; i < 32; i++) {
    result += hexChars.charAt(Math.floor(Math.random() * hexChars.length));
  }
  return result;
}