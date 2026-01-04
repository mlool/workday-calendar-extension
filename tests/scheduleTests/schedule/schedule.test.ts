import Schedule from "../../../src/objects/Schedule";
import json1 from "./schedule_1.json";

describe("Schedule Tests", () => {
    test("importFromJSON handles version upgrade (2.0.1 -> 3.0.0)", () => {
        const schedule = new Schedule("2.0.1", []);
        schedule.importFromJSON(json1);
        expect(schedule.version).toBe("3.0.0");
        expect(schedule.data.length).toBe(2);
        // Verify some data to ensure it loaded correctly
        expect(schedule.data[0].code).toBe("CPSC_V 121");
    });

    test("exportToJSON structure", () => {
        const schedule = new Schedule("3.0.0", []);
        schedule.importFromJSON(json1); // Load data first
        const exported = schedule.exportToJSON();
        expect(exported.version).toBe("3.0.0");
        expect(exported.data.length).toBe(2);
        expect(exported.data[0].code).toBe("CPSC_V 121");
    });
});
