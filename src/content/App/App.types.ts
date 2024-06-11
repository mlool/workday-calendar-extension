import { defaultColorList } from "../../helpers/courseColors";

export enum SectionType {
    lecture,
    tutorial,
    lab
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
    settings
}


export const Term_String_Map: { [key in Term]: string} = {
    [Term.summerOne]: 'S1',
    [Term.summerTwo]: 'S2',
    [Term.summerFull]: 'S',
    [Term.winterOne]: 'W1',
    [Term.winterTwo]: 'W2',
    [Term.winterFull]: 'W',
}

export type SectionDetail = {
    term: Term,
    days: string[]
    startTime: string,
    endTime: string,
    location?: string,
    dateRange: string   
}

export interface ISectionData {
    code: string,
    name: string,
    type: SectionType,
    instructors: string[],
    sectionDetails: SectionDetail[]
    term: Term,
    worklistNumber: number,
    color: string
    courseID?: string
}

export const baseSection:ISectionData = {
    code: "",
    name: "",
    instructors: [],
    type: SectionType.lecture,
    sectionDetails: [],
    term: Term.winterOne,
    worklistNumber: 0,
    color: defaultColorList[0],
    courseID: ""
}