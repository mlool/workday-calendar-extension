import { expect, test } from "@jest/globals"
import { calculateRealCourseStartDate } from "../src/storage/icsUtils"

const MONDAY_UTC_DATE = new Date(2000, 1, 7)
const TUESDAY_UTC_DATE = new Date(2000, 1, 1)
const WEDNESDAY_UTC_DATE = new Date(2000, 1, 2)
const THURSDAY_UTC_DATE = new Date(2000, 1, 3)

test("Offset is 0 when section start is start of term", () => {
  const resultForMonday = calculateRealCourseStartDate(MONDAY_UTC_DATE, [
    "Mon",
    "Wed",
  ])
  const resultForTuesday = calculateRealCourseStartDate(TUESDAY_UTC_DATE, [
    "Tue",
    "Thu",
  ])
  expect(resultForMonday).toBe(0)
  expect(resultForTuesday).toBe(0)
})

test("Offset is 0 when given date is real section start date", () => {
  const resultForWednesday = calculateRealCourseStartDate(WEDNESDAY_UTC_DATE, [
    "Wed",
    "Fri",
  ])
  const resultForThursday = calculateRealCourseStartDate(THURSDAY_UTC_DATE, [
    "Thu",
  ])
  expect(resultForWednesday).toBe(0)
  expect(resultForThursday).toBe(0)
})

test("Correct offset when given date is before real start date", () => {
  const resultForMonday = calculateRealCourseStartDate(MONDAY_UTC_DATE, [
    "Tue",
    "Thu",
  ])
  const resultForFriday = calculateRealCourseStartDate(TUESDAY_UTC_DATE, [
    "Fri",
  ])
  expect(resultForMonday).toBe(1)
  expect(resultForFriday).toBe(3)
})

test("Correct offset when given date after start date AND section has multiple meeting days", () => {
  const resultForTuesday = calculateRealCourseStartDate(TUESDAY_UTC_DATE, [
    "Mon",
    "Wed",
    "Fri",
  ])
  const resultForWednesday = calculateRealCourseStartDate(WEDNESDAY_UTC_DATE, [
    "Tue",
    "Thu",
  ])
  const result3 = calculateRealCourseStartDate(WEDNESDAY_UTC_DATE, [
    "Mon",
    "Tue",
  ])
  expect(resultForTuesday).toBe(1)
  expect(resultForWednesday).toBe(1)
  expect(result3).toBe(6)
})

test("Correct offset when given date after start date AND section has single meeting day", () => {
  const resultForTuesday = calculateRealCourseStartDate(TUESDAY_UTC_DATE, [
    "Mon",
  ])
  const resultForThursday = calculateRealCourseStartDate(THURSDAY_UTC_DATE, [
    "Tue",
  ])
  expect(resultForTuesday).toBe(6)
  expect(resultForThursday).toBe(6)
})
