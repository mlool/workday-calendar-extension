import {Views} from '../App/App.types'
import SettingsIcon from '../Icons/SettingsIcon';
import CalendarIcon from '../Icons/CalendarIcon';
import './TopBar.css'

interface IProps {
    currentView: Views,
    setCurrentView: (view: Views) => void;
}

const TopBar = ({currentView, setCurrentView}:IProps) => {
  return (
    <div className="TopBar">
      <div className="IconContainer" onClick={() => setCurrentView(Views.calendar)}>
        <CalendarIcon size={24} color={'black'} />
      </div>
      <div className="IconContainer" onClick={() => setCurrentView(Views.settings)}>
        <SettingsIcon size={24} color={'black'} />
      </div>
    </div>
  );
}

export default TopBar