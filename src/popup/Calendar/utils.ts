import { ISectionData } from "../App/App.types"

export interface CellFormat {
    name: string,
    color: string
}

export const convertToMatrix = (sections: ISectionData[]) => {
    let matrixDict: {[id: string]: CellFormat[]} = {
        "Mon": [],
        "Tue": [],
        "Wed": [],
        "Thu": [],
        "Fri": []
    }
    console.log(sections.find((section) => section.days.includes("Fri")))
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
                    color: "#eaffd1"
                })
                value.push({
                    name: number,
                    color: "#eaffd1"
                })
                i += 2
                hour = 7 + Math.floor(i / 2)
                minute = i % 2 === 0? "00": "30"
                while (i < 28 && `${hour}:${minute}` !== foundSection.endTime) {
                    value.push({
                        name: "",
                        color: "#eaffd1"
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
    return matrixDict
}