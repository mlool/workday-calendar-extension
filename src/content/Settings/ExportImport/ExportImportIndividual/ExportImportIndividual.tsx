import "../ExportImport.css"
import { useState, useContext } from "react"
import ExportCalendarPopup from "../ExportImportPopups/ExportCalendarPopup"
import ImportCalendarPopup from "../ExportImportPopups/ImportCalendarPopup"
import { ModalDispatchContext } from "../../../ModalLayer"
import { ValidVersionData } from "../../../../storage/legacyStorageMigrators"
import { VersionWithNoNumber } from "../../../../storage/helpers/unnumberedVersionTypeGuards"
import { handleExport, handleSectionImportFromJSON } from "../ExportImport"

interface IProps {
  handleImportSections: (
    data: ValidVersionData | VersionWithNoNumber,
    worklistNumber?: number
  ) => Promise<void>
}

const ExportImportIndividual = ({ handleImportSections }: IProps) => {
  const [showExportPopup, setShowExportPopup] = useState(false)
  const [showImportPopup, setShowImportPopup] = useState(false)
  const dispatchModal = useContext(ModalDispatchContext)

  return (
    <div>
      {showExportPopup && (
        <ExportCalendarPopup
          onCancel={() => setShowExportPopup(false)}
          exportFunction={handleExport}
        />
      )}
      {showImportPopup && (
        <ImportCalendarPopup
          onCancel={() => setShowImportPopup(false)}
          handleImport={(file, worklistNumber) =>
            handleSectionImportFromJSON(
              file,
              dispatchModal,
              handleImportSections,
              worklistNumber
            )
          }
        />
      )}
      <div className="ExportImportRow">
        <div
          className="ExportImportButton"
          onClick={() => setShowExportPopup(true)}
        >
          Export Worklist
        </div>
        <div
          className="ExportImportButton"
          onClick={() => setShowImportPopup(true)}
        >
          Import Worklist
        </div>
      </div>
    </div>
  )
}

export default ExportImportIndividual
