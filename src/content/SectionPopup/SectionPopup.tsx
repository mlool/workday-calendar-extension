import { ISectionData } from "../App/App.types";
import "./SectionPopup.css";
import GradesComponent from "./GradesComponent/GradesComponent";

interface IProps {
  selectedSection: ISectionData;
  sections: ISectionData[];
  setSections: (data: ISectionData[]) => void;
  setSelectedSection: (state: ISectionData | null) => void;
}

const SectionPopup = ({
  selectedSection,
  sections,
  setSections,
  setSelectedSection,
}: IProps) => {
  const removeSection = () => {
    let updatedSections = [...sections];
    updatedSections = updatedSections.filter(
      (section) => section !== selectedSection
    );
    setSections(updatedSections);
    setSelectedSection(null);
  };

  return (
    <div className="SectionPopup">
      <div>
        <div className="SectionPopupTitle">{selectedSection?.code}</div>
        <hr />
        <div className="SectionPopupDetails">{selectedSection?.name}</div>
        <div className="SectionPopupInstructor">Instructor: </div>
        <div>{selectedSection?.instructor || "Unavailable"}</div>
        {/* <div className="SectionPopupDetails">{selectedSection?.location}</div> */}
        <GradesComponent selectedSection={selectedSection} />
      </div>
      <div className="SectionPopupButtonContainer">
        <button
          className="SectionPopupCancelButton"
          onClick={() => setSelectedSection(null)}
        >
          Close
        </button>
        <button className="SectionPopupButton" onClick={removeSection}>
          Remove
        </button>
      </div>
    </div>
  );
};

export default SectionPopup;
