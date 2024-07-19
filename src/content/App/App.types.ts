export enum SectionType {
  lecture,
  tutorial,
  lab,
}

// TODO refactor this
export enum Term {
  summerOne,
  summerTwo,
  summerFull,
  winterOne,
  winterTwo,
  winterFull,
}

export enum Views {
  calendar,
  settings,
}
// TODO refactor this
export const Term_String_Map: { [key in Term]: string } = {
  [Term.summerOne]: "S1",
  [Term.summerTwo]: "S2",
  [Term.summerFull]: "S",
  [Term.winterOne]: "W1",
  [Term.winterTwo]: "W2",
  [Term.winterFull]: "W",
}

export type SectionDetail = {
  term: Term
  days: string[]
  startTime: string
  endTime: string
  location?: string
  dateRange: string
}

export interface ISectionData {
  code: string
  name: string
  instructors: string[]
  sectionDetails: SectionDetail[]
  term: Term
  worklistNumber: number
  color: string
  courseID?: string
}
