import {Views} from '../App/App.types'
import SettingsIcon from '../Icons/SettingsIcon';
import CalendarIcon from '../Icons/CalendarIcon';

interface IProps {
    currentView: Views,
    setCurrentView: (view: Views) => void;
}

const TopBar = ({currentView, setCurrentView}:IProps) => {
  return (
    <div className="TopBar">
      Hello World
    </div>
  );
}

export default TopBar