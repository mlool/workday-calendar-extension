import { findCourseId } from "../backends/scheduler/nameSearchApi"
import { ISectionData, SectionDetail, Term } from "../content/App/App.types"

type ValidVersionData =
  | v1_4_1_SectionData[]
  | v1_5_0_SectionData[]
  | v2_0_0_SectionData[]
  | ISectionData[]

type v1_4_1_SectionData = Omit<
  ISectionData,
  "session" | "courseID" | "terms"
> & {
  term: Term
}

// version 1.4.1 has no courseID, but still has the location data
// that was removed in 1.5.0 and then readded in 1.6.0
const v1_4_1 = async (
  oldSections: v1_4_1_SectionData[]
): Promise<v2_0_0_SectionData[]> => {
  const newSections: v2_0_0_SectionData[] = []
  for (const section of oldSections) {
    // we await each call individually here to prevent workday
    // from erroring out due to too many concurrent requests
    const newSection = {
      ...section,
      // eslint-disable-next-line no-await-in-loop
      courseID: (await findCourseId(section.code)) ?? undefined,
    }
    newSections.push(newSection)
    //handleProgressUpdate(newSections.length / oldSections.length)
  }
  return newSections
}

type v1_5_0_SectionData = Omit<
  ISectionData,
  "session" | "instructors" | "terms" | "sectionDetails"
> & {
  term: Term
  sectionDetails: Omit<SectionDetail, "location">[]
}
// 1.5 -> 1.6: no instructors + location
const v1_5_0 = (oldSections: v1_5_0_SectionData[]): v2_0_0_SectionData[] => {
  console.log(oldSections)
  // @ts-expect-error: wip
  return {}
}

type v2_0_0_SectionData = Omit<ISectionData, "session" | "terms"> & {
  term: Term
}
// 2.0 -> 2.0.1: no sessions prop, term are enum instead of set
const v2_0_0 = (oldSections: v2_0_0_SectionData[]): ISectionData[] => {
  console.log(oldSections)
  // @ts-expect-error: wip
  return {}
}

export {
  type ValidVersionData,
  type v1_4_1_SectionData,
  v1_4_1,
  type v1_5_0_SectionData,
  v1_5_0,
  type v2_0_0_SectionData,
  v2_0_0,
}
