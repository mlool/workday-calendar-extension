import { ISectionData } from "../../App/App.types";
import "../PopupComponent.css";

interface IProps {
    selectedSection: ISectionData
}

const LocationComponent = ({ selectedSection }: IProps) => {
  const uniqueLocations = new Set(
    selectedSection.sectionDetails.map((section) => {
      const parts = section.location?.split(/[- ]/) || ""; 
      if (parts.length > 1) { 
        const location = parts[0] + "-" + parts.slice(-1)[0];
        return {
          location: section.location,
          link: `https://learningspaces.ubc.ca/classrooms/${location}`,
        };
      } else {
        return {
          location: section.location,
          link: "", 
        };
      }
    })
  );

  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Locations:</div>
      {Array.from(uniqueLocations).map((locationObj) => (
        <div key={locationObj.location}>
          <a href={locationObj.link} target="_blank" rel="noopener noreferrer">
            {locationObj.location}
          </a>
        </div>
      ))}
    </div>
  );
};


export default LocationComponent;