import { ISectionData } from "../../content/App/App.types";

export function serializeSectionData(sectionData: ISectionData): any {
    return {
        ...sectionData,
        terms: Array.from(sectionData.terms), // Convert Set to Array
    };
}

export function deserializeSectionData(storedData: any): ISectionData | null {
    try {
        // Check if storedData is an object
        if (typeof storedData !== 'object' || storedData === null) {
            console.error("Invalid data: storedData is not an object or is null", storedData);
            return null;
        }

        // Validate the terms property
        if (!Array.isArray(storedData.terms)) {
            console.error("Invalid data: terms should be an array", storedData.terms);
            return null;
        }

        // Validate the rest of the required properties
        const requiredProps = ["code", "name", "instructors", "session", "sectionDetails", "worklistNumber", "color"];
        for (const prop of requiredProps) {
            if (!storedData.hasOwnProperty(prop)) {
                console.error(`Invalid data: missing required property '${prop}'`, storedData);
                return null;
            }
        }

        // Validate types of the properties
        if (typeof storedData.code !== 'string' ||
            typeof storedData.name !== 'string' ||
            !Array.isArray(storedData.instructors) ||
            typeof storedData.session !== 'string' ||
            typeof storedData.worklistNumber !== 'number' ||
            typeof storedData.color !== 'string') {
            console.error("Invalid data: one or more properties have incorrect types", storedData);
            return null;
        }

        // Ensure sectionDetails is an array
        if (!Array.isArray(storedData.sectionDetails)) {
            console.error("Invalid data: sectionDetails should be an array", storedData.sectionDetails);
            return null;
        }

        // Optionally, you can add further validation for sectionDetails' contents here

        // If all validations pass, deserialize the data
        return {
            ...storedData,
            terms: new Set(storedData.terms), // Convert Array back to Set
        };
    } catch (error) {
        console.error("Error deserializing section data", error);
        return null;
    }
}
