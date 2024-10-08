import { findCourseId } from "../backends/scheduler/nameSearchApi"
import { fetchWorkdayData } from "../backends/workday/idSearchApi"
import { ISectionData, SectionDetail, Term } from "../content/App/App.types"
import {
  ConvertLegacyDetailErr,
  ConvertLegacyTermErr,
  FetchCourseIdErr,
  FetchWorkdayDataErr,
  Result,
  wrapInResult,
} from "./errors"
import { ProgressUpdateCallback } from "./sectionStorage"

type ValidVersionData =
  | SerializedDataFormat<"1.4.1", v1_4_1_SectionData[]>
  | SerializedDataFormat<"1.5.0", v1_5_0_SectionData[]>
  | SerializedDataFormat<"1.6.0", v2_0_0_SectionData[]>
  | SerializedDataFormat<"2.0.0", v2_0_0_SectionData[]>
  | CurrentFormat

type CurrentFormat = SerializedDataFormat<"2.0.1", ISectionData[]>

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

export type LegacySectionDetail = Omit<SectionDetail, "term"> & {
  term: LegacyTerm
}

type v1_4_1_SectionData = Omit<
  ISectionData,
  "session" | "courseID" | "terms" | "sectionDetails"
> & {
  term: LegacyTerm
  sectionDetails: LegacySectionDetail[]
}
type v1_4_1_PossibleErrors = FetchCourseIdErr[]
// version 1.4.1 has no courseID, but still has the location data
// that was removed in 1.5.0 and then readded in 1.6.0
const v1_4_1 = async (
  oldSections: v1_4_1_SectionData[],
  progressUpdateCallback: ProgressUpdateCallback
): Promise<Result<v2_0_0_SectionData[], v1_4_1_PossibleErrors>> => {
  const errors: v1_4_1_PossibleErrors = []
  const newSections: v2_0_0_SectionData[] = []
  for (const section of oldSections) {
    // we await each call individually here to prevent workday
    // from erroring out due to too many concurrent requests
    // eslint-disable-next-line no-await-in-loop
    const newCourseId = await findCourseId(section.code)
    if (newCourseId === null) {
      errors.push({ errorCode: 4, errorData: { sectionCode: section.code } })
      continue
    }
    const newSection = {
      ...section,
      courseID: newCourseId,
    }
    newSections.push(newSection)
    progressUpdateCallback(newSections.length / oldSections.length)
  }
  return wrapInResult(newSections, errors)
}

type v1_5_0_SectionData = Omit<
  ISectionData,
  "session" | "instructors" | "terms" | "sectionDetails"
> & {
  term: LegacyTerm
  sectionDetails: Omit<LegacySectionDetail, "location">[]
}
type v1_5_0_PossibleErrors = FetchWorkdayDataErr[]
// 1.5 -> 1.6: no instructors + location
const v1_5_0 = async (
  oldSections: v1_5_0_SectionData[],
  progressUpdateCallback: ProgressUpdateCallback
): Promise<Result<v2_0_0_SectionData[], v1_5_0_PossibleErrors>> => {
  const errors: v1_5_0_PossibleErrors = []
  const newSections: v2_0_0_SectionData[] = []
  for (const oldSection of oldSections) {
    // we await each call individually here to prevent workday
    // from erroring out due to too many concurrent requests
    // eslint-disable-next-line no-await-in-loop
    const newData = await fetchWorkdayData(oldSection.courseID!)
    if (newData === null) {
      errors.push({ errorCode: 3, errorData: { sectionCode: oldSection.code } })
      continue
    }

    const newSectionDetails = oldSection.sectionDetails.map((x, index) => ({
      ...x,
      location: newData.sectionDetails[index].location,
    }))
    newSections.push({
      ...oldSection,
      instructors: newData.instructors,
      sectionDetails: newSectionDetails,
    })
    progressUpdateCallback(newSections.length / oldSections.length)
  }
  return wrapInResult(newSections, errors)
}

type v2_0_0_SectionData = Omit<
  ISectionData,
  "session" | "terms" | "sectionDetails"
> & {
  term: LegacyTerm
  sectionDetails: LegacySectionDetail[]
}
type v2_0_0_PossibleErrors = (ConvertLegacyTermErr | ConvertLegacyDetailErr)[]
// 2.0 -> 2.0.1: no sessions prop, term are enum instead of set
const v2_0_0 = (
  oldSections: v2_0_0_SectionData[],
  progressUpdateCallback: ProgressUpdateCallback
): Result<ISectionData[], v2_0_0_PossibleErrors> => {
  const errors: v2_0_0_PossibleErrors = []
  const legacyTermToTermSetMap = {
    [LegacyTerm.winterOne]: new Set([Term.One]),
    [LegacyTerm.winterTwo]: new Set([Term.Two]),
    [LegacyTerm.winterFull]: new Set([Term.One, Term.Two]),
    [LegacyTerm.summerOne]: undefined,
    [LegacyTerm.summerTwo]: undefined,
    [LegacyTerm.summerFull]: undefined,
  }
  const newSections = oldSections
    .map((oldSection, index) => {
      const termSet = legacyTermToTermSetMap[oldSection.term]
      if (termSet === undefined) {
        errors.push({
          errorCode: 1,
          errorData: { oldTerm: oldSection.term, sectionCode: oldSection.code },
        })
        return undefined
      }

      const newDetails = oldSection.sectionDetails
        .map((x) => {
          const newTermSet = legacyTermToTermSetMap[x.term]
          if (newTermSet === undefined || newTermSet.size > 1) {
            errors.push({
              errorCode: 2,
              errorData: { oldDetail: x, sectionCode: oldSection.code },
            })
            return undefined
          }
          return {
            ...x,
            term: [...newTermSet][0],
          }
        })
        .filter((x) => x !== undefined)

      progressUpdateCallback(index / oldSections.length)
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { term, ...otherOldSectionParts } = oldSection
      return {
        ...otherOldSectionParts,
        sectionDetails: newDetails,
        session: "2024W",
        terms: termSet,
      }
    })
    .filter((x) => x !== undefined)
  return wrapInResult(newSections, errors)
}

export {
  type ValidVersionData,
  type v1_4_1_SectionData,
  v1_4_1,
  type v1_5_0_SectionData,
  v1_5_0,
  type v2_0_0_SectionData,
  v2_0_0,
  type CurrentFormat,
}
