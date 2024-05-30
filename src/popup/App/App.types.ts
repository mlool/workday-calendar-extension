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

export interface ISectionData {
    code: string,
    name: string,
    type: SectionType,
    location: string,
    days: string[],
    startTime: string,
    endTime: string,
    term: Term,
    worklistNumber: number,
    color: string
    // details: string,
    // title: string,
}

export const baseSection:ISectionData = {
    code: "",
    name: "",
    type: SectionType.lecture,
    location: "",
    days: [],
    startTime: "",
    endTime: "",
    term: Term.winterOne,
    worklistNumber: 0,
    color: defaultColorList[0]
}