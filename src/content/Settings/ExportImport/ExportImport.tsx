import "../Settings.css"
import "./ExportImport.css"
import ExternalCalendarExport from "./ExternalCalendarExport"
import ExportImportIndividual from "./ExportImportIndividual/ExportImportIndividual"
import { useContext } from "react"
import { ModalDispatchContext, ModalPreset } from "../../ModalLayer"
import ProgressBar from "../../ProgressBar/ProgressBar"
import { ValidVersionData } from "../../../storage/legacyStorageMigrators"
import { VersionWithNoNumber } from "../../../storage/helpers/unnumberedVersionTypeGuards"
import {
  convertSectionDataToJSON,
  loadSectionDataFromJSON,
  readSectionData,
} from "../../../storage/sectionStorage"
import { postAlertIfHasErrors } from "../../../storage/errors"

interface IProps {
  handleImportSections: (
    data: ValidVersionData | VersionWithNoNumber,
    worklistNumber?: number
  ) => Promise<void>
}

const ExportImport = ({ handleImportSections }: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext)

  const handleExport = async () => {
    const res = await readSectionData()
    postAlertIfHasErrors(res)
    const json = convertSectionDataToJSON(res.data)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "schedule.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const loadingMesage = <ProgressBar message={"Loading Progress: "} />
    dispatchModal({
      preset: ModalPreset.ImportStatus,
      additionalData: loadingMesage,
    })
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const rawSections = loadSectionDataFromJSON(e.target?.result as string)
        handleImportSections(rawSections)
      } catch (error) {
        console.error("Failed to parse JSON file", error)
      }
    }
    reader.readAsText(file)
    dispatchExportImportModal(
      "Import Successful! Your courses should now be viewable in your worklist"
    )
  }

  const handleProgressUpdate = (newProgress: number) => {
    const progressEvent = new CustomEvent("progress", {
      detail: {
        progress: newProgress,
      },
    })

    document.dispatchEvent(progressEvent)
  }

  const dispatchExportImportModal = (message: string | Element) => {
    dispatchModal({
      preset: ModalPreset.ImportStatus,
      additionalData: message,
    })
  }

  return (
    <div>
      <div className="SettingsHeader">Export/Import</div>
      <hr className="Divider" />
      <ExportImportIndividual handleImportSections={handleImportSections} />
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
              style={{ display: "none" }}
              id="import-file"
            />
            <label htmlFor="import-file">Import All Worklists</label>
          </div>
        </div>
        <ExternalCalendarExport />
      </div>
    </div>
  )
}

export default ExportImport
