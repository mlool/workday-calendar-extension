import { SECTION_COLORS } from "../content/theme";
import ExtensionEventChannel from "./ExtensionEventChannel";
import Schedule from "./Schedule";
import Section from "./Section";

// Provides a centralized interface for reading and writing persistent data
// using chrome.storage.local. This class acts as the single source of truth
// for all extension state that should persist across reloads and tabs.

// App.tsx contains listeners for changes to the this storage and the frontend
// components will be modified accordingly.
export default class ExtensionStorage {
  static async getCurrentTerm(): Promise<number> {
    const currentTerm = (await chrome.storage.local.get("currentTerm"))
      .currentTerm;
    if (currentTerm === undefined) return 1;
    return Number(currentTerm);
  }

  static async setCurrentTerm(term: number): Promise<void> {
    await chrome.storage.local.set({ currentTerm: term });
  }

  static async getCurrentSession(): Promise<string> {
    const currentSession = (await chrome.storage.local.get("currentSession"))
      .currentSession;
    if (currentSession === undefined) return "2025W";
    return currentSession;
  }

  static async setCurrentSession(session: string): Promise<void> {
    await chrome.storage.local.set({ currentSession: session });
  }

  static async getCurrentWorklistNumber(): Promise<number> {
    const currentWorklistNumber = (
      await chrome.storage.local.get("currentWorklistNumber")
    ).currentWorklistNumber;
    if (currentWorklistNumber === undefined) return 0;
    return Number(currentWorklistNumber);
  }

  static async setCurrentWorklistNumber(worklistNumber: number): Promise<void> {
    await chrome.storage.local.set({ currentWorklistNumber: worklistNumber });
  }

  // Schedule Operations
  static async getSchedule(): Promise<Schedule> {
    let rawSchedule = (await chrome.storage.local.get("schedule")).schedule as
      | string
      | undefined;

    if (rawSchedule === undefined) {
      // Double check if the old sections key exists from previous versions
      const rawSectionsOld = (await chrome.storage.local.get("sections"))
        .sections as string | undefined;

      if (rawSectionsOld === undefined) {
        return new Schedule(Schedule.getVersion(), []);
      }
      rawSchedule = rawSectionsOld;
    }

    const validJSON = JSON.parse(rawSchedule);
    const sections = validJSON["data"];
    const version = validJSON["version"];
    const id = validJSON["id"];

    // Specifically for handling old JSON files from exports from versions 2.x.x, to remove in 2027
    if (version === "2.0.1") {
      const failedCodes: string[] = [];
      const newSections: Section[] = [];
      ExtensionEventChannel.setIsLoading(
        true,
        `Importing Schedule from version ${version}`
      );
      ExtensionEventChannel.setLoadingProgress(0);
      const totalSections = sections.length;

      for (let i = 0; i < totalSections; i++) {
        const section = sections[i];
        // eslint-disable-next-line no-await-in-loop
        const newSection = await Section.getSectionFromOldJSON(section);
        ExtensionEventChannel.setLoadingProgress(
          ((i + 1) / totalSections) * 100
        );

        if (!newSection) {
          failedCodes.push(section["code"]);
          continue;
        }

        newSection.setColor(section.color ?? SECTION_COLORS[0]);
        newSection.setWorklistNumber(section.worklistNumber ?? 0);
        newSections.push(newSection);
      }

      ExtensionEventChannel.setIsLoading(false);
      if (failedCodes.length > 0) {
        console.error("Failed to import sections:", failedCodes);
      }
      await chrome.storage.local.remove("sections");
      return new Schedule(Schedule.getVersion(), newSections, id);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sectionObjects = sections.map((section: any) =>
      Section.getSectionFromJSON(section)
    );

    return new Schedule(Schedule.getVersion(), sectionObjects, id);
  }

  static async setSchedule(schedule: Schedule): Promise<void> {
    if (schedule.getSections().length === 0) return;
    await chrome.storage.local.set({
      schedule: JSON.stringify(schedule.exportToJSON()),
    });
  }

  // New Section
  static async getNewSection(): Promise<Section | null> {
    const newSection = (await chrome.storage.local.get("newSection"))
      .newSection as string | undefined;
    // null check is required since in previous version, newSection is set to null instead of removed
    if (newSection === undefined || newSection === "" || newSection === null)
      return null;
    return Section.getSectionFromJSON(JSON.parse(newSection));
  }

  static async setNewSection(newSection: Section | null): Promise<void> {
    if (newSection === null) {
      await chrome.storage.local.remove("newSection");
      return;
    }
    await chrome.storage.local.set({
      newSection: JSON.stringify(newSection.exportToJSON()),
    });
  }

  static async getIsAutoFillEnabled(): Promise<boolean> {
    const isAutoFillEnabled = (
      await chrome.storage.local.get("isAutoFillEnabled")
    ).isAutoFillEnabled;
    if (isAutoFillEnabled === undefined) return false;
    return Boolean(isAutoFillEnabled);
  }

  static async setIsAutoFillEnabled(isAutoFillEnabled: boolean): Promise<void> {
    await chrome.storage.local.set({ isAutoFillEnabled });
  }

  static async getIsConflictAddingEnabled(): Promise<boolean> {
    const isConflictAddingEnabled = (
      await chrome.storage.local.get("isConflictAddingEnabled")
    ).isConflictAddingEnabled;
    if (isConflictAddingEnabled === undefined) return false;
    return Boolean(isConflictAddingEnabled);
  }

  static async setIsConflictAddingEnabled(
    isConflictAddingEnabled: boolean
  ): Promise<void> {
    await chrome.storage.local.set({ isConflictAddingEnabled });
  }
}
