type WorkdayNode = {
    label?: string;
    children?: WorkdayNode[];
    [key: string]: any;
};

const NEEDED_LABELS = [
    "Course",
    "Instructor Teaching",
    "Start/End Date",
    "Instructional Formats",
    "Meeting Patterns",
];

export function collectNodesWithLabel(root: WorkdayNode[] | WorkdayNode): WorkdayNode[] {
    const results: WorkdayNode[] = [];
    const stack: WorkdayNode[] = Array.isArray(root) ? [...root] : [root];

    while (stack.length > 0) {
        const node = stack.pop()!;

        if (typeof node.label === "string" && NEEDED_LABELS.includes(node.label)) {
            results.push(node);
        }

        if (Array.isArray(node.children)) {
            // push children to continue traversal
            for (const child of node.children) stack.push(child);
        }
    }

    return results;
}

export function extractWorkdaySectionInfo(selectedNodes: WorkdayNode[]) {
    const courseNode = selectedNodes.find(node => node.label === "Course");
    const instructorNode = selectedNodes.find(node => node.label === "Instructor Teaching");
    // const dateRangeNode = selectedNodes.find(node => node.label === "Start/End Date");
    const instructionalFormatsNode = selectedNodes.find(node => node.label === "Instructional Formats");
    const meetingPatternsNode = selectedNodes.find(node => node.label === "Meeting Patterns");

    const rawName = courseNode?.instances?.[0]?.text;
    const instructors = instructorNode?.instances?.map((instance: any) => instance.text) || [];
    // const dateRange = dateRangeNode?.value;
    const format = instructionalFormatsNode?.instances?.[0]?.text;
    const meetingPatterns = meetingPatternsNode?.instances?.map((instance: any) => instance.text) || [];

    const [code, name] = rawName?.split(" - ") || ["", ""];

    return {
        code,
        name,
        instructors,
        format,
        meetingPatterns,
    };
}

export const convertTo24HourFormat = (time: string): string => {
    const [timePart, period] = time.split(" ")
    // eslint-disable-next-line prefer-const
    let [hours, minutes] = timePart.split(":").map(Number)

    if (period && period.toLowerCase() === "p.m." && hours !== 12) {
        hours += 12
    } else if (period && period.toLowerCase() === "a.m." && hours === 12) {
        hours = 0
    }

    return `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`
}

export const parseSessionAndTermFromDateRange = (
    dateRange: string
): { session: string; terms: number[] } => {
    const dates = dateRange.trim().split(" - ")
    const finalSessions = new Set<string>()
    const finalTerms = []

    // we need to check term for both dates because workday
    // may give us a date range that spans multiple terms.
    // EXAMPLE: MEDD_V 429, BIOC_V 301 labs
    for (const date of dates) {
        const [year, month] = date.split("-").map(Number)

        switch (true) {
            case month >= 1 && month <= 4:
                finalSessions.add(`${year - 1}W`)
                finalTerms.push(2)
                break
            case month >= 5 && month <= 6:
                finalSessions.add(`${year}S`)
                finalTerms.push(1)
                break
            case month >= 7 && month <= 8:
                finalSessions.add(`${year}S`)
                finalTerms.push(2)
                break
            case month >= 9 && month <= 12:
                finalSessions.add(`${year}W`)
                finalTerms.push(1)
                break
            default:
                throw `Month ${month} parsed from Workday not valid!`
        }
    }

    if (finalSessions.size !== 1)
        throw `Illegal number of sessions found! ${finalSessions}`
    return { session: finalSessions.values().next().value!, terms: finalTerms }
}
