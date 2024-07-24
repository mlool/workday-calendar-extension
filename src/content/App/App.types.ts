export enum SectionType {
  lecture,
  tutorial,
  lab,
}

export enum Term {
  One,
  Two,
}

export enum Views {
  calendar,
  settings,
}
// TODO refactor this
export const Term_String_Map: { [key in Term]: string } = {
  [Term.One]: "T1",
  [Term.Two]: "T2",
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
  session: string // format of "2024W", "2025S", etc
  terms: Set<Term>
  sectionDetails: SectionDetail[]
  worklistNumber: number
  color: string
  courseID?: string
}
