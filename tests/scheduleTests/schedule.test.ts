import Schedule from "../../src/objects/Schedule";
import json1 from "./schedule_1.json";
import Section from "../../src/objects/Section";
import SectionDetail from "../../src/objects/SectionDetail";
import ExtensionStorage from "../../src/objects/ExtensionStorage";
import { SECTION_COLORS } from "../../src/content/theme";


jest.mock("../../src/objects/ExtensionStorage", () => ({
    __esModule: true,
    default: {
        getIsConflictAddingEnabled: jest.fn().mockResolvedValue(true),
    },
}));

let sectionDetail0: SectionDetail;
let sectionDetail1: SectionDetail;
let sectionDetail2: SectionDetail;

beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => { });
    (ExtensionStorage.getIsConflictAddingEnabled as jest.Mock).mockResolvedValue(true);
    sectionDetail0 = SectionDetail.getSectionDetailFromJSON(json1.data[0].sectionDetails[0]);
    sectionDetail1 = SectionDetail.getSectionDetailFromJSON(json1.data[1].sectionDetails[0]);
    sectionDetail2 = SectionDetail.getSectionDetailFromJSON(json1.data[2].sectionDetails[0]);
});

afterEach(() => {
    jest.restoreAllMocks();
});

global.alert = jest.fn();

describe("Schedule Tests", () => {
    test("testing constructor, get version, and get id", () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule(Schedule.getVersion(), [], id);

        expect(Schedule.getVersion()).toEqual(Schedule.getVersion());
        expect(schedule.getId()).toBe(id);
        expect(schedule.getSections()).toEqual([]);
    });

    test("testing addSection and get sections", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);
        const sectionDSCI = Section.getSectionFromJSON(json1.data[1]);
        sectionDSCI.setWorklistNumber(1);
        sectionDSCI.setColor("blue");
        const scheduleCompared = await schedule.addSection(sectionDSCI);
        expect(scheduleCompared.getSections()).toEqual([sectionDSCI]);
    });

    test("bulk add sections", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);
        const newSchedule = new Schedule(Schedule.getVersion(), []);
        const result = await schedule.bulkAddSections([]);
        expect(result.getSections()).toEqual(newSchedule.getSections());
    });


    test("bulk add sections conflicting branch", async () => {
        const sectionDSCI = Section.getSectionFromJSON(json1.data[1]);
        const section221 = Section.getSectionFromJSON(json1.data[0]);
        const section213 = Section.getSectionFromJSON(json1.data[2]);
        jest.spyOn(ExtensionStorage, "getIsConflictAddingEnabled").mockResolvedValue(false);
        const schedule = new Schedule(Schedule.getVersion(), []);
        const scheduleWithSection = await schedule.addSection(section213);
        const result = await scheduleWithSection.bulkAddSections([sectionDSCI, section221]);
        expect(result.getSections().length).toBe(3);
        expect(result.getSections()).toContain(section213);
        expect(result.getSections()).toContain(sectionDSCI);
        expect(result.getSections()).toContain(section221);
    });


    test("remove sections", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);
        const sectionDSCI = Section.getSectionFromJSON(json1.data[1]);
        sectionDSCI.setWorklistNumber(1);
        sectionDSCI.setColor("blue");
        const scheduleCompared = await schedule.addSection(sectionDSCI);
        expect(scheduleCompared.getSections()).toEqual([sectionDSCI]);
        const section221 = Section.getSectionFromJSON(json1.data[0]);
        const scheduleAdded = await scheduleCompared.addSection(section221);
        expect(scheduleAdded.getSections()).toStrictEqual([sectionDSCI, section221]);
        const removed = scheduleAdded.removeSection(0, "445390");
        expect(removed.getSections()).toEqual([sectionDSCI]);
    });


    test("update sectioin", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);
        const original = Section.getSectionFromJSON(json1.data[0]);
        const updated = new Section("CPSC_V 121", "445390", ["Jordon Johnson"], [sectionDetail0], "2025W", 0, "red", "001", "Lecture", "Updated Name", false);
        const withOriginal = await schedule.addSection(original);
        const withUpdated = withOriginal.updateSection(updated);
        expect(withUpdated.getSections()).toEqual([updated]);
    });

    test("get section schedule", () => {
        const schedule = new Schedule(Schedule.getVersion(), []);

        const result = schedule.getSectionSchedule(0, "2025W");

        expect(result).toEqual([]);

    });

    test("get section returns matching", () => {
        const section = new Section("DSCI_V 200", "458199", ["Gabriela Cohen Freue"], [sectionDetail0], "2025W", 0, "blue", "001", "Lecture", "Navigating Data", false);
        const schedule = new Schedule(Schedule.getVersion(), [section]);
        const result = schedule.getSectionSchedule(0, "2025W");
        expect(result.length).toBeGreaterThan(0);
        expect(result).toEqual(section.getSectionSchedule());
    });


    test("get section with different worklists and session", () => {
        const section = new Section("CPSC_V 110", "123456", ["Some Prof"], [sectionDetail0], "2024W", 1, "red", "101", "Lecture", "Intro to Programming", false);
        const schedule = new Schedule(Schedule.getVersion(), [section]);
        expect(schedule.getSectionSchedule(0, "2025W")).toEqual([]);
    });

    test("to minutes", () => {
        const schedule = new Schedule();

        expect(schedule.toMinutes("0:00")).toBe(0);
        expect(schedule.toMinutes("1:00")).toBe(60);
        expect(schedule.toMinutes("02:30")).toBe(150);
        expect(schedule.toMinutes("10:15")).toBe(10 * 60 + 15);
        expect(schedule.toMinutes("23:59")).toBe(23 * 60 + 59);
    });

    test("get conflict sections returns empty when no conflicts", () => {
        const schedule = new Schedule(Schedule.getVersion(), []);
        const newSection = Section.getSectionFromJSON(json1.data[1]);
        newSection.setColor("blue");
        expect(schedule.getConflictSections(newSection)).toEqual([]);
    });


    test("get conflict sections when sections overlap", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);
        const section121 = Section.getSectionFromJSON(json1.data[0]);
        const section200 = Section.getSectionFromJSON(json1.data[1]);
        section200.setColor("red");
        const scheduleWithOne = await schedule.addSection(section121);
        expect(scheduleWithOne.getConflictSections(section200)).toEqual([section121]);
    });


    test("get conflicts with multiple conflicts", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);
        const cpsc121 = Section.getSectionFromJSON(json1.data[0]);
        const dsci200 = Section.getSectionFromJSON(json1.data[1]);
        dsci200.setColor("red");
        const scheduleWithTwo = await (await schedule.addSection(cpsc121)).addSection(dsci200);
        const conflicts = scheduleWithTwo.getConflictSections(cpsc121);
        expect(conflicts.length).toBeGreaterThan(0);
        expect(conflicts).toContain(cpsc121);
    });

    test("get sections no section one and two", async () => {
        let schedule = new Schedule(Schedule.getVersion(), []);
        expect(schedule.getSessions()).toEqual([]);
        const sectionT1 = Section.getSectionFromJSON(json1.data[2]);
        const sectionT2 = Section.getSectionFromJSON(json1.data[0]);
        const sectionT3 = Section.getSectionFromJSON(json1.data[1]);
        sectionT3.setColor("red");
        schedule = await schedule.addSection(sectionT1);
        schedule = await schedule.addSection(sectionT2);
        schedule = await schedule.addSection(sectionT3);
        expect(schedule.getSessions()).toEqual(["2025W"]);
    });

    test("get latest session", async () => {
        let schedule = new Schedule(Schedule.getVersion(), [], crypto.randomUUID());
        expect(schedule.getLatestSession()).toBe("2025W");
        const sectionW1 = Section.getSectionFromJSON(json1.data[2]);
        const sectionW2 = Section.getSectionFromJSON(json1.data[0]);
        schedule = await schedule.addSection(sectionW1);
        schedule = await schedule.addSection(sectionW2);
        expect(schedule.getLatestSession()).toBe("2025W");
    });


    test("get colors", async () => {

        const id = crypto.randomUUID();
        let schedule = new Schedule(Schedule.getVersion(), [], id);

        expect(schedule.getColors("2025W", 0)).toEqual([]);

        const detailForColors = SectionDetail.getSectionDetailFromJSON(json1.data[0].sectionDetails[0]);
        const section1 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detailForColors],
            "2025W",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        const section2 = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [detailForColors],
            "2025W",
            0,
            "red",
            "001",
            "Lecture",
            "Navigating Data",
            false
        );

        const sectionOtherWorklist = new Section(
            "CPSC_V 213",
            "14847",
            ["Jordon Johnson"],
            [detailForColors],
            "2025W",
            1,
            "green",
            "101",
            "Lecture + Lab",
            "Intro to Computer Systems",
            false
        );

        const sectionOtherSession = new Section(
            "TEST_V 100",
            "999999",
            ["Test"],
            [detailForColors],
            "2024W",
            0,
            "purple",
            "001",
            "Lecture",
            "Other Session",
            false
        );

        section1.setColor(SECTION_COLORS[0]);
        section2.setColor(SECTION_COLORS[1]);
        schedule = new Schedule(Schedule.getVersion(), [section1, section2, sectionOtherWorklist, sectionOtherSession], id);

        const colors = schedule.getColors("2025W", 0);
        expect(colors).toEqual([SECTION_COLORS[0], SECTION_COLORS[1]]);
    });


    test("get course color", async () => {
        const id = crypto.randomUUID();
        let schedule = new Schedule(Schedule.getVersion(), [], id);

        const firstColor = SECTION_COLORS[0];
        expect(
            schedule.getCourseColor("2025W", 0, "CPSC_V 110")
        ).toBe(firstColor);

        const detailForCourseColor = SectionDetail.getSectionDetailFromJSON(json1.data[0].sectionDetails[0]);
        const section121 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detailForCourseColor],
            "2025W",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        schedule = await schedule.addSection(section121);

        expect(
            schedule.getCourseColor("2025W", 0, "CPSC_V 121")
        ).toBe(firstColor);

        const newColor = schedule.getCourseColor(
            "2025W",
            0,
            "DSCI_V 200"
        );

        expect(newColor).not.toBe(firstColor);
        expect(SECTION_COLORS).toContain(newColor);

        const otherSessionColor = schedule.getCourseColor(
            "2024W",
            1,
            "CPSC_V 110"
        );

        expect(otherSessionColor).toBe(SECTION_COLORS[0]);
    });

    test("clear session", async () => {
        const id = crypto.randomUUID();
        let schedule = new Schedule(Schedule.getVersion(), [], id);

        const section121 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetail0],
            "2025W",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        const section213 = new Section(
            "CPSC_V 213",
            "14847",
            ["Jordon Johnson"],
            [sectionDetail2],
            "2025W",
            0,
            "#EAFFD1",
            "101",
            "Lecture + Lab",
            "Intro to Computer Systems",
            false
        );

        schedule = await schedule.addSection(section121);
        schedule = await schedule.addSection(section213);

        const cleared = schedule.clearSession("2025W");

        expect(cleared.getSections()).toEqual([]);
    });


    test("clear worklist", async () => {
        const id = crypto.randomUUID();
        let schedule = new Schedule(Schedule.getVersion(), [], id);

        const wl0Session = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetail0],
            "2025W",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        const wl1Session = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [sectionDetail0],
            "2025W",
            1,
            "red",
            "001",
            "Lecture",
            "Navigating Data",
            false
        );

        const wl0OtherSession = new Section(
            "CPSC_V 213",
            "14847",
            ["Jordon Johnson"],
            [sectionDetail0],
            "2025W",
            0,
            "#EAFFD1",
            "101",
            "Lecture + Lab",
            "Intro to Computer Systems",
            false
        );

        schedule = await schedule.addSection(wl0Session);
        schedule = await schedule.addSection(wl1Session);
        schedule = await schedule.addSection(wl0OtherSession);

        const cleared = schedule.clearWorklist(0, "2025W");

        expect(cleared.getSections()).toEqual([wl1Session]);
    });


    test("exportToJSON returns correct structure", async () => {
        const id = crypto.randomUUID();

        const section = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetail0],
            "2025W",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        const schedule = new Schedule(Schedule.getVersion(), [section], id);

        const exported = schedule.exportToJSON();

        expect(exported).toEqual({
            version: Schedule.getVersion(),
            id,
            data: [section.exportToJSON()],
        });
    });

    test("importFromJSON upgrades version from 2.0.1", () => {
        const schedule = new Schedule(Schedule.getVersion(), []);

        const fakeJSON = {
            version: "2.0.1",
            data: ["dummy data"],
        };

        schedule.importFromJSON(fakeJSON);

        expect(Schedule.getVersion()).toBe(Schedule.getVersion());
        expect(schedule.getSections()).toEqual(["dummy data"]);
    });

    test("importFromJSON keeps version when not 2.0.1", () => {
        const schedule = new Schedule(Schedule.getVersion(), []);

        const fakeJSON = {
            version: "3.1.0",
            data: ["some data"],
        };

        schedule.importFromJSON(fakeJSON);

        expect(Schedule.getVersion()).toBe(Schedule.getVersion());
        expect(schedule.getSections()).toEqual(["some data"]);
    });


    test("getScheduleFromExternalJSON logs error when worklist provided without session", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);

        const result = await schedule.getScheduleFromExternalJSON("{}", undefined, 1);

        expect(console.error).toHaveBeenCalledWith(
            "Invalid importJSON call: worklist provided without session"
        );
        expect(result).toBe(schedule);
    });

    test("getScheduleFromExternalJSON returns unchanged schedule on empty json", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);

        const result = await schedule.getScheduleFromExternalJSON("");

        expect(result.getSections()).toEqual([]);
        expect(result).not.toBe(schedule);
    });


    test("getScheduleFromExternalJSON replaces entire schedule", async () => {
        const json = JSON.stringify({
            version: Schedule.getVersion(),
            data: [json1.data[0]],
        });

        const schedule = new Schedule(Schedule.getVersion(), []);

        const result = await schedule.getScheduleFromExternalJSON(json);

        expect(result.getSections().length).toBe(1);
    });

    test("getScheduleFromExternalJSON replaces all worklists in a session", async () => {
        const existing = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetail0],
            "2025W",
            0,
            "blue",
            "001",
            "Lecture",
            "Old",
            false
        );

        const otherSession = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [sectionDetail0],
            "2024W",
            0,
            "red",
            "001",
            "Lecture",
            "Keep",
            false
        );

        const schedule = new Schedule(Schedule.getVersion(), [existing, otherSession]);

        const json = JSON.stringify({
            version: Schedule.getVersion(),
            data: [json1.data[1]],
        });

        const result = await schedule.getScheduleFromExternalJSON(json, "2025W");

        expect(result.getSections().length).toBe(2);
        expect(
            result.getSections().some(s => s.getSession() === "2024W")
        ).toBe(true);
    });

    test("getScheduleFromExternalJSON replaces only specified worklist in session", async () => {
        const detail = SectionDetail.getSectionDetailFromJSON(json1.data[0].sectionDetails[0]);
        const wl0 = new Section("CPSC_V 121", "445390", ["Jordon Johnson"], [detail], "2025W", 0, "blue", "001", "Lecture", "WL0", false);
        const wl1 = new Section("DSCI_V 200", "458199", ["Gabriela Cohen Freue"], [detail], "2025W", 1, "red", "001", "Lecture", "WL1", false);
        const schedule = new Schedule(Schedule.getVersion(), [wl0, wl1]);

        const json = JSON.stringify({
            version: Schedule.getVersion(),
            data: [json1.data[2]],
        });
        const result = await schedule.getScheduleFromExternalJSON(json, "2025W", 1);

        expect(result.getSections().length).toBe(2);
        expect(
            result.getSections().some(s => s.getWorklistNumber() === 0)
        ).toBe(true);
    });

    test("getScheduleFromExternalJSON throws error and does not modify when no sections found", async () => {
        const schedule = new Schedule(Schedule.getVersion(), []);

        const json = JSON.stringify({
            version: Schedule.getVersion(),
            data: [],
        });

        await expect(schedule.getScheduleFromExternalJSON(json)).rejects.toThrow(
            "No sections found in the imported JSON file. To avoid accidental deletions, the schedule was not modified, if this is intentional, please manually delete your worklists."
        );
    });

});
