import { ISectionData } from "../App/App.types"
import "./SectionInfoBody.css"
import GradesComponent from "./GradesComponent/GradesComponent"
import InstructorComponent from "./InstructorComponent/InstructorComponent"
import LocationComponent from "./LocationsComponent/LocationComponent"

interface SectionInfoProps {
  selectedSection: ISectionData
}

const SectionInfoBody = ({ selectedSection }: SectionInfoProps) => {
  const filteredLocations: string[] = []

  const filterLocations = selectedSection.sectionDetails.reduce(
    (acc: string[], currentValue) => {
      if (currentValue.location) {
        const location = currentValue.location
        if (!acc.includes(location)) {
          acc.push(location)
        }
      }
      return acc
    },
    filteredLocations
  )

  const uniqueLocations = new Set(
    filterLocations.map((location) => {
      const parts = location.split(/[- ]/) || ""
      if (parts.length > 1) {
        const urlFormattedLocation = parts[0] + "-" + parts.slice(-1)[0]
        return {
          location: location,
          link: `https://learningspaces.ubc.ca/classrooms/${urlFormattedLocation}`,
        }
      }
    })
  )

  return (
    <div className="section-info-body">
      {selectedSection.courseID && (
        <a
          href={`https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$${selectedSection.courseID}.htmld`}
        >
          <div className="SectionPopupTitle">{"<< View Course Page >>"}</div>
        </a>
      )}
      <hr />
      <div className="SectionPopupDetails">{selectedSection.name}</div>
      <InstructorComponent
        instructors={selectedSection.instructors?.filter(Boolean)}
        isVancouver={selectedSection.code.includes("_V")}
      />
      <LocationComponent locations={uniqueLocations} />
      <GradesComponent sectionCode={selectedSection.code} />
    </div>
  )
}

export default SectionInfoBody
