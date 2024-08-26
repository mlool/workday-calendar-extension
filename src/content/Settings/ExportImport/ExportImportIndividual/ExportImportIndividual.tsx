import "../ExportImport.css"
import { useState, useContext } from "react"
import ExportCalendarPopup from "../ExportImportPopups/ExportCalendarPopup"
import ImportCalendarPopup from "../ExportImportPopups/ImportCalendarPopup"
import { ModalDispatchContext } from "../../../ModalLayer"
import { ValidVersionData } from "../../../../storage/legacyStorageMigrators"
import { VersionWithNoNumber } from "../../../../storage/helpers/unnumberedVersionTypeGuards"
import {
  convertSectionDataToJSON,
  packageCurrentData,
} from "../../../../storage/sectionStorage"
import { postAlertIfHasErrors } from "../../../../storage/errors"
import { handleSectionImportFromJSON } from "../ExportImport"
import { readSectionData } from "../../../../storage/sectionDataBrowserClient"

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

  const handleExport = async (worklistNumber: number) => {
    const res = await readSectionData()
    postAlertIfHasErrors(res)
    const sections = res.data.filter(
      (section) => section.worklistNumber === worklistNumber
    )
    if (sections.length !== 0) {
      const json = convertSectionDataToJSON(packageCurrentData(res.data))
      const blob = new Blob([json], { type: "application/json" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = "schedule.json"
      link.click()
      URL.revokeObjectURL(url)
    } else {
      alert("Please Select A Worklist That Is Not Empty!")
    }
  }

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
