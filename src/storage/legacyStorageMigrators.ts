import { findCourseId } from "../backends/scheduler/nameSearchApi"
import { fetchWorkdayData } from "../backends/workday/idSearchApi"
import { ISectionData, SectionDetail, Term } from "../content/App/App.types"

type ValidVersionData =
  | SerializedDataFormat<"1.4.1", v1_4_1_SectionData[]>
  | SerializedDataFormat<"1.5.0", v1_5_0_SectionData[]>
  | SerializedDataFormat<"1.6.0", v2_0_0_SectionData[]>
  | SerializedDataFormat<"2.0.0", v2_0_0_SectionData[]>
  | SerializedDataFormat<"2.0.1", ISectionData[]>

type SerializedDataFormat<T extends string, K> = {
  version: T
  data: K
}

// The term enum type used in versions <2.0.1. See Term
// in App.types.ts for the current Term enum.
export enum LegacyTerm {
  summerOne,
  summerTwo,
  summerFull,
  winterOne,
  winterTwo,
  winterFull,
}

type v1_4_1_SectionData = Omit<
  ISectionData,
  "session" | "courseID" | "terms"
> & {
  term: LegacyTerm
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
  term: LegacyTerm
  sectionDetails: Omit<SectionDetail, "location">[]
}
// 1.5 -> 1.6: no instructors + location
const v1_5_0 = async (
  oldSections: v1_5_0_SectionData[]
): Promise<v2_0_0_SectionData[]> => {
  const newSections: v2_0_0_SectionData[] = []
  for (const oldSection of oldSections) {
    // we await each call individually here to prevent workday
    // from erroring out due to too many concurrent requests
    // eslint-disable-next-line no-await-in-loop
    const newData = await fetchWorkdayData(oldSection.courseID!)
    if (newData === null)
      throw Error("Could not fetch instructor and location data!")

    const newSectionDetails = oldSection.sectionDetails.map((x, index) => ({
      ...x,
      location: newData.sectionDetails[index].location,
    }))
    newSections.push({
      ...oldSection,
      instructors: newData.instructors,
      sectionDetails: newSectionDetails,
    })
  }
  return newSections
}

type v2_0_0_SectionData = Omit<ISectionData, "session" | "terms"> & {
  term: LegacyTerm
}
// 2.0 -> 2.0.1: no sessions prop, term are enum instead of set
const v2_0_0 = (oldSections: v2_0_0_SectionData[]): ISectionData[] => {
  const legacyTermToTermSetMap = {
    [LegacyTerm.winterOne]: new Set([Term.One]),
    [LegacyTerm.winterTwo]: new Set([Term.Two]),
    [LegacyTerm.winterFull]: new Set([Term.One, Term.Two]),
    [LegacyTerm.summerOne]: undefined,
    [LegacyTerm.summerTwo]: undefined,
    [LegacyTerm.summerFull]: undefined,
  }
  return oldSections.map((x) => {
    const termSet = legacyTermToTermSetMap[x.term]
    if (termSet === undefined)
      throw Error(`Could not convert legacy term ${x.term} to terms set!`)
    return {
      ...x,
      session: "2024W",
      term: undefined,
      terms: termSet,
    }
  })
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
