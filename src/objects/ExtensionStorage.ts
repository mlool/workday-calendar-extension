import Schedule from "./Schedule";
import Section from "./Section";


// Provides a centralized interface for reading and writing persistent data
// using chrome.storage.local. This class acts as the single source of truth
// for all extension state that should persist across reloads and tabs.

// App.tsx contains listeners for changes to the this storage and the frontend
// components will be modified accordingly.
export default class ExtensionStorage {
    static async getCurrentTerm(): Promise<number> {
        const currentTerm = (await chrome.storage.local.get("currentTerm")).currentTerm;
        if (currentTerm === undefined) return 1;
        return Number(currentTerm);
    }

    static async setCurrentTerm(term: number): Promise<void> {
        await chrome.storage.local.set({ currentTerm: term });
    }

    static async getCurrentSession(): Promise<string> {
        console.log((await chrome.storage.local.get("currentSession")))
        const currentSession = (await chrome.storage.local.get("currentSession")).currentSession;
        if (currentSession === undefined) return "2025W";
        return currentSession;
    }

    static async setCurrentSession(session: string): Promise<void> {
        console.log("Setting current session to: " + session)
        await chrome.storage.local.set({ currentSession: session });
        console.log((await chrome.storage.local.get("currentSession")))
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
        const rawSchedule = (await chrome.storage.local.get("schedule")).schedule as
            | string
            | undefined;
        if (rawSchedule === undefined) {
            return new Schedule(Schedule.getVersion(), []);
        }
        const validJSON = JSON.parse(rawSchedule);
        const sections = validJSON['data'];
        const version = validJSON['version'];
        const id = validJSON['id'];
        const sectionObjects = sections.map((section: any) => Section.getSectionFromJSON(section, version));

        return new Schedule(Schedule.getVersion(), sectionObjects, id);
    }

    static async setSchedule(schedule: Schedule): Promise<void> {
        if (schedule.getSections().length === 0) return;
        await chrome.storage.local.set({ schedule: JSON.stringify(schedule.exportToJSON()) });
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

    static async getIsAutoFillEnabled(): Promise<boolean> {
        const isAutoFillEnabled = (await chrome.storage.local.get("isAutoFillEnabled")).isAutoFillEnabled;
        if (isAutoFillEnabled === undefined) return false;
        return Boolean(isAutoFillEnabled);
    }

    static async setIsAutoFillEnabled(isAutoFillEnabled: boolean): Promise<void> {
        await chrome.storage.local.set({ isAutoFillEnabled });
    }

    static async getIsConflictAddingEnabled(): Promise<boolean> {
        const isConflictAddingEnabled = (await chrome.storage.local.get("isConflictAddingEnabled")).isConflictAddingEnabled;
        if (isConflictAddingEnabled === undefined) return false;
        return Boolean(isConflictAddingEnabled);
    }

    static async setIsConflictAddingEnabled(isConflictAddingEnabled: boolean): Promise<void> {
        await chrome.storage.local.set({ isConflictAddingEnabled });
    }
}
