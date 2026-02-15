import Section from "../../src/objects/Section";
import SectionDetail from "../../src/objects/SectionDetail";
import sectionData from "./schedule_1.json";

const VER = "2.0.1";
const DSCI = "Navigating Data: Acquisition, Exploration and Management";

describe("Section tests", () => {
    let sectionDetail: SectionDetail;
    let section: Section;

    beforeEach(() => {
        sectionDetail = SectionDetail.getSectionDetailFromJSON(sectionData.data[0].sectionDetails[0], VER);
        section = new Section("DSCI_V 200", "458199", ["Gabriela Cohen Freue", "Katie Burak"], [sectionDetail], "2025-26 Winter Term 2 (UBC-V)", 1, "blue", "001", "Lecture", DSCI, false);
    });

    test("constructor tests with getters and set worklist and color", () => {
        expect(section.getCode()).toBe("DSCI_V 200");
        expect(section.getCourseID()).toBe("458199");
        expect(section.getInstructors()).toStrictEqual([
            "Gabriela Cohen Freue",
            "Katie Burak"
        ]);
        expect(section.getSectionDetails()).toEqual([sectionDetail]);
        expect(section.getSession()).toBe("2025-26 Winter Term 2 (UBC-V)");
        expect(section.getWorklistNumber()).toBe(1);
        expect(section.getColor()).toBe("blue");
        expect(section.getSectionCode()).toBe("001");
        expect(section.getFormat()).toBe("Lecture");
        expect(section.getName()).toBe(DSCI);
        expect(section.getIsCustom()).toBe(false);
        const terms = new Set<number>;
        terms.add(2);
        expect(section.getTerms()).toEqual(terms);

        const sectionCompared = Section.getSectionFromJSON(sectionData.data[0], VER);
        expect(sectionCompared.getCode()).toBe(section.getCode());
        expect(sectionCompared.getCourseID()).toBe("458199");
        expect(sectionCompared.getSectionDetails().length).toBeGreaterThan(0);


        section.setWorklistNumber(2);
        expect(section.getWorklistNumber()).toBe(2);

        section.setColor("red");
        expect(section.getColor()).toBe("red");
    });





    test("getting terms offered and testing chrome storage interactions", () => {
        expect(section.getTerms().has(2)).toBe(true);

        expect(section.getLocations()).toStrictEqual(["Brock Commons South (BRCS) - Room 2070"]);

        expect(section.getSectionLink()).toStrictEqual("https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$458199.htmld");

    });


    test("getTerms aggregates unique terms across multiple sectionDetails", () => {
        const sd1 = SectionDetail.getSectionDetailFromJSON({ term: 1, days: ["Tue"], startTime: "10:00", endTime: "11:00", dateRange: "A", location: "Loc A" }, VER);
        const sd2 = SectionDetail.getSectionDetailFromJSON({ term: 2, days: ["Wed"], startTime: "12:00", endTime: "13:00", dateRange: "B", location: "Loc B" }, VER);
        const section = new Section("TEST", "1", [], [sd1, sd2], "Session", 0, "blue", "001", "Lecture", "Test", false);

        const terms = section.getTerms();
        expect(terms.has(1)).toBe(true);
        expect(terms.has(2)).toBe(true);
        expect(terms.size).toBe(2);
    });


    test("getLocations returns unique locations only", () => {
        const sectionWithDupDetails = new Section("DSCI_V 200", "458199", [], [sectionDetail, sectionDetail], "Session", 0, "blue", "001", "Lecture", "Test", false);
        expect(sectionWithDupDetails.getLocations()).toStrictEqual([
            "Brock Commons South (BRCS) - Room 2070"
        ]);
    });


    test("getSectionLink returns empty string for custom section", () => {
        const noTerm = section.getSectionSchedule();
        expect(noTerm).toHaveLength(1);

        const emptyTerm = section.getSectionSchedule([]);
        expect(emptyTerm).toHaveLength(1);

        const matchingTerm = section.getSectionSchedule([2]);
        expect(matchingTerm).toHaveLength(1);

        const nonMatchingTerm = section.getSectionSchedule([1]);
        expect(nonMatchingTerm).toEqual([]);
    });

    test("get section schedule test", () => {
        const schedules = section.getSectionSchedule();
        expect(schedules).toHaveLength(1);
        expect(schedules[0]).toEqual({
            day: ["Mon", "Wed"],
            startTime: "09:00",
            endTime: "10:30",
            terms: [2],
            color: "blue",
            section
        });
    });

    test("testing get historical grades first with custom course then without", async () => {
        const sectionCustom = new Section("DSCI_V 200", "458199", ["Gabriela Cohen Freue", "Katie Burak"], [sectionDetail], "2025-26 Winter Term 2 (UBC-V)", 1, "blue", "001", "Lecture", DSCI, true);

        const gradesCustom = await sectionCustom.getHistoricalGrades();

        expect(gradesCustom).toEqual({ average: null, averageFiveYears: null });

        // MOCK FETCH FOR NON-CUSTOM COURSE
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                average: "78.5",
                average_past_5_yrs: "76.2"
            })
        } as any);


        const sectionTest2 = Section.getSectionFromJSON(sectionData.data[1], VER);

        const gradesCustom2 = await sectionTest2.getHistoricalGrades();

        expect(gradesCustom2).toEqual({
            average: 78.5,
            averageFiveYears: 76.2
        });
    });

    test("test for get historical grade not custom but invalid info or link", async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false
        } as any);

        const gradesCustom = await section.getHistoricalGrades();

        expect(gradesCustom).toEqual({ average: null, averageFiveYears: null });
    });

    test("historical grades test for full coverage", async () => {
        global.fetch = jest.fn().mockResolvedValue({ ok: true, json: async () => ({ average: "", average_past_5_yrs: "" }) } as any);
        const sectionDetail = SectionDetail.getSectionDetailFromJSON({ term: 1, days: ["Mon"], startTime: "10:00", endTime: "11:00", dateRange: "A", location: "Test Location" }, VER);
        const section = new Section("CPSC_O 213", "99999", [], [sectionDetail], "2025-26 Winter Term 1 (UBC-O)", 0, "blue", "101", "Lecture", "Test", false);

        const grades = await section.getHistoricalGrades();

        expect(grades).toEqual({
            average: null,
            averageFiveYears: null
        });
    });


    test("get grades url test", () => {
        const sectionTest2 = Section.getSectionFromJSON(sectionData.data[1], VER);
        expect(sectionTest2.getGradesUrl()).toStrictEqual("https://ubcgrades.com/statistics-by-course#UBCV-CPSC-213");
    });

    test("exporting to json", () => {
        const sectionTest2 = Section.getSectionFromJSON(sectionData.data[1], VER);
        const json = sectionTest2.exportToJSON();
        expect(json).toEqual({
            code: "CPSC_V 213",
            courseID: "14847",
            instructors: ["Jordon Johnson"],
            sectionDetails: [sectionTest2.getSectionDetails()[0].exportToJSON()],
            session: "2025-26 Winter Term 1 (UBC-V)",
            worklistNumber: 0,
            color: "#EAFFD1",
            sectionCode: "101",
            format: "Lecture + Lab",
            name: "Introduction to Computer Systems",
            isCustom: false
        });
    });


    test("get section link", () => {
        const sectionTest2 = Section.getSectionFromJSON(sectionData.data[1], VER);
        expect(sectionTest2.getSectionLink()).toEqual("https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$14847.htmld");
        const sectionCustom = new Section("DSCI_V 200", "458199", ["Gabriela Cohen Freue", "Katie Burak"], [sectionDetail], "2025-26 Winter Term 2 (UBC-V)", 1, "blue", "001", "Lecture", DSCI, true);
        expect(sectionCustom.getSectionLink()).toEqual("");
    });


    test("testing get locations", () => {
        const sd1 = SectionDetail.getSectionDetailFromJSON({ term: 2, days: ["Mon"], startTime: "09:00", endTime: "10:00", dateRange: "A", location: "Brock Commons South (BRCS) - Room 2070" }, VER);
        const sd2 = SectionDetail.getSectionDetailFromJSON({ term: 1, days: ["Tue"], startTime: "11:00", endTime: "12:00", dateRange: "B", location: "Forest Sciences Centre (FSC) - Room 1005" }, VER);
        const sd3 = SectionDetail.getSectionDetailFromJSON({ term: 2, days: ["Wed"], startTime: "13:00", endTime: "14:00", dateRange: "C", location: "Brock Commons South (BRCS) - Room 2070" }, VER);
        const section = new Section("DSCI_V 200", "458199", [], [sd1, sd2, sd3], "2025-26 Winter Term 2 (UBC-V)", 1, "blue", "001", "Lecture", "Test", false);
        const allLocations = section.getLocations();
        expect(allLocations).toEqual(
            expect.arrayContaining([
                "Brock Commons South (BRCS) - Room 2070",
                "Forest Sciences Centre (FSC) - Room 1005"
            ])
        );
        expect(allLocations.length).toBe(2);


        const term2Locations = section.getLocations([2]);
        expect(term2Locations).toEqual([
            "Brock Commons South (BRCS) - Room 2070"
        ]);

        const term3Locations = section.getLocations([3]);
        expect(term3Locations).toEqual([]);
    });
});
