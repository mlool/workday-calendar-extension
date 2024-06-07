import { ISectionData } from '../../../App/App.types';
import './ExportIndividualWorklist.css'
import '../ExportImport.css'
import { useState } from 'react';
import ExportCalendarPopup from '../ExportCalendarPopup/ExportCalendarPopup';

interface IProps {
  sections: ISectionData[];
  onImport: (data: ISectionData[]) => void;
}

const ExportImport = ({ sections, onImport }: IProps) => {
  const [showPopup, setShowPopup] = useState(true);

  const handleExport = (sections: ISectionData[], worklistNumber: number) => {
    sections = sections.filter((section) => section.worklistNumber === worklistNumber)
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
        {showPopup && <ExportCalendarPopup onCancel={() => setShowPopup(false)} sections={sections} exportFunction={handleExport}/>}
        <div className="ExportImportButton" onClick={() => setShowPopup(true)}>
            Export Worklists
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
            Import Worklists
            </label>
        </div>
      </div>
  );
};

export default ExportImport;
