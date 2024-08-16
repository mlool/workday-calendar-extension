import { ISectionData } from "../content/App/App.types"
import { LegacySectionDetail, LegacyTerm } from "./legacyStorageMigrators"

interface DataError {
  errorCode: number
  errorData: Record<string, unknown>
}

/**
 * All recoverable errors generated from the section data layer. Should
 * be processed with a function client-side that can map the error codes
 * to the desired error messages, or other error recovery functionality
 */
const DataErrors = {
  INVALID_VERSION: (v: string) => ({ errorCode: 0, errorData: { version: v } }),
  COULD_NOT_CONVERT_LEGACY_TERM: (x: LegacyTerm, y: string) => ({
    errorCode: 1,
    errorData: { oldTerm: x, sectionCode: y },
  }),
  COULD_NOT_CONVERT_LEGACY_DETAIL: (x: LegacySectionDetail, y: string) => ({
    errorCode: 2,
    errorData: { oldDetail: x, sectionCode: y },
  }),
  COULD_NOT_FETCH_WORKDAY_DATA: (x: string) => ({
    errorCode: 3,
    errorData: { sectionCode: x },
  }),
  COULD_NOT_FETCH_COURSE_ID: (x: string) => ({
    errorCode: 4,
    errorData: { sectionCode: x },
  }),
  // idk, is there no better way to type this??
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} satisfies Record<Uppercase<string>, (...args: any[]) => DataError>

type DataErrorObject = ReturnType<(typeof DataErrors)[keyof typeof DataErrors]>

const defaultErrorProcessor = (err: DataErrorObject) => {
  switch (err.errorCode) {
    case 0: {
      const version = (err as ReturnType<typeof DataErrors.INVALID_VERSION>)
        .errorData.version
      return `Version ${version} could not be properly migrated! Are you sure this version of the extension supports this format?`
    }
    case 1: {
      const data = (
        err as ReturnType<typeof DataErrors.COULD_NOT_CONVERT_LEGACY_TERM>
      ).errorData
      return `${data.sectionCode}: Legacy term "${data.oldTerm}" could not be converted to terms set.`
    }
    case 2: {
      const data = (
        err as ReturnType<typeof DataErrors.COULD_NOT_CONVERT_LEGACY_DETAIL>
      ).errorData
      return `${data.sectionCode}: Legacy detail "${data.oldDetail}" could not be converted to terms set.`
    }
    case 3: {
      const sectionCode = (
        err as ReturnType<typeof DataErrors.COULD_NOT_FETCH_WORKDAY_DATA>
      ).errorData.sectionCode
      return `${sectionCode}: Could not retrieve instructor and location data.`
    }
    case 4: {
      const sectionCode = (
        err as ReturnType<typeof DataErrors.COULD_NOT_FETCH_COURSE_ID>
      ).errorData.sectionCode
      return `${sectionCode}: Could not retrieve course ID.`
    }
  }
}

const postAlertIfHasErrors = (
  res: Result<ISectionData[], DataErrorObject[]>
) => {
  console.log("AHAHAHAHA")
  if (!res.ok) {
    console.log("EHEHEHEHE")
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
type Result<T, K extends DataErrorObject[]> =
  | {
      ok: true
      data: T
    }
  | {
      ok: false
      data: T
      errors: K
    }

const wrapInResult = <T, K extends DataErrorObject[]>(
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
  DataErrors,
  type DataErrorObject,
  wrapInResult,
  defaultErrorProcessor,
  postAlertIfHasErrors
}
