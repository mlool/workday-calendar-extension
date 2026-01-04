export default class SectionDetail {
    private terms: number[]; // Term Number (1, 2)
    private days: string[]; // Days of Week ("Mon", "Tue", "Wed", "Thu", "Fri")
    private startTime: string; // Time ("09:30")
    private endTime: string; // Time ("11:00")

    private startDate?: string; // Optional, for exporting purposes
    private endDate?: string; // 
    private location?: string; // Lecture Location, optional if online

    constructor(
        terms: number[],
        days: string[],
        startTime: string,
        endTime: string,
        startDate?: string,
        endDate?: string,
        location?: string
    ) {
        this.terms = terms;
        this.days = days;
        this.startTime = startTime;
        this.endTime = endTime;
        this.startDate = startDate;
        this.endDate = endDate;
        this.location = location;
    }

    getTerms(): number[] {
        return this.terms;
    }

    getDays(): string[] {
        return this.days;
    }

    getStartTime(): string {
        return this.startTime;
    }

    getEndTime(): string {
        return this.endTime;
    }

    getStartDate(): string | undefined {
        return this.startDate;
    }

    getEndDate(): string | undefined {
        return this.endDate;
    }

    getLocation(): string | undefined {
        return this.location;
    }

    exportToJSON(): any {
        return {
            terms: this.terms,
            days: this.days,
            startTime: this.startTime,
            endTime: this.endTime,
            startDate: this.startDate,
            endDate: this.endDate,
            location: this.location
        }
    }

    static getSectionDetailFromJSON(data: any, version?: string): SectionDetail {
        let startDate: string | undefined;
        let endDate: string | undefined;
        let terms: number[] = [];

        if (version === "2.0.1") {
            [startDate, endDate] = data.dateRange.split(" - ");
            terms = [data.term];
        } else {
            startDate = data.startDate;
            endDate = data.endDate;
            terms = data.terms;
        }

        return new SectionDetail(
            terms,
            data.days,
            data.startTime,
            data.endTime,
            startDate,
            endDate,
            data.location
        )
    }
}
