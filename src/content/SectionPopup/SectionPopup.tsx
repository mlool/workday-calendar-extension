import { ISectionData } from "../App/App.types";
import "./SectionPopup.css";
import GradesComponent from "./GradesComponent/GradesComponent";
import InstructorComponent from "./InstructorComponent/InstructorComponent";
import LocationComponent from "./LocationsComponent/LocationComponent";

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
        {selectedSection?.courseID && (
          <a
            href={`https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$${selectedSection?.courseID}.htmld`}
          >
            <div className="SectionPopupTitle">{selectedSection?.code}</div>
          </a>
        )}
        {!selectedSection?.courseID && (
          <div className="SectionPopupTitle">{selectedSection?.code}</div>
        )}
        <hr />
        <div className="SectionPopupDetails">{selectedSection?.name}</div>
        <InstructorComponent selectedSection={selectedSection} />
        <LocationComponent selectedSection={selectedSection}/>
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
