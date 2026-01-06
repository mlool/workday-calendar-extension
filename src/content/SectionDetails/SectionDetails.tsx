import Section from "../../objects/Section"
import "./SectionDetails.css"

interface IProps {
    section: Section;
    onClose: () => void;
    onDelete: (section: Section) => void;
}

const SectionDetails = ({ section, onClose, onDelete }: IProps) => {
    return (
        <div className="section-details-overlay" onClick={onClose}>
            <div className="section-details-popup" onClick={(e) => e.stopPropagation()}>
                <div className="popup-header">
                    <h2 className="popup-title">{section.getCode() + (section.getSectionCode() ? " - " + section.getSectionCode() : "")}</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                </div>
                <div className="popup-content">
                    <div className="detail-row">
                        <span className="detail-label">Name:</span>
                        <span className="detail-value">{section.getName()}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Format:</span>
                        <span className="detail-value">{section.getFormat()}</span>
                    </div>
                    <div className="detail-row">
                        <span className="detail-label">Instructors:</span>
                        <span className="detail-value">{section.getInstructors().join(", ")}</span>
                    </div>
                    <div className="detail-row">
                        <button onClick={() => { onDelete(section); onClose() }}>Delete</button>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default SectionDetails