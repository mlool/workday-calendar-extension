import "../Settings.css"
import "./ExportImport.css"
import ExternalCalendarExport from "./ExternalCalendarExport"
import ExportImportIndividual from "./ExportImportIndividual/ExportImportIndividual"
import { useContext } from "react"
import {
  ModalAction,
  ModalDispatchContext,
  ModalPreset,
} from "../../ModalLayer"
import ProgressBar from "../../ProgressBar/ProgressBar"
import { ValidVersionData } from "../../../storage/legacyStorageMigrators"
import { VersionWithNoNumber } from "../../../storage/helpers/unnumberedVersionTypeGuards"
import {
  convertSectionDataToJSON,
  loadSectionDataFromJSON,
  packageCurrentData,
} from "../../../storage/sectionStorage"
import { postAlertIfHasErrors } from "../../../storage/errors"
import { readSectionData } from "../../../storage/sectionDataBrowserClient"

const handleProgressUpdate = (newProgress: number) => {
  const progressEvent = new CustomEvent("progress", {
    detail: {
      progress: newProgress,
    },
  })

  document.dispatchEvent(progressEvent)
}

const handleSectionImportFromJSON = async (
  inputData: File | undefined,
  modalDispatcher: React.Dispatch<ModalAction>,
  importer: (
    data: ValidVersionData | VersionWithNoNumber,
    worklistNumber?: number
  ) => Promise<void>,
  worklistNumber?: number
) => {
  if (inputData === undefined) return
  const loadingMesage = <ProgressBar message={"Loading Progress: "} />
  modalDispatcher({
    preset: ModalPreset.ImportStatus,
    additionalData: loadingMesage,
  })
  const fileContent = await inputData.text()
  try {
    const rawSections = loadSectionDataFromJSON(fileContent)
    await importer(rawSections, worklistNumber)
  } catch (error) {
    console.error("Failed to parse JSON file", error)
  }
  modalDispatcher({
    preset: ModalPreset.ImportStatus,
    additionalData:
      "Import Successful! Your courses should now be viewable in your worklist",
  })
}

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
    const json = convertSectionDataToJSON(packageCurrentData(res.data))
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "schedule.json"
    link.click()
    URL.revokeObjectURL(url)
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
          <div className="ExportImportButton">
            <input
              type="file"
              accept="application/json"
              onChange={(e) =>
                handleSectionImportFromJSON(
                  e.target.files?.[0],
                  dispatchModal,
                  handleImportSections
                )
              }
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

export { ExportImport, handleProgressUpdate, handleSectionImportFromJSON }
