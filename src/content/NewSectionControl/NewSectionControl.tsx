import Schedule from "../../objects/Schedule";
import Section from "../../objects/Section";
import SectionFromURL from "./SectionFromURL";

interface IProps {
  newSection: Section | null;
  schedule: Schedule;
  worklist: number;
  setNewSection: (section: Section | null) => void;
  setSchedule: (schedule: Schedule) => void;
  onStartCreateCustom: () => void;
}

import "./NewSectionControl.css";
import { useState } from "react";

const NewSectionControl: React.FC<IProps> = ({
  newSection,
  schedule,
  setNewSection,
  setSchedule,
  worklist,
  onStartCreateCustom,
}: IProps) => {
  const [showSectionFromURL, setShowSectionFromURL] = useState(false);

  const onClickAddSection = async () => {
    if (newSection) {
      newSection.setWorklistNumber(worklist);
      try {
        const newSchedule = await schedule.addSection(newSection);
        setSchedule(newSchedule);
        setNewSection(null);
      } catch (error) {
        if (error instanceof Error) {
          alert(error.message);
        }
      }
    }
  };

  const onClickCancel = () => {
    setNewSection(null);
  };

  return (
    <div className="new-section-control-container">
      {showSectionFromURL && (
        <SectionFromURL onClose={() => setShowSectionFromURL(false)} />
      )}
      {newSection ? (
        <div className="section-info">
          <div className="section-code">{newSection.getFullSectionCode()}</div>
          <div className="section-name">{newSection.getName()}</div>
        </div>
      ) : (
        <div className="section-info">
          <div className="section-code">No Section Selected</div>
          <div className="section-name">
            Select a section to add it to your schedule
          </div>
        </div>
      )}

      {newSection ? (
        <div className="button-row">
          <button
            className="section-control-button btn-primary"
            disabled={!newSection}
            onClick={onClickAddSection}
          >
            Add Section
          </button>
          <button
            className="section-control-button btn-secondary"
            disabled={!newSection}
            onClick={onClickCancel}
          >
            Cancel
          </button>
        </div>
      ) : (
        <div className="button-row">
          <button
            className="section-control-button btn-primary"
            onClick={() => setShowSectionFromURL(true)}
          >
            From URL
          </button>
          <button
            className="section-control-button btn-primary"
            onClick={() => onStartCreateCustom()}
          >
            Custom Section
          </button>
        </div>
      )}

      {/* <button className="section-control-button btn-custom">
                New Custom Section
            </button> */}
    </div>
  );
};

export default NewSectionControl;
