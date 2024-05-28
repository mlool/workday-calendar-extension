import { ISectionData } from "../App/App.types"

export const mock = [
    {
        "code": "CPSC_V 100-101",
        "days": [
            "Tue",
            "Thu"
        ],
        "details": "CHBE-Floor 1-Room 101 | Tue Thu | 5:00 p.m. - 6:30 p.m. | 2024-09-03 - 2024-12-05",
        "endTime": "18:30",
        "location": "CHBE-Floor 1-Room 101",
        "name": "Computational Thinking",
        "startTime": "17:00",
        "term": 3,
        "title": "CPSC_V 100-101 - Computational Thinking",
        "type": 0
    },
    {
        "code": "CPSC_V 100-L1A",
        "name": "Computational Thinking",
        "type": 0,
        "location": "ICCS-Floor B1-Room X050",
        "days": [
            "Wed"
        ],
        "startTime": "14:00",
        "endTime": "15:00",
        "term": 4,
        "details": "ICCS-Floor B1-Room X050 | Wed | 2:00 p.m. - 3:00 p.m. | 2024-09-04 - 2024-12-04",
        "title": "CPSC_V 100-L1A - Computational Thinking"
    }
]

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
    for (const [key, value] of Object.entries(matrixDict)) {
        let i = 0
        while (i < 28) {
            let hour = 7 + Math.floor(i / 2)
            let minute = i % 2 === 0? "00": "30"
            let checkedTime = `${hour}:${minute}`
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