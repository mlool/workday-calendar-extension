import Browser from "webextension-polyfill"
import { ISectionData } from "../content/App//App.types"
import {
  v1_4_1,
  v1_5_0,
  v2_0_0,
  ValidVersionData,
} from "./legacyStorageMigrators"
import {
  isVersionWithNumber,
  manuallyDetermineVersion,
  VersionWithNoNumber,
} from "./helpers/unnumberedVersionTypeGuards"
import { DataErrors, Result, wrapInResult } from "./errors"

const readSectionData = async (): Promise<
  Result<ISectionData[], DataErrors[]>
> => {
  // versions <= v1.4 used the sync storagearea
  const oldSections = await Browser.storage.sync.get("sections")
  if (oldSections.sections !== undefined) {
    console.log("Importing sections from sync storagearea...")
    await Browser.storage.sync.remove("sections")
    await Browser.storage.local.set({ sections: oldSections })
  }

  const rawSections = (await Browser.storage.local.get("sections")).sections as
    | ValidVersionData
    | VersionWithNoNumber
    | undefined
  return processRawSections(rawSections)
}

const processRawSections = async (
  rawSections: ValidVersionData | VersionWithNoNumber | undefined
): Promise<Result<ISectionData[], DataErrors[]>> => {
  if (rawSections === undefined) return { ok: true, data: [] }
  if (Array.isArray(rawSections) && rawSections.length === 0)
    return { ok: true, data: [] }

  const extractedSections = isVersionWithNumber(rawSections)
    ? rawSections
    : manuallyDetermineVersion(rawSections)

  if (extractedSections.data.length === 0) return { ok: true, data: [] }
  return await sectionDataAutoMigrator(extractedSections, [])
}

/**
 * Type-safe section data migration function. Recursively updates
 * the data to newer and newer versions until it reaches current
 * version.
 */
const sectionDataAutoMigrator = async (
  input: ValidVersionData,
  accumulatedErrors: DataErrors[]
): Promise<Result<ISectionData[], DataErrors[]>> => {
  switch (input.version) {
    case "2.0.1":
      return wrapInResult(input.data, accumulatedErrors)
    case "1.6.0":
    case "2.0.0": {
      const res = v2_0_0(input.data)
      return sectionDataAutoMigrator(
        {
          version: "2.0.1",
          data: res.data,
        },
        res.ok ? accumulatedErrors : accumulatedErrors.concat(res.errors)
      )
    }
    case "1.5.0": {
      const res = await v1_5_0(input.data)
      return sectionDataAutoMigrator(
        {
          version: "2.0.0",
          data: res.data,
        },
        res.ok ? accumulatedErrors : accumulatedErrors.concat(res.errors)
      )
    }
    case "1.4.1": {
      const res = await v1_4_1(input.data)
      return sectionDataAutoMigrator(
        {
          version: "2.0.0",
          data: res.data,
        },
        res.ok ? accumulatedErrors : accumulatedErrors.concat(res.errors)
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
          { errorCode: 0, errorData: { version: input.version } }
        ],
      }
  }
}

/**
 * Convenience function to deserialize sections from JSON, using a
 * custom reviver to convert JSONified `Set`s represented as arrays
 * back to actual `Set`s.
 */
const loadSectionDataFromJSON = (
  input: string
): VersionWithNoNumber | ValidVersionData => {
  return JSON.parse(input, (key: string, value: unknown) => {
    if (key === "terms") {
      return new Set((value as []).slice(1))
    }
    return value
  })
}

/**
 * Convenience function to serialize sections to JSON, using a custom
 * replacer since `Set`s aren't JSON-able on their own.
 */
const convertSectionDataToJSON = (input: ISectionData[]): string => {
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

const writeSectionData = async (newSections: ISectionData[]) => {
  const serializedData = { version: "2.0.1", data: newSections }
  await Browser.storage.local.set({ sections: serializedData })
}

export {
  readSectionData,
  writeSectionData,
  loadSectionDataFromJSON,
  convertSectionDataToJSON,
  processRawSections,
  sectionDataAutoMigrator,
}
