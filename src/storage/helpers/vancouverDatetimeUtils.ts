/**
 * Returns absolute value of Vancouver timezone offset from UTC, in hours.
 * Date must be passed in due to Daylight Savings (offset changes depending
 * on time in year). Expected date format is "YYYY-MM-DD".
 */
const getVancouverTimezoneOffset = (date: string) => {
  const van = new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "America/Vancouver" })
  )
  const utc = new Date(
    new Date(date).toLocaleString("en-US", { timeZone: "UTC" })
  )
  return Math.abs(
    Math.round((van.getTime() - utc.getTime()) / (60 * 60 * 1000))
  )
}

/**
 * Returns the weekday of a datetime in the Vancouver timezone. Required as
 * `getDay()` uses the local timezone, which may not be Vancouver.
 * Weekday format is, e.g. "Thu", NOT numeric index like `getDay()`.
 */
const getVancouverWeekdayFromDate = (date: Date) => {
  const vancouverWeekdayFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Vancouver",
    weekday: "short",
  })
  return vancouverWeekdayFormatter.format(date)
}

/**
 * Converts a Vancouver date string in YYYY-MM-DD format to a proper date
 * object. This is needed to prevent the date string inputted into `Date()`
 * from being interpreted as a date in UTC.
 */
const convertVancouverDateStringToDate = (date: string) => {
  const vanOffset = getVancouverTimezoneOffset(date)
  const formattedVanOffset = `-${vanOffset.toString().padStart(2, "0")}:00`
  const formattedStartDate = `${date}T00:00:00.000${formattedVanOffset}`
  return new Date(formattedStartDate)
}

export { getVancouverWeekdayFromDate, convertVancouverDateStringToDate }
