import { ISectionData, Term } from '../App/App.types'
import './SectionPopup.css'

interface IProps {
  selectedSection: ISectionData | null,
  sections: ISectionData[],
  setSections: (data: ISectionData[]) => void,
  setSelectedSection: (state: ISectionData | null) => void,
  curentTerm: Term
}

const SectionPopup = ({selectedSection, sections, setSections, setSelectedSection, curentTerm}:IProps) => {

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
                {/* {
                    selectedSection?.sectionDetails.map((detail) => {
                        return detail.term !== curentTerm ? <div className='SectionPopupDetails'>
                            {`${detail.location} | ${detail.days.join(' ')} | ${detail.startTime} - ${detail.endTime}`}
                            </div> : null
                    })
                } */}
            </div>
            <div className='SectionPopupButtonContainer'>
                <button className='SectionPopupCancelButton' onClick={() => setSelectedSection(null)}>Close</button>
                <button className='SectionPopupButton' onClick={removeSection}>Remove</button>
            </div>
        </div>
  );
}

export default SectionPopup