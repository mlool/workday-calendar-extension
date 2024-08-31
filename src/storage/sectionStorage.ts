import { ISectionData } from "../content/App//App.types"
import {
  v1_4_1,
  v1_5_0,
  v2_0_0,
  ValidVersionData,
  CurrentFormat,
} from "./legacyStorageMigrators"
import {
  isVersionWithNumber,
  manuallyDetermineVersion,
  VersionWithNoNumber,
} from "./helpers/unnumberedVersionTypeGuards"
import { DataErrors, Result, wrapInResult } from "./errors"

type ProgressUpdateCallback = (x: number) => void

/**
 * Wrap the given `sections` data in a
 * {@link SerializedDataFormat} with the current version number.
 */
const packageCurrentData = (sections: ISectionData[]): CurrentFormat => ({
  version: "2.0.1",
  data: sections,
})

/**
 * Given section data from any version, determines which format
 * it's in and converts data to the latest version. Takes an
 * optional callback for progress updates, to be used in loading
 * bars, etc.
 */
const processRawSections = async (
  rawSections: ValidVersionData | VersionWithNoNumber,
  progressUpdateCallback?: ProgressUpdateCallback
): Promise<Result<ISectionData[], DataErrors[]>> => {
  if (Array.isArray(rawSections) && rawSections.length === 0)
    return { ok: true, data: [] }

  const extractedSections = isVersionWithNumber(rawSections)
    ? rawSections
    : manuallyDetermineVersion(rawSections)

  if (extractedSections.data.length === 0) return { ok: true, data: [] }
  return await sectionDataAutoMigrator(
    extractedSections,
    [],
    progressUpdateCallback !== undefined ? progressUpdateCallback : () => {}
  )
}

/**
 * Type-safe section data migration function. Recursively updates
 * the data to newer and newer versions until it reaches current
 * version.
 */
const sectionDataAutoMigrator = async (
  input: ValidVersionData,
  accumulatedErrors: DataErrors[],
  progressUpdateCallback: ProgressUpdateCallback
): Promise<Result<ISectionData[], DataErrors[]>> => {
  switch (input.version) {
    case "2.0.1":
      return wrapInResult(input.data, accumulatedErrors)
    case "1.6.0":
    case "2.0.0": {
      const res = v2_0_0(input.data, progressUpdateCallback)
      return sectionDataAutoMigrator(
        {
          version: "2.0.1",
          data: res.data,
        },
        res.ok ? accumulatedErrors : accumulatedErrors.concat(res.errors),
        progressUpdateCallback
      )
    }
    case "1.5.0": {
      const res = await v1_5_0(input.data, progressUpdateCallback)
      return sectionDataAutoMigrator(
        {
          version: "2.0.0",
          data: res.data,
        },
        res.ok ? accumulatedErrors : accumulatedErrors.concat(res.errors),
        progressUpdateCallback
      )
    }
    case "1.4.1": {
      const res = await v1_4_1(input.data, progressUpdateCallback)
      return sectionDataAutoMigrator(
        {
          version: "2.0.0",
          data: res.data,
        },
        res.ok ? accumulatedErrors : accumulatedErrors.concat(res.errors),
        progressUpdateCallback
      )
    }
    default:
      return {
        ok: false,
        data: [],
        errors: [
          ...accumulatedErrors,
          // @ts-expect-error this case shouldn't ever be possible, but on
          // the off chance that it actually is, i'd like to get a runtime
          // error for it
          { errorCode: 0, errorData: { version: input.version } },
        ],
      }
  }
}

/**
 * Convenience function to deserialize sections from JSON, using a
 * custom reviver to convert JSONified `Set`s represented as
 * `["_isSet", ...set contents]` back to actual `Set`s.
 */
const loadSectionDataFromJSON = <T = undefined>(
  input: string
): T extends undefined ? VersionWithNoNumber | ValidVersionData : T => {
  return JSON.parse(input, (key: string, value: unknown) => {
    if (Array.isArray(value) && value[0] === "_isSet") {
      return new Set(value.slice(1))
    }
    return value
  })
}

/**
 * Convenience function to serialize sections to JSON, using a custom
 * replacer since `Set`s aren't JSON-ifiable on their own.
 *
 * We convert `Set`s to `Array`s with the first element being
 * `"_isSet"` - the matching {@link loadSectionDataFromJSON} function
 * uses this to correctly detect serialized `Set`s and restore them
 * accordingly.
 */
const convertSectionDataToJSON = (
  input: CurrentFormat | ISectionData
): string => {
  return JSON.stringify(
    input,
    (key: unknown, value: unknown) => {
      if (value instanceof Set) {
        return ["_isSet", ...value]
      }
      return value
    },
    2
  )
}

const appendNewSections = async (
  existingSections: ISectionData[],
  newSections: ISectionData[] | string | undefined,
  progressUpdateCallback: ProgressUpdateCallback,
  worklistNumber?: number
): Promise<Result<ISectionData[], DataErrors[]>> => {
  const importErrors: DataErrors[] = []
  if (newSections === undefined) return wrapInResult([], [{ errorCode: 5 }])
  const rawSections =
    typeof newSections === "string"
      ? loadSectionDataFromJSON(newSections)
      : packageCurrentData(newSections)
  const importedSections = await processRawSections(
    rawSections,
    progressUpdateCallback
  )
  if (!importedSections.ok) importErrors.push(...importedSections.errors)
  const filteredImportData = worklistNumber
    ? importedSections.data.map((x) => ({
        ...x,
        worklistNumber: worklistNumber,
      }))
    : importedSections.data
  const allSections = [...existingSections]
  for (const section of filteredImportData) {
    // TODO: check for conflicts here.
    allSections.push(section)
  }
  return wrapInResult(allSections, importErrors)
}

export {
  loadSectionDataFromJSON,
  convertSectionDataToJSON,
  processRawSections,
  sectionDataAutoMigrator,
  packageCurrentData,
  type ProgressUpdateCallback,
  appendNewSections,
}
