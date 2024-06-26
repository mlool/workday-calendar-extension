import { ColoredRangeDetail } from "../../../components/ColoredRangeDetail"
import "../PopupComponent.css"
interface IProps {
  instructors: string[]
}

const InstructorComponent = ({ instructors }: IProps) => {
  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Instructors:</div>
      <div>
        {instructors && instructors.length > 0 ? (
          <ul>
            {instructors.map((instructor, index) => (
              <ColoredRangeDetail
                key={index}
                label={instructor}
                numericValue={Math.min(index, 5)}
                max={5}
                showRange={true}
              />
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
