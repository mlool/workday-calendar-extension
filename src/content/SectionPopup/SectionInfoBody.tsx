import { ISectionData } from "../App/App.types"
import "./SectionInfoBody.css"
import GradesComponent from "./GradesComponent/GradesComponent"
import InstructorComponent from "./InstructorComponent/InstructorComponent"
import LocationComponent from "./LocationsComponent/LocationComponent"

interface SectionInfoProps {
  selectedSection: ISectionData
}

const SectionInfoBody = ({ selectedSection }: SectionInfoProps) => {
  const uniqueLocations = new Set(
    selectedSection.sectionDetails.map((section) => {
      const parts = section.location?.split(/[- ]/) || ""
      if (parts.length > 1) {
        const location = parts[0] + "-" + parts.slice(-1)[0]
        return {
          location: section.location,
          link: `https://learningspaces.ubc.ca/classrooms/${location}`,
        }
      }
    })
  )

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
      <InstructorComponent instructors={selectedSection.instructors} />
      <LocationComponent locations={uniqueLocations} />
      <GradesComponent selectedSection={selectedSection} />
    </div>
  )
}

export default SectionInfoBody
