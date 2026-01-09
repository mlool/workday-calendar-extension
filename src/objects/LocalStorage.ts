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
}
