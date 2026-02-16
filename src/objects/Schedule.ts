import { SECTION_COLORS } from "../content/theme";
import ExtensionEventChannel from "./ExtensionEventChannel";
import ExtensionStorage from "./ExtensionStorage";
import Section, { SectionSchedule } from "./Section";

export default class Schedule {
  private static currVersion = "3.0.0";

  private version: string;
  private data: Section[];
  private id: string; // id generated to check if schedule has changed

  constructor(
    version: string = Schedule.currVersion,
    data: Section[] = [],
    id: string = crypto.randomUUID()
  ) {
    this.version = version;
    this.data = data;
    this.id = id;
  }

  static getVersion(): string {
    return Schedule.currVersion;
  }

  getId(): string {
    return this.id;
  }

  // Return a new class for React Hooks
  async addSection(section: Section): Promise<Schedule> {
    const isConflictAddingEnabled =
      await ExtensionStorage.getIsConflictAddingEnabled();
    if (
      !isConflictAddingEnabled &&
      this.getConflictSections(section).length > 0
    ) {
      throw new Error(
        "This section conflicts with your current schedule. Please resolve the conflict before adding it. To add it anyway, turn on Conflict Adding in Settings."
      );
    }
    section.setColor(
      this.getCourseColor(
        section.getSession(),
        section.getWorklistNumber(),
        section.getCode()
      )
    );
    return new Schedule(this.version, [...this.data, section]);
  }

  async bulkAddSections(sections: Section[]): Promise<Schedule> {
    const isConflictAddingEnabled =
      await ExtensionStorage.getIsConflictAddingEnabled();
    if (sections.length === 0) return new Schedule(this.version, this.data);

    const existingColors = this.getColors(
      sections[0].getSession(),
      sections[0].getWorklistNumber()
    );
    const availableColors = SECTION_COLORS.filter(
      (color) => !existingColors.includes(color)
    );

    sections.forEach((section: Section) => {
      if (
        !isConflictAddingEnabled &&
        this.getConflictSections(section).length > 0
      ) {
        throw new Error(
          "One or more sections conflict with your current schedule. Please resolve the conflict before adding it. To add it anyway, turn on Conflict Adding in Settings."
        );
      }
      section.setColor(availableColors.shift() || SECTION_COLORS[0]);
    });
    return new Schedule(this.version, [...this.data, ...sections]);
  }

  removeSection(worklistNumber: number, sectionId: string): Schedule {
    return new Schedule(
      this.version,
      this.data.filter((section: Section) => {
        if (section.getWorklistNumber() !== worklistNumber) return true;
        if (section.getCourseID() !== sectionId) return true;
        return false;
      })
    );
  }

  updateSection(section: Section): Schedule {
    return new Schedule(
      this.version,
      this.data.map((x: Section) =>
        x.getWorklistNumber() === section.getWorklistNumber() &&
        x.getCourseID() === section.getCourseID()
          ? section
          : x
      )
    );
  }

  getSections(): Section[] {
    return this.data;
  }

  getSectionSchedule(
    worklistNumber: number,
    session: string,
    term?: number[]
  ): SectionSchedule[] {
    const schedules: SectionSchedule[] = [];
    this.data.forEach((section: Section) => {
      if (section.getWorklistNumber() !== worklistNumber) return;
      if (section.getSession() !== session) return;

      const sectionSchedules = section.getSectionSchedule(term);

      schedules.push(...sectionSchedules);
    });
    return schedules;
  }

  // This is used for comparing times since sometimes the time contains 0 and sometimes not, eg: 09:00 and 9:00
  toMinutes(t: string) {
    const [hStr, mStr] = t.split(":");
    const h = Number(hStr);
    const m = Number(mStr);
    return h * 60 + m;
  }

  getConflictSections(newSection: Section): Section[] {
    const conflicts: Section[] = [];
    this.data.forEach((section: Section) => {
      if (section.getWorklistNumber() !== newSection.getWorklistNumber())
        return;
      if (section.getSession() !== newSection.getSession()) return;

      const sectionSchedules = section.getSectionSchedule();
      const newSectionSchedules = newSection.getSectionSchedule();

      sectionSchedules.forEach((schedule: SectionSchedule) => {
        newSectionSchedules.forEach((newSchedule: SectionSchedule) => {
          const termsMatch = schedule.terms.some((term: number) =>
            newSchedule.terms.includes(term)
          );
          if (!termsMatch) return;
          if (!schedule.day.some((day) => newSchedule.day.includes(day)))
            return;
          if (
            this.toMinutes(schedule.startTime) >=
            this.toMinutes(newSchedule.endTime)
          )
            return;
          if (
            this.toMinutes(newSchedule.startTime) >=
            this.toMinutes(schedule.endTime)
          )
            return;
          conflicts.push(section);
        });
      });
    });
    return conflicts;
  }

  // Gets all available sessions (2025W, etc) in the schedule
  getSessions(): string[] {
    const sessions = this.data.map((section: Section) => section.getSession());
    const uniqueSessions = [...new Set(sessions)].sort().reverse();
    return uniqueSessions;
  }

  // Gets the latest session available in the schedule
  getLatestSession(): string {
    const sessions = this.getSessions();
    if (sessions.length === 0) return "2025W";
    const score = (s: string) => {
      const year = Number(s.slice(0, 4));
      const term = s[4]; // 'S' or 'W'
      const termRank = term === "W" ? 1 : 0; // 2025W more recent than 2025S
      return year * 10 + termRank;
    };

    return sessions.reduce((best, cur) =>
      score(cur) > score(best) ? cur : best
    );
  }

  // Gets all colors already used in the given worklist
  getColors(session: string, worklistNumber: number): string[] {
    const colors: string[] = [];
    this.data.forEach((section: Section) => {
      if (section.getSession() !== session) return;
      if (section.getWorklistNumber() !== worklistNumber) return;
      colors.push(section.getColor());
    });
    return colors;
  }

  // Returns the color associated with the given course code (CPSC_V 110) if such course already exist, else returns a new color
  getCourseColor(
    session: string,
    worklistNumber: number,
    courseCode: string
  ): string {
    let courseColor = "";
    this.getSections().forEach((section) => {
      if (section.getSession() !== session) return;
      if (section.getWorklistNumber() !== worklistNumber) return;
      if (section.getCode() !== courseCode) return;
      courseColor = section.getColor();
    });
    if (courseColor !== "") return courseColor;

    const usedColors = this.getColors(session, worklistNumber);
    const colors = SECTION_COLORS.filter(
      (color) => !usedColors.includes(color)
    );
    if (colors.length === 0) return SECTION_COLORS[0];
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
      this.data.filter((section: Section) => {
        if (
          section.getWorklistNumber() === worklistNumber &&
          section.getSession() === session
        )
          return false;
        return true;
      })
    );
  }

  /*
      Chrome storage helpers
      */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  exportToJSON(): any {
    return {
      version: this.version,
      id: this.id,
      data: this.data.map((section: Section) => section.exportToJSON()),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  importFromJSON(json: any): void {
    if (json.version === "2.0.1") {
      this.version = Schedule.currVersion;
    } else {
      this.version = json.version;
    }
    this.data = json.data;
  }

  // Export Import JSON functionality

  /*
       Download JSON file, if worklistNum and Session is null, download the entire schedule
       If only session is provided, download all worklists for that session
       If only worklistNum is provided, it is invalid.
       */
  downloadScheduleAsJSON(worklist?: number, session?: string): void {
    if (worklist !== undefined && !session) {
      console.error(
        "Invalid downloadJSON call: worklist provided without session"
      );
      return;
    }
    let jsonName = "";
    const selectedSections = this.data.filter((section: Section) => {
      if (worklist !== undefined && session) {
        jsonName = `schedule-${worklist}-${session}.json`;
        return (
          section.getWorklistNumber() === worklist &&
          section.getSession() === session
        );
      } else if (session) {
        jsonName = `schedule-${session}.json`;
        return section.getSession() === session;
      }
      jsonName = `schedule.json`;
      return true;
    });
    const json = {
      version: this.version,
      data: selectedSections.map((section: Section) => section.exportToJSON()),
    };
    const blob = new Blob([JSON.stringify(json)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = jsonName;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Used to importing schedule/worklist from external JSON file
  // Note it will replace existing sections in the specified session and worklist
  // If session and worklist are not specified, it will replace the entire schedule
  async getScheduleFromExternalJSON(
    json: string,
    session?: string,
    worklist?: number
  ): Promise<Schedule> {
    if (worklist && !session) {
      console.error(
        "Invalid importJSON call: worklist provided without session"
      );
      return this;
    }
    // if json is empty, return current schedule
    if (!json || json === "") return new Schedule(this.version, this.data);

    const rawData = JSON.parse(json);
    const version = rawData["version"];
    const data = rawData["data"];
    let newSections: Section[] = [];
    const failedCodes: string[] = [];

    // Specifically for handling old JSON files from exports from versions 2.x.x, to remove in 2027
    if (version === "2.0.1") {
      ExtensionEventChannel.setIsLoading(
        true,
        `Importing Schedule from version ${version}`
      );
      ExtensionEventChannel.setLoadingProgress(0);
      const totalSections = data.length;

      for (let i = 0; i < totalSections; i++) {
        const section = data[i];
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
        newSections.push(newSection);
      }

      ExtensionEventChannel.setIsLoading(false);
    } else {
      newSections =
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.map((section: any) => {
          const newSection = Section.getSectionFromJSON(section);
          if (worklist) newSection.setWorklistNumber(worklist);
          return newSection;
        }) ?? [];
    }

    if (newSections.length === 0) {
      throw new Error(
        "No sections found in the imported JSON file. To avoid accidental deletions, the schedule was not modified, if this is intentional, please manually delete your worklists."
      );
    }

    if (failedCodes.length > 0) {
      console.error("Failed to import sections:", failedCodes);
    }

    this.data.forEach((section: Section) => {
      if (
        session &&
        worklist &&
        (section.getWorklistNumber() !== worklist ||
          section.getSession() !== session)
      ) {
        // If both session and worklist are specified, only add existing sections that does not match the specified session and worklist
        // Meaning loaded schedule replaces all sections in the specified session and worklist.
        newSections.push(section);
      } else if (session && section.getSession() !== session) {
        // If only session is specified, only add existing sections that does not match the specified session.
        // Meaning loaded schedule replaces all sections across all worklists in the specified session.
        newSections.push(section);
      }
      // If neither session or worklist is specified, do not add any existing sections,
      // meaning the entire schedule across all sessions and worklists is replaced.
    });

    return new Schedule(this.version, newSections);
  }
}
