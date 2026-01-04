import React from 'react';
import { SectionSchedule } from '../../objects/Section';
import './Calendar.css';

interface IProps {
    schedule: SectionSchedule[];
    newSection?: SectionSchedule;
}

const START_HOUR = 7;
const END_HOUR = 21;
const TOTAL_MINUTES = (END_HOUR - START_HOUR) * 60;

const CONFLICT_COLOR = "var(--conflict-color)";
const NEW_SECTION_COLOR = "var(--new-section-color)";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"];

const Calendar: React.FC<IProps> = ({ schedule, newSection }) => {

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
                        const daySchedule = schedule.filter(s => s.day.includes(day));

                        // Check for newSection
                        let newSectionElement = null;
                        if (newSection && newSection.day.includes(day)) {
                            // Check collisions with ANY event on this day
                            const hasConflict = daySchedule.some(existing => checkConflict(newSection, existing));
                            const style = getPositionStyle(newSection.startTime, newSection.endTime);

                            newSectionElement = (
                                <div
                                    key="new-section"
                                    className="event-block"
                                    style={{
                                        ...style,
                                        backgroundColor: hasConflict ? CONFLICT_COLOR : NEW_SECTION_COLOR,
                                        zIndex: 20,
                                    }}
                                    title={`${newSection.code} - ${newSection.name} (New)`}
                                >
                                    <div className="event-code">{newSection.code}</div>
                                </div>
                            );
                        }

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
                                {newSectionElement}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default Calendar;
