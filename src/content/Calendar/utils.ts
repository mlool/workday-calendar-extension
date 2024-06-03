import { ISectionData, Term } from "../App/App.types";

export interface CellFormat {
    name: string,
    color: string,
    sectionContent: ISectionData | null,
}

export const convertToMatrix = (sections: ISectionData[], newSection: ISectionData, setInvalidSection: (state: boolean) => void, currentTerm: Term) => {
    let matrixDict: {[id: string]: CellFormat[]} = {
        "Mon": [],
        "Tue": [],
        "Wed": [],
        "Thu": [],
        "Fri": []
    }

    const getEmptyCellArray = (): CellFormat[] => {
        const arr = []
        for(let i = 0; i < 28; i++) {
            arr.push({
                name: "",
                color: "white",
                sectionContent: null
            })
        }
        return arr
    }

    let keys = Object.keys(matrixDict);
    keys.forEach((key) => {
        matrixDict[key] = getEmptyCellArray()
    })

    sections.forEach((section) => {
        section.sectionDetails.forEach((details) => {
            if(details.term !== currentTerm) {
                return;
            }
            let [code, number] = section.code.split(" ")

            const [startHour, startMinute] = details.startTime.split(":").map((x) => +x)
            const [endHour, endMinute] = details.endTime.split(":").map((x) => +x)

            let startIndex = (startHour - 7) * 2 + startMinute / 30
            //Need to subtract 1 here or else we will fill in an extra cell. The diff between start index and end index needs to be # of blocks occupied - 1
            let endIndex = (endHour - 7) * 2 + endMinute / 30 - 1 

            details.days.forEach((day) => {
                //populate cells with Code and Number
                matrixDict[day][startIndex] = {
                    name: code,
                    color: section.color,
                    sectionContent: section
                }
                matrixDict[day][startIndex + 1] = {
                    name: number,
                    color: section.color,
                    sectionContent: section
                }
                
                //populate rest of cells
                for(let i = startIndex + 2; i <= endIndex; i++) {
                    matrixDict[day][i] = {
                        name: "",
                        color: section.color,
                        sectionContent: section
                    }
                }
            })
        })
    })

    //Deal with newSection
    let hasInvalidSection = !(newSection.sectionDetails.length > 0)
    newSection.sectionDetails.forEach((details) => {
        if(details.term !== currentTerm) {
            return;
        }
        const [startHour, startMinute] = details.startTime.split(":").map((x) => +x)
        const [endHour, endMinute] = details.endTime.split(":").map((x) => +x)

        let startIndex = (startHour - 7) * 2 + startMinute / 30
        //Need to subtract 1 here or else we will fill in an extra cell. The diff between start index and end index needs to be # of blocks occupied - 1
        let endIndex = (endHour - 7) * 2 + endMinute / 30 - 1 

        //for each day, and each cell within the start and entime, if section already in cell, color = red & set invalidSection true, else color = orange
        details.days.forEach((day) => {
            for(let i = startIndex; i <= endIndex; i++) {
                if(matrixDict[day][i].sectionContent) {
                    matrixDict[day][i].color = "red"
                    hasInvalidSection = true
                } else {
                    matrixDict[day][i].color = "orange"
                }
            }
        })
    })

    setInvalidSection(hasInvalidSection)
    return matrixDict
};

export const getCourseCode = (courseName: string): string => {
    return courseName.split('-')[0]
}
