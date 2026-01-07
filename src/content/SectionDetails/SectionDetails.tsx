import { useEffect, useState } from "react";
import Section from "../../objects/Section"
import { IGradesAPIData } from "../../objects/Section"
import "./SectionDetails.css"
import CloseIcon from "../Icons/CloseIcon";
import ExternalLinkIcon from "../Icons/ExternalLinkIcon";

interface IProps {
    section: Section;
    term: number;
    onClose: () => void;
    onDelete: (section: Section) => void;
}

const SectionDetails = ({ section, term, onClose, onDelete }: IProps) => {
    return (
        <div className="section-details-overlay" onClick={onClose}>
            <div className="section-details-popup" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                        <h2 className="popup-title">{section.getCode() + (section.getSectionCode() ? " - " + section.getSectionCode() : "")}</h2>
                        {section.getSectionLink() !== "" && <ExternalLinkIcon size={16} href={section.getSectionLink()} />}
                    </div>
                    <CloseIcon size={16} onClose={onClose} />
                </div>
                <div className="popup-content">
                    <div className="detail-row">
                        <span className="detail-value">
                            {
                                (section.getFormat() ? "(" + section.getFormat() + ") " : "") +
                                (section.getName() ? section.getName() : "")
                            }
                        </span>
                    </div>
                    {!section.getIsCustom() && <InstructorComponent section={section} />}
                    {!section.getIsCustom() && <GradeComponent section={section} />}
                    {!section.getIsCustom() && <LocationComponent section={section} term={term} />}
                </div>
                <div className="popup-footer">
                    <div className="section-delete-button" onClick={() => { onDelete(section); onClose() }}>Delete</div>
                </div>
            </div>
        </div>
    )
}

const InstructorComponent = ({ section }: { section: Section }) => {
    return (
        <div className="detail-row">
            <span className="detail-label">Instructors:</span>
            <span className="detail-value">
                {section.getInstructors().length > 0 ? section.getInstructors().join(", ") : "No instructor found."}
            </span>
        </div>
    )
}

const GradeComponent = ({ section }: { section: Section }) => {
    const [grades, setGrades] = useState<IGradesAPIData | null>(null);

    useEffect(() => {
        section.getHistoricalGrades().then((grades) => setGrades(grades));
    }, [section]);

    if (section.getIsCustom()) {
        return <></>
    }

    return (
        <div className="detail-row">
            <span className="detail-label">Grades:</span>
            {grades && <div style={{ display: "flex", flexDirection: "column" }}>
                <span className="detail-value">
                    {
                        grades?.average ? grades.average.toFixed(2) + " (avg)" : "Data Not Available"
                    }
                </span>
                <span className="detail-value">
                    {
                        grades?.averageFiveYears ? grades.averageFiveYears.toFixed(2) + " (avg past 5 years)" : "Data Not Available"
                    }
                </span></div>}
        </div>
    )
}

const LocationComponent = ({ section, term }: { section: Section; term: number }) => {
    return (
        <div className="detail-row">
            <span className="detail-label">Location:</span>
            <span className="detail-value">
                {section.getLocations([term]).length > 0 ? section.getLocations([term]).join(", ") : "No location found."}
            </span>
        </div>
    )
}

export default SectionDetails