import SectionDetail from "./SectionDetail";

export interface SectionSchedule {
    day: string[];
    startTime: string;
    endTime: string;
    terms: number[];
    color: string;
    section: Section;
}

export interface IGradesAPIData {
    average: number | null
    averageFiveYears: number | null
}

export default class Section {
    private code: string; // Course Code, eg. CPSC_V 100
    private courseID: string; // Workday Course ID, eg "458290", if custom a random guid string

    private instructors: string[];
    private sectionDetails: SectionDetail[];
    private session: string; // Session, eg. "2025W"
    private worklistNumber: number; // Worklist Number
    private color: string; // Displayed Color

    private sectionCode?: string; // Section Number, eg. "202", "L22"
    private format?: string; // Course Format, eg. "Lecture"
    private name?: string; // Course Name, eg. "Models of Computation"
    private isCustom?: boolean; // Whether the section is a custom section

    constructor(
        code: string,
        courseID: string,
        instructors: string[],
        sectionDetails: SectionDetail[],
        session: string,
        worklistNumber: number,
        color: string,
        sectionCode?: string,
        format?: string,
        name?: string,
        isCustom?: boolean,
    ) {
        this.code = code;
        this.courseID = courseID;
        this.sectionCode = sectionCode;
        this.format = format;
        this.name = name;
        this.isCustom = isCustom;
        this.instructors = instructors;
        this.sectionDetails = sectionDetails;
        this.session = session;
        this.worklistNumber = worklistNumber;
        this.color = color;
    }

    static getSectionFromJSON(data: any, version?: string): Section {
        const sectionDetails = data.sectionDetails.map(
            (sectionDetail: any) => SectionDetail.getSectionDetailFromJSON(sectionDetail, version));

        return new Section(
            data.code,
            data.courseID,
            data.instructors,
            sectionDetails,
            data.session,
            data.worklistNumber,
            data.color,
            data.sectionCode,
            data.format,
            data.name
        );
    }

    getCode(): string {
        return this.code;
    }

    getCourseID(): string {
        return this.courseID;
    }

    getInstructors(): string[] {
        return this.instructors;
    }

    getSectionDetails(): SectionDetail[] {
        return this.sectionDetails;
    }

    getSession(): string {
        return this.session;
    }

    getLocations(): string[] {
        const locations = new Set<string>();
        this.sectionDetails.forEach((sectionDetail: SectionDetail) => {
            const location = sectionDetail.getLocation();
            if (location) {
                locations.add(location);
            }
        });
        return Array.from(locations);
    }

    getWorklistNumber(): number {
        return this.worklistNumber;
    }

    setWorklistNumber(worklistNumber: number) {
        this.worklistNumber = worklistNumber;
    }

    getColor(): string {
        return this.color;
    }

    setColor(color: string) {
        this.color = color;
    }

    getSectionCode(): string | undefined {
        return this.sectionCode;
    }

    getFormat(): string | undefined {
        return this.format;
    }

    getName(): string | undefined {
        return this.name;
    }

    getIsCustom(): boolean | undefined {
        return this.isCustom;
    }

    getSectionLink(): string {
        if (this.isCustom) {
            return "";
        }
        return `https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$${this.courseID}.htmld`;
    }

    // Returns a set of terms that the section is offered in
    getTerms(): Set<number> {
        return this.sectionDetails.reduce((acc: Set<number>, sectionDetail: SectionDetail) => {
            sectionDetail.getTerms().forEach((term: number) => acc.add(term));
            return acc;
        }, new Set<number>());
    }

    getSectionSchedule(term?: number[]): SectionSchedule[] {
        return Array.from(
            new Map(
                this.sectionDetails
                    .filter((sectionDetail: SectionDetail) => {
                        if (!term || term.length === 0) return true;
                        return sectionDetail.getTerms().some((t: number) => term.includes(t));
                    })
                    .map((sectionDetail: SectionDetail) => {
                        const item = {
                            day: sectionDetail.getDays(),
                            startTime: sectionDetail.getStartTime(),
                            endTime: sectionDetail.getEndTime(),
                            terms: sectionDetail.getTerms(),
                            color: this.color,
                            section: this
                        };

                        const key = `${item.day.sort().join(",")}|${item.startTime}|${item.endTime}|${item.terms?.sort().join(",")}`;
                        return [key, item];
                    })
            ).values()
        );
    }


    /*
    Interactions with chrome storage
    */
    exportToJSON(): any {
        return {
            code: this.code,
            courseID: this.courseID,
            instructors: this.instructors,
            sectionDetails: this.sectionDetails.map((sectionDetail: SectionDetail) => sectionDetail.exportToJSON()),
            session: this.session,
            worklistNumber: this.worklistNumber,
            color: this.color,
            sectionCode: this.sectionCode,
            format: this.format,
            name: this.name
        }
    }

    async saveToStorage() {
        await chrome.storage.local.set({ newSection: null })
        await chrome.storage.local.set({ newSection: JSON.stringify(this.exportToJSON()) });
        return true;
    }

    async removeFromStorage() {
        await chrome.storage.local.set({ newSection: null })
        return true;
    }




    async getHistoricalGrades(): Promise<IGradesAPIData> {
        if (this.isCustom) {
            return {
                average: null,
                averageFiveYears: null
            }
        }

        const isVancouver = this.getCode().includes("_V")
        const campus = isVancouver ? "UBCV" : "UBCO"
        const courseCode = this.getCode().split("_")[0] // Eg. CPSC
        const courseNum = this.getCode().split(" ")[1].split("-")[0] // Eg. 110

        const reqURL = `https://ubcgrades.com//api/v3/course-statistics/${campus}/${courseCode}/${courseNum}`
        const response = await fetch(reqURL)
        if (response.ok) {
            const data = await response.json()
            return {
                average: data["average"] === "" ? null : Number(data["average"]),
                averageFiveYears:
                    data["average_past_5_yrs"] === ""
                        ? null
                        : Number(data["average_past_5_yrs"]),
            }
        } else {
            return {
                average: null,
                averageFiveYears: null
            }
        }
    }

    getGradesUrl(): string {
        const isVancouver = this.getCode().includes("_V")
        const campus = isVancouver ? "UBCV" : "UBCO"
        const courseCode = this.getCode().split("_")[0] // Eg. CPSC
        const courseNum = this.getCode().split(" ")[1].split("-")[0] // Eg. 110

        const url = `https://ubcgrades.com/statistics-by-course#${campus}-${courseCode}-${courseNum}`
        return url
    }
}