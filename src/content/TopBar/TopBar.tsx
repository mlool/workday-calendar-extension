import {Views} from '../App/App.types'
import SettingsIcon from '../Icons/SettingsIcon';
import CalendarIcon from '../Icons/CalendarIcon';
import ExportIcon from '../Icons/ExportIcon';
import './TopBar.css'
import { ISectionData } from '../App/App.types';

interface IProps {
    setCurrentView: (view: Views) => void;
    sections: ISectionData[];
}

const TopBar = ({setCurrentView, sections }:IProps) => {

  const handleExport = () => {
    const json = JSON.stringify(sections, null, 2);
    const blob = new Blob([json], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="TopBar">
      <div className='TopBarTextContainer'>
        {currentView === Views.calendar? "My Schedule":"Settings"}
      </div>
      <div className='TopBarButtonContainer'>
        <div className="IconContainer" onClick={() => setCurrentView(Views.calendar)}>
          <CalendarIcon size={24} color={'white'} />
        </div>
        <div className="IconContainer" onClick={() => setCurrentView(Views.settings)}>
          <SettingsIcon size={24} color={'white'} />
        </div>
      </div>
      <div className="IconContainer" onClick={handleExport}>
        <ExportIcon size={24} color={'black'} />
      </div>
    </div>
  );
}

export default TopBar