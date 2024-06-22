import { ISectionData, Term } from "../App/App.types"

export interface CellFormat {
  name: string
  color: string
  sectionContent: ISectionData | null
}

const splitTimeString = (time: string) => {
  return time.split(":").map((x) => Math.abs(Number(x)))
}

export const convertToMatrix = (
  sections: ISectionData[],
  newSection: ISectionData | null,
  setSectionConflict: (state: boolean) => void,
  currentTerm: Term
) => {
  const matrixDict: { [id: string]: CellFormat[] } = {
    Mon: [],
    Tue: [],
    Wed: [],
    Thu: [],
    Fri: [],
  }

  const getEmptyCell = (): CellFormat => {
    return {
      name: "",
      color: "white",
      sectionContent: null,
    }
  }

  const getEmptyCellArray = (): CellFormat[] => {
    const arr = []
    for (let i = 0; i < 28; i++) {
      arr.push(getEmptyCell())
    }
    return arr
  }

  const pushEmptyCellToArrays = () => {
    const keys = Object.keys(matrixDict)
    keys.forEach((key) => {
      matrixDict[key].push(getEmptyCell())
    })
  }

  const keys = Object.keys(matrixDict)
  keys.forEach((key) => {
    matrixDict[key] = getEmptyCellArray()
  })

  const addRowsToMatrix = (endIndex: number) => {
    while (!matrixDict["Mon"][endIndex]) {
      pushEmptyCellToArrays()
    }
    //Ensure we have even number of rows
    if (matrixDict["Mon"].length % 2 !== 0) {
      pushEmptyCellToArrays()
    }
  }

  sections.forEach((section) => {
    section.sectionDetails.forEach((details) => {
      if (details.term !== currentTerm) {
        return
      }
      const [code, number] = section.code.split(" ")

      const [startHour, startMinute] = splitTimeString(details.startTime)
      const [endHour, endMinute] = splitTimeString(details.endTime)

      const startIndex = (startHour - 7) * 2 + startMinute / 30
      //Need to subtract 1 here or else we will fill in an extra cell. The diff between start index and end index needs to be # of blocks occupied - 1
      const endIndex = (endHour - 7) * 2 + endMinute / 30 - 1

      //If we don't have enough rows in matrix, keep adding empty rows until enough
      if (!matrixDict["Mon"][endIndex]) {
        addRowsToMatrix(endIndex)
      }

      details.days.forEach((day) => {
        //populate cells with Code and Number
        matrixDict[day][startIndex] = {
          name: code,
          color: section.color,
          sectionContent: section,
        }
        //Add the if condition since courses can be 30 minute, and only need 1 timeslot
        if (startIndex !== endIndex) {
          matrixDict[day][startIndex + 1] = {
            name: number,
            color: section.color,
            sectionContent: section,
          }
        }
        //populate rest of cells
        for (let i = startIndex + 2; i <= endIndex; i++) {
          matrixDict[day][i] = {
            name: "",
            color: section.color,
            sectionContent: section,
          }
        }
      })
    })
  })

  //Deal with newSection
  let hasInvalidSection =
    newSection !== null && !(newSection?.sectionDetails.length > 0)
  newSection?.sectionDetails.forEach((details) => {
    if (details.term !== currentTerm) {
      return
    }
    const [startHour, startMinute] = splitTimeString(details.startTime)
    const [endHour, endMinute] = splitTimeString(details.endTime)

    const startIndex = (startHour - 7) * 2 + startMinute / 30
    //Need to subtract 1 here or else we will fill in an extra cell. The diff between start index and end index needs to be # of blocks occupied - 1
    const endIndex = (endHour - 7) * 2 + endMinute / 30 - 1

    //If we don't have enough rows in matrix, keep adding empty rows until enough
    if (!matrixDict["Mon"][endIndex]) {
      addRowsToMatrix(endIndex)
    }
    //for each day, and each cell within the start and entime, if section already in cell, color = red & set invalidSection true, else color = orange
    details.days.forEach((day) => {
      for (let i = startIndex; i <= endIndex; i++) {
        if (matrixDict[day][i].sectionContent) {
          matrixDict[day][i].color = "red"
          hasInvalidSection = true
        } else {
          matrixDict[day][i].color = "orange"
        }
      }
    })
  })

  setSectionConflict(hasInvalidSection)
  return matrixDict
}

export const getCourseCode = (courseName: string): string => {
  return courseName.split("-")[0]
}

export const getEndHour = (matrixDict: {
  [id: string]: CellFormat[]
}): number => {
  //All the lengths should be the same, so we can just check Mon. If they are not the same, calendar looks off anyways so will need to fix it.
  const slots = matrixDict["Mon"].length
  return Math.ceil(slots / 2) + 7 - 1 // subtract 1 since we need to go up to this hour, not past it
}
