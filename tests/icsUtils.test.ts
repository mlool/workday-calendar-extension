import { expect, test } from "@jest/globals"
import { calculateRealCourseStartDate } from "../src/storage/helpers/icsUtils"

const MONDAY_DATE = new Date("2000-01-04")
const TUESDAY_DATE = new Date("2000-01-05")
const WEDNESDAY_DATE = new Date("2000-01-06")
const THURSDAY_DATE = new Date("2000-01-07")

test("Offset is 0 when section start is start of term", () => {
  const resultForMonday = calculateRealCourseStartDate(MONDAY_DATE, [
    "Mon",
    "Wed",
  ])
  const resultForTuesday = calculateRealCourseStartDate(TUESDAY_DATE, [
    "Tue",
    "Thu",
  ])
  expect(resultForMonday).toBe(0)
  expect(resultForTuesday).toBe(0)
})

test("Offset is 0 when given date is real section start date", () => {
  const resultForWednesday = calculateRealCourseStartDate(WEDNESDAY_DATE, [
    "Wed",
    "Fri",
  ])
  const resultForThursday = calculateRealCourseStartDate(THURSDAY_DATE, ["Thu"])
  expect(resultForWednesday).toBe(0)
  expect(resultForThursday).toBe(0)
})

test("Correct offset when given date is before real start date", () => {
  const resultForMonday = calculateRealCourseStartDate(MONDAY_DATE, [
    "Tue",
    "Thu",
  ])
  const resultForFriday = calculateRealCourseStartDate(TUESDAY_DATE, ["Fri"])
  expect(resultForMonday).toBe(1)
  expect(resultForFriday).toBe(3)
})

test("Correct offset when given date after start date AND section has multiple meeting days", () => {
  const resultForTuesday = calculateRealCourseStartDate(TUESDAY_DATE, [
    "Mon",
    "Wed",
    "Fri",
  ])
  const resultForWednesday = calculateRealCourseStartDate(WEDNESDAY_DATE, [
    "Tue",
    "Thu",
  ])
  const result3 = calculateRealCourseStartDate(WEDNESDAY_DATE, ["Mon", "Tue"])
  expect(resultForTuesday).toBe(1)
  expect(resultForWednesday).toBe(1)
  expect(result3).toBe(6)
})

test("Correct offset when given date after start date AND section has single meeting day", () => {
  const resultForTuesday = calculateRealCourseStartDate(TUESDAY_DATE, ["Mon"])
  const resultForThursday = calculateRealCourseStartDate(THURSDAY_DATE, ["Tue"])
  expect(resultForTuesday).toBe(6)
  expect(resultForThursday).toBe(6)
})
