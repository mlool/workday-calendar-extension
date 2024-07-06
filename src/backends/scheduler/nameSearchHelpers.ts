interface rawCourses {
  sections: {
    id: string
    status: string
    name: string
    subject: string
    course: string
    section: string
    activity: string
    term: string
    mode: string
    url: string
    schedule: rawSchedule[]
  }[]
}

interface rawSchedule {
  start_time: number
  end_time: number
  day: string
  term: string
}

export const handleProgressUpdate = (newProgress: number) => {
  const courseAddingProgressEvent = new CustomEvent("courseAddingProgress", {
    detail: {
      progress: newProgress,
    },
  })

  document.dispatchEvent(courseAddingProgressEvent)
}

export function getUrlFromSearchTerm(
  rawData: rawCourses,
  searchTerm: string
): string | null {
  for (const section of rawData.sections) {
    if (section.name === searchTerm) {
      return section.url
    }
  }
  return null
}

export function getCourseIdFromUrl(url: string): string | null {
  try {
    const parts = url.split("$")
    return parts[2].split(".")[0]
  } catch (error) {
    alert("Invalid URL. Please try again.")
    return null
  }
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

export function parseSearchParameters(searchTerm: string) {
  //ACAM_V 320-B_001
  const subject = searchTerm.split("_")[0]

  const campus = searchTerm.split("_")[1].split("-")[0].split(" ")[0]
  let courseNumber = ""
  let sectionNumber = ""

  const formatCheck = searchTerm.split("_")
  const parts = searchTerm.split(" ")
  // Normal format like CPSC_V 320-101
  if (formatCheck.length === 2) {
    courseNumber = parts[1].split("-")[0]
    sectionNumber = parts[1].split("-")[1]
  } else {
    // Special format like ACAM_V 320-B_001
    courseNumber = parts[1].split("_")[0].replace("-", "")
    sectionNumber = parts[1].split("_")[1]
  }

  return { subject, courseNumber, sectionNumber, campus }
}

export function courseIdFailsCheck(courseId: string): boolean {
  const regex = /^\d{6}$/

  return !regex.test(courseId)
}
