import SectionDetail from "../../src/objects/SectionDetail";

describe("Section Details Tests", () => {

    test("constructor sets variables correctly and also getters", () => {
        const sectionDetail = new SectionDetail([1],
            ["Mon", "Wed"],
            "09:00",
            "10:30");

        expect(sectionDetail.getTerms()).toEqual([1]);
        expect(sectionDetail.getDays()).toEqual(["Mon", "Wed"]);
        expect(sectionDetail.getStartTime()).toBe("09:00");
        expect(sectionDetail.getEndTime()).toBe("10:30");

    });

    test("constructor sets variables correct and also the optional variables with getter testing", () => {

        const sectionDetail = new SectionDetail([1, 2], ["Mon", "Wed", "Fri"],
            "03:30",
            "05:00",
            "2026-01-05",
            "2026-04-08",
            "Biological Sciences Building (BIOL) | Floor: 1 | Room: 1000");

        expect(sectionDetail.getTerms()).toEqual([1, 2]);
        expect(sectionDetail.getDays()).toEqual(["Mon", "Wed", "Fri"]);
        expect(sectionDetail.getStartTime()).toBe("03:30");
        expect(sectionDetail.getEndTime()).toBe("05:00");
        expect(sectionDetail.getStartDate()).toBe("2026-01-05");
        expect(sectionDetail.getEndDate()).toBe("2026-04-08");
        expect(sectionDetail.getLocation()).toBe("Biological Sciences Building (BIOL) | Floor: 1 | Room: 1000");


    });


    test("export to json test", () => {
        const sectionDetail = new SectionDetail([1, 2],
            ["Tue", "Thu"],
            "13:00",
            "14:30",
            "2026-01-06",
            "2026-04-09");

        expect(sectionDetail.exportToJSON()).toEqual({
            terms: [1, 2],
            days: ["Tue", "Thu"],
            startTime: "13:00",
            endTime: "14:30",
            startDate: "2026-01-06",
            endDate: "2026-04-09"
        })
    });

    test("export to json without optional", () => {
        const sectionDetail = new SectionDetail([1],
            ["Tue"],
            "10:00",
            "12:00");

        expect(sectionDetail.exportToJSON()).toEqual({
            terms: [1],
            days: ["Tue"],
            startTime: "10:00",
            endTime: "12:00",

        })
    });


    test("testing empty []", () => {
        const sectionDetail = new SectionDetail([], [], "", "");

        expect(sectionDetail.getTerms()).toEqual([]);
        expect(sectionDetail.getDays()).toEqual([]);
        expect(sectionDetail.getStartTime()).toBe("");
        expect(sectionDetail.getEndTime()).toBe("");

        expect(sectionDetail.getStartDate()).toBeUndefined();
        expect(sectionDetail.getEndDate()).toBeUndefined();
        expect(sectionDetail.getLocation()).toBeUndefined();


    });

    test("getting section detail from Json", () => {
        const sectionDetail = new SectionDetail([2],
            ["Tue", "Thu"],
            "13:00",
            "14:30",
            "2026-01-06",
            "2026-04-09");

        const json = sectionDetail.exportToJSON();

        const json1 = SectionDetail.getSectionDetailFromJSON(json);

        expect(json1.exportToJSON()).toEqual(json);


    });

    test("getting section detail from Json ver 2.0.1", () => {
        const jsonMock = {
            term: 1,
            days: ["Tue"],
            startTime: "10:00",
            endTime: "12:00",
            dateRange: "2026-01-06 - 2026-04-09"

        };


        const sectionDetail = SectionDetail.getSectionDetailFromJSON(jsonMock, "2.0.1");

        expect(sectionDetail.getTerms()).toEqual([1]);
        expect(sectionDetail.getDays()).toEqual(["Tue"]);
        expect(sectionDetail.getStartTime()).toBe("10:00");
        expect(sectionDetail.getEndTime()).toBe("12:00");
        expect(sectionDetail.getStartDate()).toEqual("2026-01-06");
        expect(sectionDetail.getEndDate()).toEqual("2026-04-09");

        expect(sectionDetail.getLocation()).toBeUndefined();



    });
});