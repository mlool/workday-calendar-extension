import Schedule from "../../objects/Schedule"
import Section from "../../objects/Section"

interface IProps {
    newSection: Section | null
    schedule: Schedule
    worklist: number
    setNewSection: (section: Section | null) => void
    setSchedule: (schedule: Schedule) => void
}

import "./NewSectionControl.css"

const NewSectionControl: React.FC<IProps> = ({ newSection, schedule, setNewSection, setSchedule, worklist }) => {

    const onClickAddSection = () => {
        if (newSection) {
            newSection.setWorklistNumber(worklist)
            const newSchedule = schedule.addSection(newSection)
            setSchedule(newSchedule)
            newSection.removeFromStorage();
            setNewSection(null)
        }
    }

    return (
        <div className="new-section-control-container">
            {newSection ? (
                <div className="section-info">
                    <div className="section-code">{newSection.getCode()} - {newSection.getSectionCode()}</div>
                    <div className="section-name">{newSection.getName()}</div>
                </div>
            ) : (
                <div className="section-info">
                    <div className="section-code">No Section Selected</div>
                    <div className="section-name">Select a section to add it to your schedule</div>
                </div>
            )}

            {newSection ?
                (
                    <div className="button-row">
                        <button
                            className="section-control-button btn-primary"
                            disabled={!newSection}
                            onClick={() => onClickAddSection()}
                        >
                            Add Section
                        </button>
                        <button
                            className="section-control-button btn-secondary"
                            disabled={!newSection}
                            onClick={() => setNewSection(null)}
                        >
                            Cancel
                        </button>
                    </div>
                ) : (
                    <div className="button-row">
                        <button
                            className="section-control-button btn-primary"
                            onClick={() => onClickAddSection()}
                        >
                            Custom Section
                        </button>
                    </div>
                )}

            {/* <button className="section-control-button btn-custom">
                New Custom Section
            </button> */}
        </div>
    )
}

export default NewSectionControl
