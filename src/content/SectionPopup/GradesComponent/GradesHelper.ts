export interface IGradesAPIData {
  average: number
  averageFiveYears: number
  averageMax: number
  averageMin: number
}

export const getGradesUrl = (sectionCode: string): string => {
  const isVancouver = sectionCode.includes("_V")
  const campus = isVancouver ? "UBCV" : "UBCO"
  const courseCode = sectionCode.split("_")[0]
  const courseNum = sectionCode.split(" ")[1].split("-")[0]

  const url = `https://ubcgrades.com/statistics-by-course#${campus}-${courseCode}-${courseNum}`
  return url
}

export const getGradesData = async (
  sectionCode: string
): Promise<IGradesAPIData> => {
  const isVancouver = sectionCode.includes("_V")
  const campus = isVancouver ? "UBCV" : "UBCO"
  const courseCode = sectionCode.split("_")[0]
  const courseNum = sectionCode.split(" ")[1].split("-")[0]

  const reqURL = `https://ubcgrades.com//api/v3/course-statistics/${campus}/${courseCode}/${courseNum}`
  const response = await fetch(reqURL)
  if (response.ok) {
    const data = await response.json()
    return {
      average: data["average"],
      averageFiveYears: data["average_past_5_yrs"],
      averageMax: data["max_course_avg"],
      averageMin: data["min_course_avg"],
    }
  } else {
    throw Error("Failed to get data")
  }
}
