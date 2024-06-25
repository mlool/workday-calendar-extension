import "../PopupComponent.css"
import { ISectionData } from "../../App/App.types"
interface IProps {
  selectedSection: ISectionData
}

const InstructorComponent = ({ selectedSection }: IProps) => {
  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Instructors:</div>
      <div>
        {selectedSection?.instructors?.length > 0 ? (
          <ul>
            {selectedSection.instructors.map((instructor, index) => (
              <li key={index}>{instructor}</li>
            ))}
          </ul>
        ) : (
          <div>Unavailable</div>
        )}
      </div>
    </div>
  )
}

export default InstructorComponent
