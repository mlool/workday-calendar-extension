import Schedule from "../../../src/objects/Schedule";
import json1 from "./schedule_1.json";
import Section from "../../../src/objects/Section";
import SectionDetail from "../../../src/objects/SectionDetail";
import ExtensionStorage from "../../../src/objects/ExtensionStorage";
import { SECTION_COLORS } from "../../../src/content/theme";


jest.mock("../../../src/objects/ExtensionStorage", () => ({
    __esModule: true,
    default: {
        getIsConflictAddingEnabled: jest.fn().mockResolvedValue(true),
    },
}));


beforeEach(() => {
    jest.spyOn(console, "error").mockImplementation(() => { });
});

afterEach(() => {
    jest.restoreAllMocks();
});



global.alert = jest.fn();

describe("Schedule Tests", () => {
    test("testing constructor, get version, and get id", () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        expect(Schedule.getVersion()).toEqual("3.0.0");
        expect(schedule.getId()).toBe(id);
        expect(schedule.getSections()).toEqual([]);
    });

    test("testing addSection and get sections", async () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const sectionDetail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const sectionDSCI = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue", "Katie Burak"],
            [sectionDetail],
            "2025-26 Winter Term 2 (UBC-V)",
            1,
            "blue",
            "001",
            "Lecture",
            "Navigating Data: Acquisition, Exploration and Management",
            false
        );

        const scheduleCompared = await schedule.addSection(sectionDSCI);

        expect(scheduleCompared.getSections()).toEqual([sectionDSCI]);
    });

    test("bulk add sections", async () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const sectionDetail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const sectionDSCI = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue", "Katie Burak"],
            [sectionDetail],
            "2025-26 Winter Term 2 (UBC-V)",
            1,
            "blue",
            "001",
            "Lecture",
            "Navigating Data: Acquisition, Exploration and Management",
            false
        );

        const sections: Section[] = [];

        const newSchedule = new Schedule(Schedule.getVersion(), []);

        expect(schedule.bulkAddSections(sections)).toEqual({ newSchedule });

    });


    test("bulk add sections conflicting branch", async () => {
        // jest.spyOn(ExtensionStorage, "getIsConflictAddingEnabled")
        //     .mockResolvedValue(false);

        // const id = crypto.randomUUID();
        // const schedule = new Schedule("3.0.0", [], id);

        const sectionDetailDSCI = SectionDetail.getSectionDetailFromJSON(
            json1.data[1].sectionDetails[0],
            "2.0.1"
        );

        const sectionDSCI = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue", "Katie Burak"],
            [sectionDetailDSCI],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Navigating Data: Acquisition, Exploration and Management",
            false
        );

        const sectionDetailCPSC = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const section221 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetailCPSC],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Navigating Data: Acquisition, Exploration and Management",
            false
        );


        const sectionDetail213 = SectionDetail.getSectionDetailFromJSON(
            json1.data[2].sectionDetails[0], "2.0.1");

        const section213 = new Section(
            "CPSC_V 213",
            "14847",
            ["Jordon Johnson"],
            [sectionDetail213],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "#EAFFD1",
            "101",
            "Lecture + Lab",
            "Introductoion to Computer Systems",
            false
        );

        // const sections: Section[] = [sectionDSCI, section221];

        // const schedule = await schedule.addSection(section213);

        // const result = await schedule.bulkAddSections(sections);

        // expect(result).toEqual(schedule);


        jest.spyOn(ExtensionStorage, "getIsConflictAddingEnabled")
            .mockResolvedValue(false);

        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const scheduleWithSection = await schedule.addSection(section213);

        const result = await scheduleWithSection.bulkAddSections([sectionDSCI, section221]);

        expect(result).toEqual(scheduleWithSection);

    });


    test("remove sections", async () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const sectionDetail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const sectionDSCI = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue", "Katie Burak"],
            [sectionDetail],
            "2025-26 Winter Term 2 (UBC-V)",
            1,
            "blue",
            "001",
            "Lecture",
            "Navigating Data: Acquisition, Exploration and Management",
            false
        );

        const scheduleCompared = await schedule.addSection(sectionDSCI);

        expect(scheduleCompared.getSections()).toEqual([sectionDSCI]);



        const sectionDetailCPSC = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const section221 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetailCPSC],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Navigating Data: Acquisition, Exploration and Management",
            false
        );


        const scheduleAdded = await scheduleCompared.addSection(section221);
        expect(scheduleAdded.getSections()).toStrictEqual([sectionDSCI, section221]);

        const removed = scheduleAdded.removeSection(0, "445390");

        expect(removed.getSections()).toEqual([sectionDSCI]);

    });


    test("update sectioin", async () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const sectionDetail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const original = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetail],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Original Name",
            false
        );

        const updated = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetail],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "red",
            "001",
            "Lecture",
            "Updated Name",
            false
        );

        const withOriginal = await schedule.addSection(original);
        const withUpdated = withOriginal.updateSection(updated);

        expect(withUpdated.getSections()).toEqual([updated]);
    });

    test("get section schedule", () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const result = schedule.getSectionSchedule(0, "2025W");

        expect(result).toEqual([]);

    });

    test("get section returns matching", () => {
        const id = crypto.randomUUID();

        const sectionDetail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const section = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [sectionDetail],
            "2025W",
            0,
            "blue",
            "001",
            "Lecture",
            "Navigating Data",
            false
        );

        const schedule = new Schedule("3.0.0", [section], id);

        const result = schedule.getSectionSchedule(0, "2025W");

        expect(result.length).toBeGreaterThan(0);
        expect(result).toEqual(section.getSectionSchedule());
    });


    test("get section with different worklists and session", () => {
        const id = crypto.randomUUID();

        const sectionDetail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const section = new Section(
            "CPSC_V 110",
            "123456",
            ["Some Prof"],
            [sectionDetail],
            "2024W",
            1,
            "red",
            "101",
            "Lecture",
            "Intro to Programming",
            false
        );

        const schedule = new Schedule("3.0.0", [section], id);

        const result = schedule.getSectionSchedule(0, "2025W");

        expect(result).toEqual([]);
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
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const sectionDetail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const newSection = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [sectionDetail],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Navigating Data",
            false
        );

        const conflicts = schedule.getConflictSections(newSection);

        expect(conflicts).toEqual([]);
    });


    test("get conlict sections when sections overlap", async () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const sectionDetailCPSC = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const section121 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetailCPSC],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        const sectionDetailDSCI = SectionDetail.getSectionDetailFromJSON(
            json1.data[1].sectionDetails[0],
            "2.0.1"
        );

        const section200 = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [sectionDetailDSCI],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "red",
            "001",
            "Lecture",
            "Navigating Data",
            false
        );

        const scheduleWithOne = await schedule.addSection(section121);

        const conflicts = scheduleWithOne.getConflictSections(section200);

        expect(conflicts).toEqual([section121]);
    });


    test("get conflicts with multiple conflicts", async () => {
        const id = crypto.randomUUID();
        const schedule = new Schedule("3.0.0", [], id);

        const detail121 = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const detail200 = SectionDetail.getSectionDetailFromJSON(
            json1.data[1].sectionDetails[0],
            "2.0.1"
        );

        const cpsc121 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detail121],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        const dsci200 = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [detail200],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "red",
            "001",
            "Lecture",
            "Navigating Data",
            false
        );

        const scheduleWithTwo = await (await schedule.addSection(cpsc121)).addSection(dsci200);

        const conflicts = scheduleWithTwo.getConflictSections(cpsc121);

        expect(conflicts.length).toBeGreaterThan(0);
        expect(conflicts).toContain(dsci200);
    });

    test("get sections no section one and two", async () => {
        const id = crypto.randomUUID();
        let schedule = new Schedule("3.0.0", [], id);

        expect(schedule.getSessions()).toEqual([]);

        const sectionDetail2 = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const sectionsDetail3 = SectionDetail.getSectionDetailFromJSON(
            json1.data[1].sectionDetails[0],
            "2.0.1"
        );

        const sectionDetail$ = SectionDetail.getSectionDetailFromJSON(
            json1.data[2].sectionDetails[0],
            "2.0.1"
        );

        const sectionT2 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetail2],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        const sectionT3 = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [sectionsDetail3],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "red",
            "001",
            "Lecture",
            "Navigating Data",
            false
        );

        const sectionT1 = new Section(
            "CPSC_V 213",
            "14847",
            ["Jordon Johnson"],
            [sectionDetail$],
            "2025-26 Winter Term 1 (UBC-V)",
            0,
            "#EAFFD1",
            "101",
            "Lecture + Lab",
            "Intro to Computer Systems",
            false
        );

        schedule = await schedule.addSection(sectionT1);
        schedule = await schedule.addSection(sectionT2);
        schedule = await schedule.addSection(sectionT3);

        expect(schedule.getSessions()).toEqual([
            "2025-26 Winter Term 2 (UBC-V)",
            "2025-26 Winter Term 1 (UBC-V)"
        ]);
    });

    test("get latest session", async () => {

        const id = crypto.randomUUID();
        let schedule = new Schedule("3.0.0", [], id);

        expect(schedule.getLatestSession()).toBe("2025W");

        const detailW1 = SectionDetail.getSectionDetailFromJSON(
            json1.data[2].sectionDetails[0],
            "2.0.1"
        );

        const detailW2 = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const sectionW1 = new Section(
            "CPSC_V 213",
            "14847",
            ["Jordon Johnson"],
            [detailW1],
            "2025-26 Winter Term 1 (UBC-V)",
            0,
            "#EAFFD1",
            "101",
            "Lecture + Lab",
            "Intro to Computer Systems",
            false
        );

        const sectionW2 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detailW2],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        schedule = await schedule.addSection(sectionW1);
        schedule = await schedule.addSection(sectionW2);

        expect(schedule.getLatestSession()).toBe("2025-26 Winter Term 2 (UBC-V)");
    });


    test("get colors", async () => {

        const id = crypto.randomUUID();
        let schedule = new Schedule("3.0.0", [], id);

        expect(schedule.getColors("2025-26 Winter Term 2 (UBC-V)", 0)).toEqual([]);

        const detail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const section1 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detail],
            "2025-26 Winter Term 2 (UBC-V)",
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
            [detail],
            "2025-26 Winter Term 2 (UBC-V)",
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
            [detail],
            "2025-26 Winter Term 2 (UBC-V)",
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
            [detail],
            "2024W",
            0,
            "purple",
            "001",
            "Lecture",
            "Other Session",
            false
        );

        schedule = await schedule.addSection(section1);
        schedule = await schedule.addSection(section2);
        schedule = await schedule.addSection(sectionOtherWorklist);
        schedule = await schedule.addSection(sectionOtherSession);

        const colors = schedule.getColors("2025-26 Winter Term 2 (UBC-V)", 0);

        expect(colors).toEqual(["#fdd4dcff", "#AFEEEE"]);
    });


    test("get course color", async () => {
        const id = crypto.randomUUID();
        let schedule = new Schedule("3.0.0", [], id);

        const firstColor = SECTION_COLORS[0];
        expect(
            schedule.getCourseColor("2025-26 Winter Term 2 (UBC-V)", 0, "CPSC_V 110")
        ).toBe(firstColor);

        const detail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const section121 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detail],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        schedule = await schedule.addSection(section121);

        expect(
            schedule.getCourseColor("2025-26 Winter Term 2 (UBC-V)", 0, "CPSC_V 121")
        ).toBe("blue");

        const newColor = schedule.getCourseColor(
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "DSCI_V 200"
        );

        expect(newColor).not.toBe("blue");
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
        let schedule = new Schedule("3.0.0", [], id);

        const detail121 = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const detail213 = SectionDetail.getSectionDetailFromJSON(
            json1.data[2].sectionDetails[0],
            "2.0.1"
        );

        const section121 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detail121],
            "2025-26 Winter Term 2 (UBC-V)",
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
            [detail213],
            "2025-26 Winter Term 1 (UBC-V)",
            0,
            "#EAFFD1",
            "101",
            "Lecture + Lab",
            "Intro to Computer Systems",
            false
        );

        schedule = await schedule.addSection(section121);
        schedule = await schedule.addSection(section213);

        const cleared = schedule.clearSession("2025-26 Winter Term 2 (UBC-V)");

        expect(cleared.getSections()).toEqual([section213]);
    });


    test("clear worklist", async () => {
        const id = crypto.randomUUID();
        let schedule = new Schedule("3.0.0", [], id);

        const detail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const wl0Session = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detail],
            "2025-26 Winter Term 2 (UBC-V)",
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
            [detail],
            "2025-26 Winter Term 2 (UBC-V)",
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
            [detail],
            "2025-26 Winter Term 1 (UBC-V)",
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

        const cleared = schedule.clearWorklist(0, "2025-26 Winter Term 2 (UBC-V)");

        expect(cleared.getSections()).toEqual([wl1Session, wl0OtherSession]);
    });


    test("exportToJSON returns correct structure", async () => {
        const id = crypto.randomUUID();

        const sectionDetail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const section = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [sectionDetail],
            "2025-26 Winter Term 2 (UBC-V)",
            0,
            "blue",
            "001",
            "Lecture",
            "Models of Computation",
            false
        );

        const schedule = new Schedule("3.0.0", [section], id);

        const exported = schedule.exportToJSON();

        expect(exported).toEqual({
            version: "3.0.0",
            id,
            data: [section.exportToJSON()],
        });
    });

    test("importFromJSON upgrades version from 2.0.1", () => {
        const schedule = new Schedule("3.0.0", []);

        const fakeJSON = {
            version: "2.0.1",
            data: ["dummy data"],
        };

        schedule.importFromJSON(fakeJSON);

        expect(Schedule.getVersion()).toBe(Schedule.getVersion());
        expect(schedule.getSections()).toEqual(["dummy data"]);
    });

    test("importFromJSON keeps version when not 2.0.1", () => {
        const schedule = new Schedule("3.0.0", []);

        const fakeJSON = {
            version: "3.1.0",
            data: ["some data"],
        };

        schedule.importFromJSON(fakeJSON);

        expect(Schedule.getVersion()).toBe("3.0.0");
        expect(schedule.getSections()).toEqual(["some data"]);
    });


    test("getScheduleFromExternalJSON logs error when worklist provided without session", () => {
        const schedule = new Schedule("3.0.0", []);

        const result = schedule.getScheduleFromExternalJSON("{}", undefined, 0);

        expect(console.error).toHaveBeenCalledWith(
            "Invalid importJSON call: worklist provided without session"
        );
        expect(result).toBe(schedule);
    });

    test("getScheduleFromExternalJSON returns unchanged schedule on empty json", () => {
        const schedule = new Schedule("3.0.0", []);

        const result = schedule.getScheduleFromExternalJSON("");

        expect(result.getSections()).toEqual([]);
        expect(result).not.toBe(schedule);
    });


    test("getScheduleFromExternalJSON replaces entire schedule", () => {
        const json = JSON.stringify({
            version: "3.0.0",
            data: [json1.data[0]],
        });

        const schedule = new Schedule("3.0.0", []);

        const result = schedule.getScheduleFromExternalJSON(json);

        expect(result.getSections().length).toBe(1);
    });

    test("getScheduleFromExternalJSON replaces all worklists in a session", async () => {
        const detail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const existing = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detail],
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
            [detail],
            "2024W",
            0,
            "red",
            "001",
            "Lecture",
            "Keep",
            false
        );

        const schedule = new Schedule("3.0.0", [existing, otherSession]);

        const json = JSON.stringify({
            version: "3.0.0",
            data: [json1.data[1]],
        });

        const result = schedule.getScheduleFromExternalJSON(json, "2025W");

        expect(result.getSections().length).toBe(2);
        expect(
            result.getSections().some(s => s.getSession() === "2024W")
        ).toBe(true);
    });

    test("getScheduleFromExternalJSON replaces only specified worklist in session", () => {
        const detail = SectionDetail.getSectionDetailFromJSON(
            json1.data[0].sectionDetails[0],
            "2.0.1"
        );

        const wl0 = new Section(
            "CPSC_V 121",
            "445390",
            ["Jordon Johnson"],
            [detail],
            "2025W",
            0,
            "blue",
            "001",
            "Lecture",
            "WL0",
            false
        );

        const wl1 = new Section(
            "DSCI_V 200",
            "458199",
            ["Gabriela Cohen Freue"],
            [detail],
            "2025W",
            1,
            "red",
            "001",
            "Lecture",
            "WL1",
            false
        );

        const schedule = new Schedule("3.0.0", [wl0, wl1]);

        const json = JSON.stringify({
            version: "3.0.0",
            data: [json1.data[2]],
        });

        const result = schedule.getScheduleFromExternalJSON(json, "2025W", 0);

        expect(result.getSections().length).toBe(2);
        expect(
            result.getSections().some(s => s.getWorklistNumber() === 1)
        ).toBe(true);
    });

    test("getScheduleFromExternalJSON alerts and does not modify when no sections found", () => {
        const schedule = new Schedule("3.0.0", []);

        const json = JSON.stringify({
            version: "3.0.0",
            data: [],
        });

        const result = schedule.getScheduleFromExternalJSON(json);

        expect(global.alert).toHaveBeenCalled();
        expect(result.getSections()).toEqual([]);
    });






});
