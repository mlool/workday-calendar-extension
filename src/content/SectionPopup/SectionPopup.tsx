import { ISectionData, SupplementaryData } from "../App/App.types";
import { useEffect, useState } from "react";
import "./SectionPopup.css";
import GradesComponent from "./GradesComponent/GradesComponent";
import InstructorComponent from "./InstructorComponent/InstructorComponent";
import LocationComponent from "./LocationsComponent/LocationComponent";
import { findSupplementaryData } from "../utils";

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
  const [isLoading, setIsLoading] = useState(false); 
  const [supplementaryData, setSupplementaryData] =
    useState<SupplementaryData | null>(null); 

  useEffect(() => {
    if (selectedSection?.code) {
      setIsLoading(true);
      findSupplementaryData(selectedSection.code)
        .then((response) => {
          setSupplementaryData(response);
        })
        .catch((error) => {
          console.error("Error finding supplementary data:", error);
        })
        .finally(() => setIsLoading(false));
    }
  }, [selectedSection.code]);

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
        {isLoading && <div>Loading Data...</div>}
        {supplementaryData && (
          <>
            <InstructorComponent instructors={supplementaryData.instructors} />
            <LocationComponent locations={supplementaryData.locations} />
          </>
        )}
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
