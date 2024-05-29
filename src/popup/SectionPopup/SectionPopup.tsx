import { ISectionData } from '../App/App.types'
import './SectionPopup.css'

interface IProps {
  selectedSection: ISectionData | null,
  sections: ISectionData[],
  setSections: (data: ISectionData[]) => void,
}

const SectionPopup = ({selectedSection, sections, setSections}:IProps) => {
  return (
    <div className="SectionPopup">
        Hello World
    </div>
  );
}

export default SectionPopup