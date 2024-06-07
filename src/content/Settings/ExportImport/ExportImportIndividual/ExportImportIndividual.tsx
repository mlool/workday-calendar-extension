import { ISectionData } from '../../../App/App.types';
import '../ExportImport.css'
import { useState } from 'react';
import ExportCalendarPopup from '../ExportCalendarPopup/ExportCalendarPopup';
import ImportCalendarPopup from '../ImportCalendarPopup/ImportCalendarPopup';

interface IProps {
  sections: ISectionData[];
  setSections: (data: ISectionData[]) => void;
}

const ExportImportIndividual = ({ sections, setSections }: IProps) => {
  const [showExportPopup, setShowExportPopup] = useState(false);
  const [showImportPopup, setShowImportPopup] = useState(false);

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

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>, worklistNumber: number) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        let newSections = [...sections]
        newSections = newSections.filter((section) => section.worklistNumber !== worklistNumber)
        newSections = newSections.concat(data)
        setSections(newSections);
      } catch (error) {
        console.error('Failed to parse JSON file', error);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div>  
        {showExportPopup && <ExportCalendarPopup onCancel={() => setShowExportPopup(false)} sections={sections} exportFunction={handleExport}/>}
        {showImportPopup && <ImportCalendarPopup onCancel={() => setShowImportPopup(false)} sections={sections} handleImport={handleImport}/>}
        <div className='ExportImportRow'>
          <div className="ExportImportButton" onClick={() => setShowExportPopup(true)}>
              Export Worklists
          </div>
          <div className="ExportImportButton" onClick={() => setShowImportPopup(true)}>
              Import Worklist
          </div>
        </div>
      </div>
  );
};

export default ExportImportIndividual;
