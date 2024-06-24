import './ExportCalendarPopup.css'
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
        <div className='ExportCalendarBackground'>
            <div className='ExportCalendarPopup'>
                <div className='ExportCalendarPopupHeader'>
                    <div>Export Worklist</div>
                    <div className='ExportCalendarPopupCloseButton' onClick={(onCancel)}>
                        <CloseIcon size={16} color='white'/>
                    </div>
                </div>
                <div className='ExportCalendarPopupBody'>
                    Choose the worklist to export from: 
                    <div className='ExportCalendarPopupButtonContainer'>
                        <div>Worklist: </div>
                        {[0, 1, 2, 3].map((worklist) => 
                            <div 
                                className='ExportCalendarPopupButton' 
                                style={selectedWorklist === worklist? {backgroundColor: "rgb(156, 232, 255)"}: {}}
                                onClick={() => setSelectedWorklist(worklist)}
                            >
                                {worklist}
                            </div>
                            )
                        }
                    </div>
                    <div className='ExportCalendarButtonContainer'>
                    <div className='ExportCalendarButtonCancel' onClick={onCancel}>Cancel</div>
                    <div className='ExportCalendarButtonConfirm' onClick={() => exportFunction(sections, selectedWorklist)}>Confirm</div>
                </div>
                </div>
            </div>
        </div>
  );
}

export default ExportCalendarPopup