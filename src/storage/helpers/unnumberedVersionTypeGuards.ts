import {
  v1_4_1_SectionData,
  v1_5_0_SectionData,
  v2_0_0_SectionData,
  ValidVersionData,
} from "../legacyStorageMigrators"

type VersionWithNoNumber =
  | v1_4_1_SectionData[]
  | v1_5_0_SectionData[]
  | v2_0_0_SectionData[]

const isVersionWithNumber = (
  data: VersionWithNoNumber | ValidVersionData
): data is ValidVersionData => {
  return (data as ValidVersionData).version !== undefined
}

const manuallyDetermineVersion = (
  data: VersionWithNoNumber
): ValidVersionData => {
  if (isV1_4_1(data)) return { version: "1.4.1", data: data }
  if (isV1_5_0(data)) return { version: "1.5.0", data: data }
  return { version: "2.0.0", data: data }
}

const isV1_4_1 = (data: VersionWithNoNumber): data is v1_4_1_SectionData[] => {
  return (
    data.filter((x) => (x as v1_5_0_SectionData).courseID === undefined)
      .length > 0
  )
}
const isV1_5_0 = (data: VersionWithNoNumber): data is v1_5_0_SectionData[] => {
  return (
    data.filter(
      (x) =>
        (x as v2_0_0_SectionData).instructors === undefined &&
        (x as v2_0_0_SectionData).courseID !== undefined
    ).length > 0
  )
}

export {
  type VersionWithNoNumber,
  isVersionWithNumber,
  manuallyDetermineVersion,
}
