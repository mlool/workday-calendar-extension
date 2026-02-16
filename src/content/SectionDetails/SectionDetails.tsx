import { useEffect, useState } from "react";
import Section from "../../objects/Section"
import { IGradesAPIData } from "../../objects/Section"
import "./SectionDetails.css"
import CloseIcon from "../Icons/CloseIcon";
import ExternalLinkIcon from "../Icons/ExternalLinkIcon";
import { RMPData } from "../../backends/rateMyProf/rateMyProf";
import Browser from "webextension-polyfill"


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
    const [rmpRatings, setRmpRatings] = useState<Record<string, RMPData | null>>()
    useEffect(() => {
        populateRmpRatings()
    }, [])

    const populateRmpRatings = async () => {
        const fetches = []
        const instructors = section.getInstructors()
        const isVancouver = section.getCode().includes("_V")
        for (const prof of instructors) {
            fetches.push(
                // cannot directly fetch from RMP here - fetching
                // from the service worker with the right
                // host_permissions allows us to bypass CORS.
                Browser.runtime.sendMessage({
                    type: "RMP",
                    prof: prof,
                    isVancouver: isVancouver,
                })
            )
        }
        const results = await Promise.all(fetches)
        const ratings = results.reduce<Record<string, RMPData>>(
            (acc, item, index) => {
                acc[instructors[index]] = item
                return acc
            },
            {}
        )
        setRmpRatings(ratings)
    }

    const Rating = ({ instructor, rating }: { instructor: string, rating: number | undefined }) => {
        return <div className="detail-link">
            {rating ? rating + "/5" : "N/A"}
            <ExternalLinkIcon size={14} href={rmpRatings?.[instructor]?.link ?? `https://www.google.com/search?q=${instructor + " UBC"}`} />
        </div>
    }

    return (
        <div className="detail-section">
            <div className="detail-header">Instructors</div>
            {section.getInstructors().length > 0 ? (
                section.getInstructors().map((instructor, index) => (
                    <div className="detail-row" key={index}>
                        <span className="detail-value">{instructor}</span>
                        <Rating instructor={instructor} rating={rmpRatings?.[instructor]?.rating} />
                    </div>
                ))
            ) : (
                <div className="detail-row">
                    <span className="detail-value">No instructor found.</span>
                </div>
            )}
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
        <div className="detail-section">
            <div className="detail-header">Grades</div>
            {grades ? (
                <>
                    <div className="detail-row">
                        <span className="detail-value">Average (All Years)</span>
                        <div className="detail-link">{grades.average ? grades.average.toFixed(2) + "%" : "N/A"} <ExternalLinkIcon size={14} href={section.getGradesUrl()} /></div>
                    </div>
                    <div className="detail-row">
                        <span className="detail-value">Average (5 Years)</span>
                        <div className="detail-link">{grades.averageFiveYears ? grades.averageFiveYears.toFixed(2) + "%" : "N/A"} <ExternalLinkIcon size={14} href={section.getGradesUrl()} /></div>
                    </div>
                </>
            ) : (
                <div className="detail-row">
                    <span className="detail-value">No historical grades found.</span>
                </div>
            )}
        </div>
    )
}

const LocationComponent = ({ section, term }: { section: Section; term: number }) => {
    const locations = section.getLocations([term]);
    return (
        <div className="detail-section">
            <div className="detail-header">Location</div>
            {locations.length > 0 ? (
                locations.map((loc, index) => (
                    <div className="detail-row" key={index}>
                        <span className="detail-value" style={{ flex: 2 }}>{loc}</span>
                    </div>
                ))
            ) : (
                <div className="detail-row">
                    <span className="detail-value">No location found.</span>
                </div>
            )}
        </div>
    )
}

export default SectionDetails