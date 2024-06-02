import { ISectionData } from '../App/App.types'
import { getGradesUrl } from '../Calendar/utils'
import './SectionPopup.css'

interface IProps {
  selectedSection: ISectionData,
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

    const gradesURL = getGradesUrl(selectedSection)

    return (
        <div className="SectionPopup">
            <div>
                <div className='SectionPopupTitle'>{selectedSection?.code}</div>
                <hr />
                <div className='SectionPopupDetails'>{selectedSection?.name}</div>
                <div className='SectionPopupDetails'>{selectedSection?.location}</div>
                <a href={gradesURL} target="_blank">View grades</a>
            </div>
            <div className='SectionPopupButtonContainer'>
                <button className='SectionPopupCancelButton' onClick={() => setSelectedSection(null)}>Close</button>
                <button className='SectionPopupButton' onClick={removeSection}>Remove</button>
            </div>
        </div>
  );
}

export default SectionPopup