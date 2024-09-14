import { ISectionData } from "../content/App/App.types"
import { LegacySectionDetail, LegacyTerm } from "./legacyStorageMigrators"

type DataError<
  T extends number,
  K extends Record<string, unknown> | undefined
> = K extends undefined
  ? {
      errorCode: T
    }
  : {
      errorCode: T
      errorData: K
    }

type InvalidVersionErr = DataError<0, { version: string }>
type ConvertLegacyTermErr = DataError<
  1,
  { oldTerm: LegacyTerm; sectionCode: string }
>
type ConvertLegacyDetailErr = DataError<
  2,
  { oldDetail: LegacySectionDetail; sectionCode: string }
>
type FetchWorkdayDataErr = DataError<3, { sectionCode: string }>
type FetchCourseIdErr = DataError<4, { sectionCode: string }>
type UndefinedImportErr = DataError<5, undefined>
type MultipleWorklistInIndividualImportErr = DataError<6, undefined>

/**
 * All recoverable errors generated from the section data layer. Should
 * be processed client-side with a function such as {@link defaultErrorProcessor}
 * that can map the error codes to the desired error messages, or other
 * error recovery functionality.
 */
type DataErrors =
  | InvalidVersionErr
  | ConvertLegacyTermErr
  | ConvertLegacyDetailErr
  | FetchWorkdayDataErr
  | FetchCourseIdErr
  | UndefinedImportErr
  | MultipleWorklistInIndividualImportErr

const defaultErrorProcessor = (err: DataErrors): string => {
  switch (err.errorCode) {
    case 0: {
      return `Version ${err.errorData.version} could not be properly migrated! Are you sure this version of the extension supports this format?`
    }
    case 1: {
      const { sectionCode, oldTerm } = err.errorData
      return `${sectionCode}: Legacy term "${oldTerm}" could not be converted to terms set.`
    }
    case 2: {
      const { sectionCode, oldDetail } = err.errorData
      return `${sectionCode}: Legacy detail "${oldDetail}" could not be converted to terms set.`
    }
    case 3: {
      return `${err.errorData.sectionCode}: Could not retrieve instructor and location data.`
    }
    case 4: {
      return `${err.errorData.sectionCode}: Could not retrieve course ID.`
    }
    case 5: {
      return "Sections to import could not be read!"
    }
    case 6: {
      return "Warning! You are attempting to import sections from multiple worklists into one worklist. This may cause unexpected behavior - please use the 'Import All Worklists' button instead."
    }
  }
}

const postAlertIfHasErrors = (res: Result<ISectionData[], DataErrors[]>) => {
  if (!res.ok) {
    const errorMsgs = res.errors.map(defaultErrorProcessor)
    alert(errorMsgs.join("\n"))
  }
}

/**
 * A type for when the result of an operation may return either
 * the requested data, or partial requested data with errors.
 * Use the `ok` property to determine whether the operation was
 * completed without errors.
 */
type Result<T, K extends DataErrors[]> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      data: T
      errors: K
    }

const wrapInResult = <T, K extends DataErrors[]>(
  data: T,
  errors: K
): Result<T, K> => {
  if (errors.length === 0) {
    return { ok: true, data }
  }
  return { ok: false, data, errors }
}

export {
  type Result,
  type DataErrors,
  wrapInResult,
  defaultErrorProcessor,
  postAlertIfHasErrors,
  type InvalidVersionErr,
  type ConvertLegacyTermErr,
  type ConvertLegacyDetailErr,
  type FetchWorkdayDataErr,
  type FetchCourseIdErr,
}
