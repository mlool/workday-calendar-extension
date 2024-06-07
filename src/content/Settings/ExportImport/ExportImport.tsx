
import { ISectionData } from '../../App/App.types';
import '../Settings.css';
import './ExportImport.css'
import ExternalCalendarExport from './ExternalCalendarExport/ExternalCalendarExport';

interface IProps {
  sections: ISectionData[];
  onImport: (data: ISectionData[]) => void;
}

const ExportImport = ({ sections, onImport }: IProps) => {

  const handleExport = () => {
    const json = JSON.stringify(sections, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'schedule.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        onImport(data);
      } catch (error) {
        console.error('Failed to parse JSON file', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>
        <div className="SettingsHeader">Export/Import</div>
        <hr className='Divider' />
        <div className="ExportImportButtonContainer">
          <div className="ExportImportRow">  
            <div className="ExportImportButton" onClick={handleExport}>
              Export All Worklists
            </div>
            <div className="ExportImportButton" onClick={() => handleImport}>
              <input
                type="file"
                accept="application/json"
                onChange={handleImport}
                style={{ display: 'none' }}
                id="import-file"
              />
              <label htmlFor="import-file">
                Import All Worklists
              </label>
            </div>
          </div>
          <ExternalCalendarExport sections={sections}/>
        </div>
      </div>
  );
};

export default ExportImport;
