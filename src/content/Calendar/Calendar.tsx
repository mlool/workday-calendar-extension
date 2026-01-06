import React, { useEffect } from 'react';
import Section, { SectionSchedule } from '../../objects/Section';
import './Calendar.css';
import Schedule from '../../objects/Schedule';

interface IProps {
    schedule: Schedule;
    newSection: Section | null;
    worklist: number;
    term: number;
    session: string;
}

const START_HOUR = 7;
const END_HOUR = 21;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const CONFLICT_COLOR = "var(--conflict-color)";
const NEW_SECTION_COLOR = "var(--new-section-color)";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const Calendar: React.FC<IProps> = ({ schedule, newSection, worklist, term, session }) => {
    const [scheduleSectionSchedules, setScheduleSectionSchedules] = React.useState(schedule.getSectionSchedule(worklist, session, [term]));
    const [newSectionSchedules, setNewSectionSchedules] = React.useState(newSection ? newSection.getSectionSchedule([term]) : []);

    useEffect(() => {
        setScheduleSectionSchedules(schedule.getSectionSchedule(worklist, session, [term]));
        setNewSectionSchedules(newSection ? newSection.getSectionSchedule([term]) : []);
    }, [schedule, newSection, worklist, term, session]);

    const timeToMinutes = (time: string): number => {
        const [hours, minutes] = time.split(':').map(Number);
        return (hours - START_HOUR) * 60 + minutes;
    };

    const getPositionStyle = (startTime: string, endTime: string) => {
        const startMinutes = timeToMinutes(startTime);
        const endMinutes = timeToMinutes(endTime);
        const duration = endMinutes - startMinutes;

        const top = (startMinutes / TOTAL_MINUTES) * 100;
        const height = (duration / TOTAL_MINUTES) * 100;

        return {
            top: `${top}%`,
            height: `${height}%`
        };
    };

    const checkConflict = (newSec: SectionSchedule, existingSec: SectionSchedule): boolean => {
        const newStart = timeToMinutes(newSec.startTime);
        const newEnd = timeToMinutes(newSec.endTime);
        const existStart = timeToMinutes(existingSec.startTime);
        const existEnd = timeToMinutes(existingSec.endTime);

        return newStart < existEnd && existStart < newEnd;
    };

    // Generate times for the gutter
    const renderTimeLabels = () => {
        const labels = [];
        for (let h = START_HOUR; h <= END_HOUR; h++) {
            const top = ((h - START_HOUR) * 60 / TOTAL_MINUTES) * 100;
            // Don't render label for 21:00 at the very bottom if it causes overflow logic or look bad, but usually fine
            labels.push(
                <div key={h} className="time-label" style={{ top: `${top}%` }}>
                    {h}:00
                </div>
            );
        }
        return labels;
    };

    const renderGridLines = () => {
        const lines = [];
        for (let h = START_HOUR; h <= END_HOUR; h += 0.5) {
            const top = ((h - START_HOUR) * 60 / TOTAL_MINUTES) * 100;
            lines.push(<div key={h} className="grid-line" style={{ top: `${top}%` }} />);
        }
        return lines;
    };

    return (
        <div className="calendar">
            <div className="calendar-header">
                <div className="time-gutter-header"></div>
                {DAYS.map(day => (
                    <div key={day} className="day-header">
                        {day}
                    </div>
                ))}
            </div>
            <div className="calendar-body">
                <div className="time-gutter">
                    {renderTimeLabels()}
                </div>
                <div className="days-container">
                    {/* Render background grid lines across all columns */}
                    <div style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
                        {renderGridLines()}
                    </div>

                    {DAYS.map(day => {
                        const daySchedule = scheduleSectionSchedules.filter(s => s.day.includes(day));

                        // Check for newSection
                        const newSectionElements = (newSectionSchedules || [])
                            .filter(sec => sec.day.includes(day))
                            .map((sec, i) => {
                                // Check collisions with ANY event on this day
                                const hasConflict = daySchedule.some(existing => checkConflict(sec, existing));
                                const style = getPositionStyle(sec.startTime, sec.endTime);

                                return (
                                    <div
                                        key={`new-section-${i}`}
                                        className="event-block"
                                        style={{
                                            ...style,
                                            backgroundColor: hasConflict ? CONFLICT_COLOR : NEW_SECTION_COLOR,
                                            zIndex: 20,
                                        }}
                                        title={`${sec.code} - ${sec.name} (New)`}
                                    >
                                        <div className="event-code">{sec.code}</div>
                                    </div>
                                );
                            });

                        return (
                            <div key={day} className="day-column">
                                {daySchedule
                                    .map((section, idx) => {
                                        const style = getPositionStyle(section.startTime, section.endTime);
                                        return (
                                            <div
                                                key={`${section.courseID}-${day}-${idx}`}
                                                className="event-block"
                                                style={{
                                                    ...style,
                                                    backgroundColor: section.color || 'var(--primary-color)'
                                                }}
                                                title={`${section.code} - ${section.name}`}
                                            >
                                                <div className="event-code">{section.code}</div>
                                            </div>
                                        );
                                    })}
                                {newSectionElements}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
