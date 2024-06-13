export enum SectionType {
  lecture,
  tutorial,
  lab,
}

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

export const Term_String_Map: { [key in Term]: string } = {
  [Term.summerOne]: "S1",
  [Term.summerTwo]: "S2",
  [Term.summerFull]: "S",
  [Term.winterOne]: "W1",
  [Term.winterTwo]: "W2",
  [Term.winterFull]: "W",
};

export type SupplementaryData = {
  instructors: string[];
  locations: string[];
};

export type SectionDetail = {
  term: Term;
  days: string[];
  startTime: string;
  endTime: string;
  dateRange: string;
};

export interface ISectionData {
  code: string;
  name: string;
  sectionDetails: SectionDetail[];
  term: Term;
  worklistNumber: number;
  color: string;
  courseID?: string;
}
