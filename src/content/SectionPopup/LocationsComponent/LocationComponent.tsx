import { ISectionData } from "../../App/App.types";
import "../SectionComponent.css";

interface IProps {
    selectedSection: ISectionData
}

const LocationComponenent = ({ selectedSection }: IProps) => {
    const uniqueLocations = new Set(selectedSection.sectionDetails.map(section => section.location));

    return (
        <div className="ComponentContainer">
          <div className="ComponentTitle">Locations:</div>
          {
            Array.from(uniqueLocations).map((location) => (
              <div key={location}>
                {location && `${location}`}
              </div>
            ))
          }
        </div>
      );
}

export default LocationComponenent;