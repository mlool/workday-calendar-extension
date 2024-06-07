import './ExportCalendarPopup.css'
import CloseIcon from '../../../Icons/CloseIcon'
import { ISectionData } from '../../../App/App.types';

interface IProps {
    onCancel: () => void;
    exportFunction: (sections: ISectionData[], worklist: number) => void;
}

const ExportCalendarPopup = ({onCancel, exportFunction}:IProps) => {
  return (
    <div className='ExportCalendarBackground'>
        <div className='ExportCalendarPopup'>
            <div className='ExportCalendarPopupHeader'>
                <div className='ExportCalendarPopupCloseButton' onClick={(onCancel)}>
                    <CloseIcon size={16} color='white'/>
                </div>
            </div>
            <div className='ExportCalendarPopupBody'>
                <div className='ExportCalendarPopupBodyContent'>
                    Content Here
                </div>
            </div>
        </div>
    </div>
  );
}

export default ExportCalendarPopup