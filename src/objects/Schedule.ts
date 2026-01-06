import Section, { SectionSchedule } from "./Section";

export default class Schedule {
    private static currVersion = "3.0.0";

    private version: string;
    private data: Section[];

    constructor(version: string = Schedule.currVersion, data: Section[] = []) {
        this.version = version;
        this.data = data;
    }

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

    // Return a new class for React Hooks
    addSection(section: Section): Schedule {
        return new Schedule(this.version, [...this.data, section]);
    }

    removeSection(section: Section): Schedule {
        return new Schedule(this.version, this.data.filter((x) => x !== section));
    }

    getSections(): Section[] {
        return this.data;
    }

    getSectionSchedule(worklistNumber: number, session: string): SectionSchedule[] {
        const schedules: SectionSchedule[] = [];
        this.data.forEach((section: Section) => {
            if (section.getWorklistNumber() !== worklistNumber) return;
            if (section.getSession() !== session) return;
            schedules.push(...section.getSectionSchedule())
        });
        return schedules;
    }
}
