import { ISectionData } from "../content/App/App.types"
import { getCourseCode } from "../content/Calendar/utils"

export enum ColorTheme {
  GreenBlue = "GREENBLUE",
  Green = "GREEN",
  Blue = "BLUE",
  MultiColor = "MULTI",
  Basic = "BASIC",
}

export const defaultColorList = [
  "#EAFFD1",
  "#A5CEF0",
  "#CCEAC2",
  "#A4C0FB",
  "#A0CFA4",
  "#91C6FF",
  "#7DBB82",
  "#8FA1FD",
]

export const colorPalettes = new Map<string, string[]>([
  [ColorTheme.GreenBlue, defaultColorList],
  [
    ColorTheme.Green,
    [
      "#EAFFD1",
      "#ADD9A4",
      "#DBF6C6",
      "#8FC68D",
      "#CCECBB",
      "#80BC82",
      "#70B276",
      "#6AA76F",
    ],
  ],
  [
    ColorTheme.Blue,
    [
      "#A5CEF0",
      "#83A3EE",
      "#9DC4F0",
      "#7B99EE",
      "#94B9EF",
      "#728EED",
      "#6A83EC",
      "#667EEC",
    ],
  ],
  [
    ColorTheme.MultiColor,
    [
      "#FF8DEA",
      "#FCF59F",
      "#A5CEF0",
      "#D1B0FF",
      "#CAFF89",
      "#7A90FE",
      "#AAFFCA",
      "#FFE19F",
    ],
  ],
  [ColorTheme.Basic, ["#EAFFD1"]],
])

export const assignColors = (
  sectionsList: ISectionData[],
  theme: ColorTheme
): ISectionData[] => {
  const newSectionsList: ISectionData[] = []

  sectionsList.forEach((section) => {
    section.color = getNewSectionColor(newSectionsList, section, theme)
    newSectionsList.push(section)
  })

  return newSectionsList
}

export const getNewSectionColor = (
  sectionsList: ISectionData[],
  addedSection: ISectionData,
  theme: ColorTheme
): string => {
  const colorList = colorPalettes.get(theme) ?? defaultColorList

  // Case for single colored themes
  if (colorList.length === 1) {
    return colorList[0]
  }
  const releventSectionsList = sectionsList.filter(
    (sec) =>
      sec.worklistNumber === addedSection.worklistNumber &&
      sec.term === addedSection.term
  )

  const newCourseCode = getCourseCode(addedSection.code)

  const existingSection = releventSectionsList.find(
    (x) => x.code.includes(newCourseCode) && x.color
  )
  if (existingSection) {
    return existingSection.color
  }

  const assignedColors = Array.from(
    new Set(
      releventSectionsList
        .filter((x) => x.color != null)
        .map((section) => section.color)
    )
  )
  const availableColors = colorList.filter(
    (color) => !assignedColors.includes(color)
  )

  return availableColors.length >= 1 ? availableColors[0] : "#BDBDBD"
}
