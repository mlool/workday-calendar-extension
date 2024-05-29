import { ISectionData } from '../App/App.types'
import './SectionPopup.css'

interface IProps {
  selectedSection: ISectionData | null,
  sections: ISectionData[],
  setSections: (data: ISectionData[]) => void,
  setSelectedSection: (state: ISectionData | null) => void,
}

const SectionPopup = ({selectedSection, sections, setSections, setSelectedSection}:IProps) => {

    const removeSection = () => {
        let updatedSections = [...sections]
        updatedSections = updatedSections.filter((section) => section !== selectedSection)
        setSections(updatedSections)
        setSelectedSection(null)
    }

    return (
        <div className="SectionPopup">
            <div>
                <div className='SectionPopupTitle'>{selectedSection?.code}</div>
                <hr />
                <div className='SectionPopupDetails'>{selectedSection?.name}</div>
                <div className='SectionPopupDetails'>{selectedSection?.location}</div>
            </div>
            <div className='SectionPopupButtonContainer'>
                <button className='SectionPopupButton' onClick={removeSection}>Remove Section</button>
                <button className='SectionPopupButton' onClick={() => setSelectedSection(null)}>Close</button>
            </div>
        </div>
  );
}

export default SectionPopup