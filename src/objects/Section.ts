import SectionDetail from "./SectionDetail";

export interface SectionSchedule {
    code: string;
    courseID: string;
    section?: string;
    format?: string;
    name?: string;
    instructors: string[];
    day: string[];
    startTime: string;
    endTime: string;
    terms: number[];
    location?: string;
    color: string;
}

export default class Section {
    code: string; // Course Code, eg. CPSC_V 100
    courseID: string; // Workday Course ID, eg "458290"

    instructors: string[];
    sectionDetails: SectionDetail[];
    session: string; // Session, eg. "2025W"
    worklistNumber: number; // Worklist Number
    color: string; // Displayed Color

    sectionCode?: string; // Section Number, eg. "202", "L22"
    format?: string; // Course Format, eg. "Lecture"
    name?: string; // Course Name, eg. "Models of Computation"

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
    ) {
        this.code = code;
        this.courseID = courseID;
        this.sectionCode = sectionCode;
        this.format = format;
        this.name = name;
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

    getWorklistNumber(): number {
        return this.worklistNumber;
    }

    getColor(): string {
        return this.color;
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


    getSectionSchedule(): SectionSchedule[] {
        return Array.from(
            new Map(
                this.sectionDetails.map((sectionDetail: SectionDetail) => {
                    const item = {
                        code: this.code,
                        courseID: this.courseID,
                        section: this.sectionCode,
                        format: this.format,
                        name: this.name,
                        instructors: this.instructors,
                        day: sectionDetail.getDays(),
                        startTime: sectionDetail.getStartTime(),
                        endTime: sectionDetail.getEndTime(),
                        terms: sectionDetail.getTerms(),
                        location: sectionDetail.getLocation(),
                        color: this.color
                    };

                    const key = `${item.day.sort().join(",")}|${item.startTime}|${item.endTime}|${item.terms?.sort().join(",")}`;
                    return [key, item];
                })
            ).values()
        );
    }

    // Returns a set of terms that the section is offered in
    getTerms(): Set<number> {
        return this.sectionDetails.reduce((acc: Set<number>, sectionDetail: SectionDetail) => {
            sectionDetail.getTerms().forEach((term: number) => acc.add(term));
            return acc;
        }, new Set<number>());
    }

    async saveToStorage() {
        await chrome.storage.local.set({ newSection: null })
        await chrome.storage.local.set({ newSection: JSON.stringify(this.exportToJSON()) });
        return true;
    }
}