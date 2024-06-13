import "../PopupComponent.css";

interface IProps {
  instructors: string[];
}

const InstructorComponent = ({ instructors }: IProps) => {
  return (
    <div className="ComponentContainer">
      <div className="ComponentTitle">Instructors:</div>
      <div>
        {instructors.length >= 2 ? (
          <ul>
            {instructors.map((instructor, index) => (
              <li key={index}>{instructor}</li>
            ))}
          </ul>
        ) : (
          <div>Unavailable</div>
        )}
      </div>
    </div>
  );
};

export default InstructorComponent;
