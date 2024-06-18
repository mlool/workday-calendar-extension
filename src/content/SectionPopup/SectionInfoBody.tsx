import { ISectionData, SupplementaryData } from "../App/App.types";
import { useEffect, useState } from "react";
import "./SectionInfoBody.css";
import GradesComponent from "./GradesComponent/GradesComponent";
import InstructorComponent from "./InstructorComponent/InstructorComponent";
import LocationComponent from "./LocationsComponent/LocationComponent";
import { findSupplementaryData } from "../utils";

interface SectionInfoProps {
  selectedSection: ISectionData;
}

const SectionInfoBody = ({ selectedSection }: SectionInfoProps) => {
  const [isLoading, setIsLoading] = useState(true);
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
    setIsLoading(false);
  }, [selectedSection?.code]);

  return (
    <div className="section-info-body">
      {selectedSection?.courseID && (
        <a
          href={`https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$${selectedSection?.courseID}.htmld`}
        >
          <div className="SectionPopupTitle">{"<< View Course Page >>"}</div>
        </a>
      )}
      <hr />
      <div className="SectionPopupDetails">{selectedSection?.name}</div>
      {isLoading || supplementaryData === null ? (
        <div>Loading Data...</div>
      ) : (
        <>
          <InstructorComponent instructors={supplementaryData.instructors} />
          <LocationComponent locations={supplementaryData.locations} />
        </>
      )}
      <GradesComponent selectedSection={selectedSection} />
    </div>
  );
};

export default SectionInfoBody;
