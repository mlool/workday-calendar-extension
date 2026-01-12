import { useState, useEffect } from "react";
import Section from "../../objects/Section";
import SectionDetail from "../../objects/SectionDetail";
import ExtensionStorage from "../../objects/ExtensionStorage";
import CloseIcon from "../Icons/CloseIcon";
import "./CustomSectionDetails.css";
import Schedule from "../../objects/Schedule";

interface IProps {
    section: Section | null;
    term: number;
    schedule: Schedule;
    onClose: () => void;
    onDelete: (section: Section) => void;
    setNewSection: (section: Section | null) => void;
    setSchedule: (schedule: Schedule) => void;
}

const DAYS_OF_WEEK = ["Mon", "Tue", "Wed", "Thu", "Fri"];

// Generate 30-min interval times
const TIME_OPTIONS: string[] = [];
for (let h = 7; h <= 21; h++) {
    TIME_OPTIONS.push(`${h}:00`);
    if (h !== 21) TIME_OPTIONS.push(`${h}:30`);
}

const CustomSectionDetails = ({ section, term, schedule, onClose, onDelete, setNewSection, setSchedule }: IProps) => {
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [selectedTerms, setSelectedTerms] = useState<Set<number>>(new Set([term]));
    const [selectedDays, setSelectedDays] = useState<Set<string>>(new Set());
    const [startTime, setStartTime] = useState("08:00");
    const [endTime, setEndTime] = useState("09:00");

    const [isExisting, setIsExisting] = useState(false);

    useEffect(() => {
        if (section) {
            setTitle(section.getCode() || "");
            setNotes(section.getName() || "");
            setSelectedTerms(section.getTerms());

            // Assume 1 section detail for custom sections for simplicity as per requirement
            const details = section.getSectionDetails();
            if (details.length > 0) {
                const detail = details[0];
                setSelectedDays(new Set(detail.getDays()));
                setStartTime(detail.getStartTime());
                setEndTime(detail.getEndTime());
            }

            // Check if this section is already in the schedule (persistent) vs new (pending)
            // If it's in the schedule, it's "Existing".
            const inSchedule = schedule.getSections().some((s: Section) => s.getCourseID() === section.getCourseID());
            setIsExisting(inSchedule);
        } else {
            // Default for new creation
            setIsExisting(false);
            const uniqueId = Math.random().toString(36).substring(7);
            // We don't have a section object yet, but we will create one on save/change
        }
    }, [section, schedule]);

    const handleSave = async () => {
        // Validation
        if (!title.trim()) {
            alert("Please enter a title.");
            return;
        }
        if (selectedDays.size === 0) {
            alert("Please select at least one day.");
            return;
        }
        if (selectedTerms.size === 0) {
            alert("Please select at least one term.");
            return;
        }

        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);

        if (startMinutes >= endMinutes) {
            alert("Start time must be before end time.");
            return;
        }

        // Create Section Object
        const termsArray = Array.from(selectedTerms).sort();
        const daysArray = Array.from(selectedDays);

        const detail = new SectionDetail(
            termsArray,
            daysArray,
            startTime,
            endTime
        );

        // ID Management: Keep existing ID if editing, else generate new
        const courseId = section ? section.getCourseID() : Math.random().toString(36).substring(2, 9);
        const color = section ? section.getColor() : "var(--new-section-color)"; // New sections are usually styled by Calendar as pending if in newSection slot

        const newSectionObj = new Section(
            title,
            courseId,
            [], // instructors
            [detail],
            "2025W",
            0,
            color,
            undefined, // sectionCode
            undefined, // format
            notes, // name mapped to notes
            true // isCustom
        );

        // Logic for Updates
        // 1. Did Schedule Change? (Time/Day/Term)
        const oldDetail = section?.getSectionDetails()[0];
        let scheduleChanged = true;

        if (section && oldDetail) {
            const oldDays = new Set(oldDetail.getDays());
            const daysChanged = oldDays.size !== selectedDays.size || !daysArray.every(d => oldDays.has(d));

            const oldTerms = section.getTerms();
            const termsChanged = oldTerms.size !== selectedTerms.size || !termsArray.every(t => oldTerms.has(t));

            if (!daysChanged && !termsChanged && oldDetail.getStartTime() === startTime && oldDetail.getEndTime() === endTime) {
                scheduleChanged = false;
            }
        } else {
            // New section creation always counts as "change"/new
            scheduleChanged = true;
        }

        if (scheduleChanged) {
            // Treat as NEW section (Pending confirmation)

            // If it was an existing persistent section, REMOVE it first
            if (isExisting && section) {
                const newSchedule = schedule.removeSection(section.getWorklistNumber(), section.getCourseID());
                setSchedule(newSchedule);
                await ExtensionStorage.setSchedule(newSchedule);
            }

            // Set as the Pending New Section
            setNewSection(newSectionObj);
            await ExtensionStorage.setNewSection(newSectionObj);

        } else {
            // Metadata Only Change (In-Place)
            if (isExisting && section) {
                // Update in schedule
                // We need to implement an 'updateSection' or just remove and add (but keeping it confirmed)
                // Since our Schedule object is immutable-ish or complex, simplest is remove & add back 
                // BUT we want to keep it "Confirmed" (blue), not "Pending" (orange).
                // Schedule.addSection might add it to storage. 

                // Workaround: Remove old, Add new, but DO NOT set as newSection. Directly set to schedule.
                let newSchedule = schedule.removeSection(section.getWorklistNumber(), section.getCourseID());
                // Preserve worklist number
                newSectionObj.setWorklistNumber(section.getWorklistNumber());
                // Ensure color is preserved or set to valid color
                if (section.getColor() === "var(--new-section-color)") {
                    // If it was somehow stored with new color, give it a real color
                    // For now, let Schedule.addSection handle coloring if possible, or copy old color
                    newSectionObj.setColor("var(--primary-color)"); // Fallback
                } else {
                    newSectionObj.setColor(section.getColor());
                }

                newSchedule = newSchedule.bulkAddSections([newSectionObj]); // Re-add
                setSchedule(newSchedule);
                await ExtensionStorage.setSchedule(newSchedule);

            } else {
                // It was already pending (orange), just update the pending section
                setNewSection(newSectionObj);
                await ExtensionStorage.setNewSection(newSectionObj);
            }
        }

        onClose();
    };


    const toggleDay = (day: string) => {
        const newDays = new Set(selectedDays);
        if (newDays.has(day)) {
            newDays.delete(day);
        } else {
            newDays.add(day);
        }
        setSelectedDays(newDays);
    };

    const toggleTerm = (t: number) => {
        const newTerms = new Set(selectedTerms);
        if (newTerms.has(t)) {
            newTerms.delete(t);
        } else {
            newTerms.add(t);
        }
        setSelectedTerms(newTerms);
    }

    // Helper to help select check/uncheck
    const isTermSelected = (t: number) => selectedTerms.has(t);
    const isDaySelected = (d: string) => selectedDays.has(d);

    const timeToMinutes = (time: string) => {
        const [h, m] = time.split(":").map(Number);
        return h * 60 + m;
    }

    return (
        <div className="custom-section-details-overlay" onClick={onClose}>
            <div className="custom-section-details-popup" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2 className="popup-title">{section ? "Edit Custom Section" : "New Custom Section"}</h2>
                    <CloseIcon size={16} onClose={onClose} />
                </div>
                <div className="popup-content">
                    <div className="input-group">
                        <label className="input-label">Title</label>
                        <input
                            className="input-field"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Study Group"
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Notes</label>
                        <textarea
                            className="input-field"
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="Add details..."
                            rows={3}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Term</label>
                        <div className="button-group">
                            {[1, 2].map(t => (
                                <button
                                    key={t}
                                    className={`custom-control-button ${isTermSelected(t) ? "active" : ""}`}
                                    onClick={() => toggleTerm(t)}
                                >
                                    T{t}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Days</label>
                        <div className="day-selector">
                            {DAYS_OF_WEEK.map(day => (
                                <button
                                    key={day}
                                    className={`custom-control-button ${isDaySelected(day) ? "active" : ""}`}
                                    onClick={() => toggleDay(day)}
                                >
                                    {day}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="input-group">
                        <label className="input-label">Time</label>
                        <div className="time-selector">
                            <div className="input-wrapper" style={{ width: '48%' }}>
                                <label style={{ fontSize: '0.75rem', marginBottom: '2px', display: 'block' }}>Start</label>
                                <select className="input-field" value={startTime} onChange={(e) => setStartTime(e.target.value)} style={{ width: '100%' }}>
                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                            <div className="input-wrapper" style={{ width: '48%' }}>
                                <label style={{ fontSize: '0.75rem', marginBottom: '2px', display: 'block' }}>End</label>
                                <select className="input-field" value={endTime} onChange={(e) => setEndTime(e.target.value)} style={{ width: '100%' }}>
                                    {TIME_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="popup-footer">
                    {isExisting && section ? (
                        <button className="custom-btn-delete" onClick={() => { onDelete(section); onClose(); }}>Delete</button>
                    ) : (
                        <div></div>
                    )}
                    <button className="custom-btn-save" onClick={handleSave}>
                        {isExisting ? "Update" : "Done"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CustomSectionDetails;
