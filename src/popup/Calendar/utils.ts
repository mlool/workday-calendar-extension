import { ISectionData } from "../App/App.types"

export interface CellFormat {
    name: string,
    color: string
}

export const convertToMatrix = (sections: ISectionData[], newSection: ISectionData, setInvalidSection: (state: boolean) => void) => {
    let matrixDict: {[id: string]: CellFormat[]} = {
        "Mon": [],
        "Tue": [],
        "Wed": [],
        "Thu": [],
        "Fri": []
    }
    for (const [key, value] of Object.entries(matrixDict)) {
        let i = 0
        while (i < 28) {
            let hour = 7 + Math.floor(i / 2)
            let stringHour = hour < 10? `0${hour}`:`${hour}`
            let minute = i % 2 === 0? "00": "30"
            let checkedTime = `${stringHour}:${minute}`
            let foundSection = sections.find((section) => section.days.includes(key) && section.startTime === checkedTime)
            if (foundSection) {
                let [code, number] = foundSection.code.split(" ")
                value.push({
                    name: code,
                    color: foundSection.color
                })
                value.push({
                    name: number,
                    color: foundSection.color
                })
                i += 2
                hour = 7 + Math.floor(i / 2)
                minute = i % 2 === 0? "00": "30"
                while (i < 28 && `${hour}:${minute}` !== foundSection.endTime) {
                    value.push({
                        name: "",
                        color: foundSection.color
                    })
                    i += 1
                    hour = 7 + Math.floor(i / 2)
                    minute = i % 2 === 0? "00": "30"
                }
            } else {
                value.push({
                    name: "",
                    color: "white"
                })
                i += 1
            }
        }
    }
    let hasInvalidSection = true
    if (newSection.startTime && newSection.endTime && newSection.days) {
        hasInvalidSection = false
        for (let day of newSection.days) {
            let [hourStr, minutesStr] = newSection.startTime.split(":")
            let hourNum = +hourStr
            let i = (hourNum - 7) * 2 + (minutesStr === "30"? 1 : 0)

            let hour = 7 + Math.floor(i / 2)
            let minute = i % 2 === 0? "00": "30"
            while (i < 28 && `${hour}:${minute}` !== newSection.endTime) {
                if (i < matrixDict[day]?.length && matrixDict[day][i]) { // Ensure i is within bounds
                    if (matrixDict[day][i].color === "white") {
                        matrixDict[day][i].color = "orange"
                    } else {
                        matrixDict[day][i].color = "red"
                        hasInvalidSection = true
                    }
                }
                i += 1
                hour = 7 + Math.floor(i / 2)
                minute = i % 2 === 0? "00": "30"
            }
        }
    }
    setInvalidSection(hasInvalidSection)
    return matrixDict
}

export const getCourseCode = (courseName: string): string => {
    return courseName.split('-')[0]
}