import './ExportImportPopup.css'
import CloseIcon from '../../../Icons/CloseIcon'
import { ISectionData } from '../../../App/App.types';
import { useState } from 'react';

interface IProps {
    onCancel: () => void;
    sections: ISectionData[];
    exportFunction: (sections: ISectionData[], worklist: number) => void;
}

const ExportCalendarPopup = ({onCancel, sections, exportFunction}:IProps) => {
    const [selectedWorklist, setSelectedWorklist] = useState<number>(0)
    return (
        <div className='CalendarBackground'>
            <div className='CalendarPopup'>
                <div className='CalendarPopupHeader'>
                    <div>Export Worklist</div>
                    <div className='CalendarPopupCloseButton' onClick={(onCancel)}>
                        <CloseIcon size={16} color='white'/>
                    </div>
                </div>
                <div className='CalendarPopupBody'>
                    Choose the worklist to export from: 
                    <div className='CalendarPopupButtonContainer'>
                        <div>Worklist: </div>
                        {[0, 1, 2, 3].map((worklist) => 
                            <div 
                                className='CalendarPopupButton' 
                                style={selectedWorklist === worklist? {backgroundColor: "rgb(156, 232, 255)"}: {}}
                                onClick={() => setSelectedWorklist(worklist)}
                            >
                                {worklist}
                            </div>
                            )
                        }
                    </div>
                    <div className='CalendarButtonContainer'>
                    <div className='CalendarButtonCancel' onClick={onCancel}>Cancel</div>
                    <div className='CalendarButtonConfirm' onClick={() => exportFunction(sections, selectedWorklist)}>Confirm</div>
                </div>
                </div>
            </div>
        </div>
  );
}

export default ExportCalendarPopup