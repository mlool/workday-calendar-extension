import Schedule from "./Schedule";
import Section from "./Section";

export default class LocalStorage {
    static async getCurrentTerm(): Promise<number> {
        const currentTerm = (await chrome.storage.local.get("currentTerm")).currentTerm;
        if (currentTerm === undefined) return 1;
        return Number(currentTerm);
    }

    static async setCurrentTerm(term: number): Promise<void> {
        await chrome.storage.local.set({ currentTerm: term });
    }

    static async getCurrentSession(): Promise<string> {
        const currentSession = (await chrome.storage.local.get("currentSession")).currentSession;
        if (currentSession === undefined) return "2025W";
        return currentSession;
    }

    static async setCurrentSession(session: string): Promise<void> {
        await chrome.storage.local.set({ currentSession: session });
    }

    static async getCurrentWorklistNumber(): Promise<number> {
        const currentWorklistNumber = (await chrome.storage.local.get("currentWorklistNumber")).currentWorklistNumber;
        if (currentWorklistNumber === undefined) return 0;
        return Number(currentWorklistNumber);
    }

    static async setCurrentWorklistNumber(worklistNumber: number): Promise<void> {
        await chrome.storage.local.set({ currentWorklistNumber: worklistNumber });
    }

    // Schedule Operations
    static async getSchedule(): Promise<Schedule> {
        const rawSections = (await chrome.storage.local.get("sections")).sections as
            | string
            | undefined;
        if (rawSections === undefined) {
            return new Schedule(Schedule.getVersion(), []);
        }
        const sections = JSON.parse(rawSections)['data'];
        const version = JSON.parse(rawSections)['version'];
        const sectionObjects = sections.map((section: any) => Section.getSectionFromJSON(section, version));

        return new Schedule(Schedule.getVersion(), sectionObjects);
    }

    static async setSchedule(schedule: Schedule): Promise<void> {
        if (schedule.getSections().length === 0) return;
        await chrome.storage.local.set({ sections: JSON.stringify(schedule.exportToJSON()) });
    }

    // New Section
    static async getNewSection(): Promise<Section | null> {
        const newSection = (await chrome.storage.local.get("newSection")).newSection as
            | string
            | undefined;
        if (newSection === undefined) return null;
        return Section.getSectionFromJSON(JSON.parse(newSection));
    }

    static async setNewSection(newSection: Section | null): Promise<void> {
        if (newSection === null) {
            await chrome.storage.local.remove("newSection");
            return;
        }
        await chrome.storage.local.set({ newSection: JSON.stringify(newSection.exportToJSON()) });
    }
}
