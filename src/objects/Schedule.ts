import { SECTION_COLORS } from "../content/theme";
import Section, { SectionSchedule } from "./Section";

export default class Schedule {
    private static currVersion = "3.0.0";

    private version: string;
    private data: Section[];

    constructor(version: string = Schedule.currVersion, data: Section[] = []) {
        this.version = version;
        this.data = data;
    }

    // Return a new class for React Hooks
    addSection(section: Section): Schedule {
        section.setColor(this.getCourseColor(section.getWorklistNumber(), section.getCode()));
        return new Schedule(this.version, [...this.data, section]);
    }

    removeSection(worklistNumber: number, sectionId: string): Schedule {
        return new Schedule(
            this.version,
            this.data.filter(
                (section: Section) => {
                    if (section.getWorklistNumber() !== worklistNumber) return true;
                    if (section.getCourseID() !== sectionId) return true;
                    return false;
                }
            )
        );
    }

    updateSection(section: Section): Schedule {
        return new Schedule(
            this.version,
            this.data.map(
                (x: Section) =>
                    x.getWorklistNumber() === section.getWorklistNumber() &&
                        x.getCourseID() === section.getCourseID() ? section : x
            )
        );
    }

    getSections(): Section[] {
        return this.data;
    }

    getSectionSchedule(worklistNumber: number, session: string, term?: number[]): SectionSchedule[] {
        const schedules: SectionSchedule[] = [];
        this.data.forEach((section: Section) => {
            if (section.getWorklistNumber() !== worklistNumber) return;
            if (section.getSession() !== session) return;

            const sectionSchedules = section.getSectionSchedule(term);

            schedules.push(...sectionSchedules)
        });
        return schedules;
    }

    getConflictSections(newSection: Section): Section[] {
        const conflicts: Section[] = [];
        this.data.forEach((section: Section) => {
            if (section.getWorklistNumber() !== newSection.getWorklistNumber()) return;
            if (section.getSession() !== newSection.getSession()) return;

            const sectionSchedules = section.getSectionSchedule();
            const newSectionSchedules = newSection.getSectionSchedule();

            sectionSchedules.forEach((schedule: SectionSchedule) => {
                newSectionSchedules.forEach((newSchedule: SectionSchedule) => {
                    const termsMatch = schedule.terms.some((term: number) => newSchedule.terms.includes(term));
                    if (!termsMatch) return;
                    if (schedule.day.sort().join(",") !== newSchedule.day.sort().join(",")) return;
                    if (schedule.startTime !== newSchedule.startTime) return;
                    if (schedule.endTime !== newSchedule.endTime) return;
                    conflicts.push(section);
                });
            });
        });
        return conflicts;
    }

    // Gets all available sessions (2025W, etc) in the schedule
    getSessions(): string[] {
        const sessions = this.data.map((section: Section) => section.getSession());
        const uniqueSessions = [...new Set(sessions)];
        return uniqueSessions;
    }

    // Gets the latest session available in the schedule
    getLatestSession(): string {
        const sessions = this.getSessions();
        if (sessions.length === 0) return "2025W"
        const score = (s: string) => {
            const year = Number(s.slice(0, 4));
            const term = s[4]; // 'S' or 'W'
            const termRank = term === "W" ? 1 : 0; // W more recent than S
            return year * 10 + termRank;
        };

        return sessions.reduce((best, cur) => (score(cur) > score(best) ? cur : best));
    }

    // Gets all colors already used in the given worklist
    getColors(worklistNumber: number): string[] {
        let colors: string[] = [];
        this.data.forEach((section: Section) => {
            if (section.getWorklistNumber() !== worklistNumber) return;
            colors.push(section.getColor());
        })
        return colors;
    }

    // Returns the color associated with the given course code (CPSC_V 110) if such course already exist, else returns a new color
    getCourseColor(worklistNumber: number, courseCode: string): string {
        let courseColor = ""
        this.getSections().forEach((section) => {
            if (section.getWorklistNumber() !== worklistNumber) return;
            if (section.getCode() !== courseCode) return;
            courseColor = section.getColor();
        })
        if (courseColor !== "") return courseColor;

        const usedColors = this.getColors(worklistNumber);
        const colors = SECTION_COLORS.filter((color) => !usedColors.includes(color));
        if (colors.length == 0) return SECTION_COLORS[0];
        return colors[0];
    }

    clearSession(session: string): Schedule {
        return new Schedule(
            this.version,
            this.data.filter((section: Section) => section.getSession() !== session)
        );
    }

    clearWorklist(worklistNumber: number, session: string): Schedule {
        return new Schedule(
            this.version,
            this.data.filter((section: Section) => section.getWorklistNumber() !== worklistNumber && section.getSession() !== session)
        );
    }


    /*
    Chrome storage helpers
    */
    exportToJSON(): any {
        return {
            version: this.version,
            data: this.data.map((section: Section) => section.exportToJSON())
        }
    }

    importFromJSON(json: any): void {
        if (json.version == "2.0.1") {
            this.version = Schedule.currVersion;
        } else {
            this.version = json.version;
        }
        this.data = json.data;
    }

    async importFromChromeStorage(): Promise<Schedule> {
        const rawSections = (await chrome.storage.local.get("sections")).sections as
            | string
            | undefined;
        if (rawSections === undefined) {
            return new Schedule(Schedule.currVersion, []);
        }
        const sections = JSON.parse(rawSections)['data'];
        const version = JSON.parse(rawSections)['version'];
        const sectionObjects = sections.map((section: any) => Section.getSectionFromJSON(section, version));

        return new Schedule(Schedule.currVersion, sectionObjects);
    }

    async exportToChromeStorage(): Promise<void> {
        if (this.data.length == 0) {
            return;
        }
        await chrome.storage.local.set({ sections: JSON.stringify(this.exportToJSON()) });
    }
}
