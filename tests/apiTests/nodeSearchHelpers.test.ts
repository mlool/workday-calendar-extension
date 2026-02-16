import { expect, test } from "@jest/globals";
import acamV1000012025 from "./mockResponses/2025W_ACAM_V_100_001.json";
import biolV1550012025 from "./mockResponses/2025W_BIOL_V_155_001.json";
import apscV2629222024S from "./mockResponses/2024S_APSC_V_262_922.json";
import { fetchSectionFromJSON } from "../../src/backends/workday/idSearchApi";

test("Load ACAM_V 100 001 2025W", async () => {
  // https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$458290.htmld
  const rawData = acamV1000012025;
  const section = fetchSectionFromJSON(rawData, "458290");

  expect(section).toBeDefined();
  expect(section?.getCode()).toBe("ACAM_V 100");
  expect(section?.getSectionCode()).toBe("001");
  expect(section?.getName()).toBe("Introduction to Asian Canadian Studies");
  expect(section?.getCourseID()).toBe("458290");

  expect(section?.getWorklistNumber()).toBe(0);
  expect(section?.getSession()).toBe("2025W");

  expect(section?.getFormat()).toBe("Lecture");
  expect(section?.getInstructors()).toStrictEqual(["Alifa Bandali"]);
  expect(section?.getIsCustom()).toBe(false);

  expect(section?.getSectionDetails().length).toBe(2);

  const detailsOne = section?.getSectionDetails()[0];
  const detailsTwo = section?.getSectionDetails()[1];

  expect(detailsOne?.getDays()).toStrictEqual(["Tue", "Thu"]);
  expect(detailsOne?.getStartDate()).toBe("2026-01-06");
  expect(detailsOne?.getEndDate()).toBe("2026-02-12");
  expect(detailsOne?.getStartTime()).toBe("09:30");
  expect(detailsOne?.getEndTime()).toBe("11:00");
  expect(detailsOne?.getLocation()).toBe(
    "Buchanan Building (BUCH) | Floor: 2 | Room: D222"
  );
  expect(detailsOne?.getTerms()).toStrictEqual([2]);

  expect(detailsTwo?.getDays()).toStrictEqual(["Tue", "Thu"]);
  expect(detailsTwo?.getStartDate()).toBe("2026-02-24");
  expect(detailsTwo?.getEndDate()).toBe("2026-04-09");
  expect(detailsTwo?.getStartTime()).toBe("09:30");
  expect(detailsTwo?.getEndTime()).toBe("11:00");
  expect(detailsTwo?.getLocation()).toBe(
    "Buchanan Building (BUCH) | Floor: 2 | Room: D222"
  );
  expect(detailsTwo?.getTerms()).toStrictEqual([2]);
});

test("Load BIOL_V 155 001 2025W", async () => {
  // https://wd10.myworkday.com/ubc/d/inst/15$365714/15194$445326.htmld
  const rawData = biolV1550012025;
  const section = fetchSectionFromJSON(rawData, "445326");

  expect(section).toBeDefined();
  expect(section?.getCode()).toBe("BIOL_V 155");
  expect(section?.getSectionCode()).toBe("001");
  expect(section?.getName()).toBe(
    "Human Biology: Physiology and Introductory Anatomy"
  );
  expect(section?.getCourseID()).toBe("445326");

  expect(section?.getWorklistNumber()).toBe(0);
  expect(section?.getSession()).toBe("2025W");

  expect(section?.getFormat()).toBe("Lecture");
  expect(section?.getInstructors()).toStrictEqual([
    "Irene Ballagh",
    "Queenie Hui",
  ]);
  expect(section?.getIsCustom()).toBe(false);

  expect(section?.getSectionDetails().length).toBe(3);

  const detailsOne = section?.getSectionDetails()[0];
  const detailsTwo = section?.getSectionDetails()[1];
  const detailsThree = section?.getSectionDetails()[2];

  expect(detailsOne?.getDays()).toStrictEqual(["Tue", "Thu"]);
  expect(detailsOne?.getStartDate()).toBe("2025-09-02");
  expect(detailsOne?.getEndDate()).toBe("2025-12-04");
  expect(detailsOne?.getStartTime()).toBe("12:30");
  expect(detailsOne?.getEndTime()).toBe("14:00");
  expect(detailsOne?.getLocation()).toBe(
    "Gordon B. Shrum Building (SHRM) | Floor: -1 | Room: B1001"
  );
  expect(detailsOne?.getTerms()).toStrictEqual([1]);

  expect(detailsTwo?.getDays()).toStrictEqual(["Tue", "Thu"]);
  expect(detailsTwo?.getStartDate()).toBe("2026-01-06");
  expect(detailsTwo?.getEndDate()).toBe("2026-02-12");
  expect(detailsTwo?.getStartTime()).toBe("12:30");
  expect(detailsTwo?.getEndTime()).toBe("14:00");
  expect(detailsTwo?.getLocation()).toBe(
    "Pharmaceutical Sciences Building (PHRM) | Floor: 1 | Room: 1101"
  );
  expect(detailsTwo?.getTerms()).toStrictEqual([2]);

  expect(detailsThree?.getDays()).toStrictEqual(["Tue", "Thu"]);
  expect(detailsThree?.getStartDate()).toBe("2026-02-24");
  expect(detailsThree?.getEndDate()).toBe("2026-04-09");
  expect(detailsThree?.getStartTime()).toBe("12:30");
  expect(detailsThree?.getEndTime()).toBe("14:00");
  expect(detailsThree?.getLocation()).toBe(
    "Pharmaceutical Sciences Building (PHRM) | Floor: 1 | Room: 1101"
  );
  expect(detailsThree?.getTerms()).toStrictEqual([2]);
});

test("Load APSC_V 262 922 2024S", async () => {
  // https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$413743.htmld
  const rawData = apscV2629222024S;
  const section = fetchSectionFromJSON(rawData, "413743");

  expect(section).toBeDefined();
  expect(section?.getCode()).toBe("APSC_V 262");
  expect(section?.getSectionCode()).toBe("922");
  expect(section?.getName()).toBe("Technology and Society II");
  expect(section?.getCourseID()).toBe("413743");

  expect(section?.getWorklistNumber()).toBe(0);
  expect(section?.getSession()).toBe("2024S");

  expect(section?.getFormat()).toBe("Lecture");
  expect(section?.getInstructors()).toStrictEqual([]);
  expect(section?.getIsCustom()).toBe(false);

  expect(section?.getSectionDetails().length).toBe(2);

  const detailsOne = section?.getSectionDetails()[0];
  const detailsTwo = section?.getSectionDetails()[1];

  expect(detailsOne?.getDays()).toStrictEqual(["Mon", "Wed"]);
  expect(detailsOne?.getStartDate()).toBe("2024-05-13");
  expect(detailsOne?.getEndDate()).toBe("2024-06-19");
  expect(detailsOne?.getStartTime()).toBe("16:30");
  expect(detailsOne?.getEndTime()).toBe("18:00");
  expect(detailsOne?.getLocation()).toBe("");
  expect(detailsOne?.getTerms()).toStrictEqual([1]);

  expect(detailsTwo?.getDays()).toStrictEqual(["Mon", "Wed"]);
  expect(detailsTwo?.getStartDate()).toBe("2024-05-13");
  expect(detailsTwo?.getEndDate()).toBe("2024-06-19");
  expect(detailsTwo?.getStartTime()).toBe("18:00");
  expect(detailsTwo?.getEndTime()).toBe("19:30");
  expect(detailsTwo?.getLocation()).toBe("");
  expect(detailsTwo?.getTerms()).toStrictEqual([1]);
});
