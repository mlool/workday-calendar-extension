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

export function formatSearchTermForData(searchTerm: string): string {
  const parts = searchTerm.split(" ")
  const subject = parts[0].split("_")[0]
  const courseNumber = parts[1].split("-")[0]
  const sectionNumber = parts[1].split("-")[1]
  return `${subject} ${courseNumber} ${sectionNumber}`
}

export function getCourseIdFromUrl(url: string): string {
  const parts = url.split("$")
  return parts[2].split(".")[0]
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
  const subject = searchTerm.split("_")[0]
  const courseNumber = searchTerm.split("_")[1].split("-")[0].split(" ")[1]
  const campus = searchTerm.split("_")[1].split("-")[0].split(" ")[0]

  return { subject, courseNumber, campus }
}
