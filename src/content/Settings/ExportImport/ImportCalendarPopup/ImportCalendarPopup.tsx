import './ImportCalendarPopup.css'
import CloseIcon from '../../../Icons/CloseIcon'
import { ISectionData } from '../../../App/App.types';
import { useState } from 'react';

interface IProps {
    onCancel: () => void;
    sections: ISectionData[];
    handleImport: (event: React.ChangeEvent<HTMLInputElement>, worklistNumber: number) => void;
}

const ImportCalendarPopup = ({onCancel, sections, handleImport}:IProps) => {
    const [selectedWorklist, setSelectedWorklist] = useState<number>(0)
    return (
        <div className='ImportCalendarBackground'>
            <div className='ImportCalendarPopup'>
                <div className='ImportCalendarPopupHeader'>
                    <div>Import Worklist</div>
                    <div className='ImportCalendarPopupCloseButton' onClick={(onCancel)}>
                        <CloseIcon size={16} color='white'/>
                    </div>
                </div>
                <div className='ImportCalendarPopupBody'>
                    Choose the worklist to import to: 
                    <div className='ImportCalendarPopupButtonContainer'>
                        <div>Worklist: </div>
                        {[0, 1, 2, 3].map((worklist) => 
                            <div 
                                className='ImportCalendarPopupButton' 
                                style={selectedWorklist === worklist? {backgroundColor: "rgb(156, 232, 255)"}: {}}
                                onClick={() => setSelectedWorklist(worklist)}
                            >
                                {worklist}
                            </div>
                            )
                        }
                    </div>
                    <div className='ImportCalendarButtonContainer'>
                    <div className='ImportCalendarButtonCancel' onClick={onCancel}>Cancel</div>
                    <div className='ImportCalendarButtonConfirm' onClick={() => handleImport}>
                        <input
                        type="file"
                        accept="application/json"
                        onChange={(e) => handleImport(e, selectedWorklist)}
                        style={{ display: 'none' }}
                        id="import-file"
                        />
                        <label htmlFor="import-file">
                        Import Worklists
                        </label>
                    </div>
                </div>
                </div>
            </div>
        </div>
  );
}

export default ImportCalendarPopup