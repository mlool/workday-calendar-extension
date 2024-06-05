import { ISectionData } from "../../App/App.types";
import GradesComponent from "../GradesComponent/GradesComponent";
import "./InstructorComponent.css";

interface IProps {
  selectedSection: ISectionData;
  sections: ISectionData[];
  setSections: (data: ISectionData[]) => void;
  setSelectedSection: (state: ISectionData | null) => void;
}

const InstructorComponent = ({
  selectedSection,
}: IProps) => {
    return (
        <div>
            <div className="SectionPopupInstructor">Instructors:</div>
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
};

export default InstructorComponent;
