import { ISectionData } from "../App/App.types"
import "./SectionInfoBody.css"
import GradesComponent from "./GradesComponent/GradesComponent"
import InstructorComponent from "./InstructorComponent/InstructorComponent"
import LocationComponent from "./LocationsComponent/LocationComponent"

interface SectionInfoProps {
  selectedSection: ISectionData
}

const SectionInfoBody = ({ selectedSection }: SectionInfoProps) => {
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
      <InstructorComponent selectedSection={selectedSection} />
      <LocationComponent selectedSection={selectedSection} />
      <GradesComponent selectedSection={selectedSection} />
    </div>
  )
}

export default SectionInfoBody
