import "../Settings.css"
import "./ExportImport.css"
import ExternalCalendarExport from "./ExternalCalendarExport"
import ExportImportIndividual from "./ExportImportIndividual/ExportImportIndividual"
import { useContext } from "react"
import { ModalDispatchContext } from "../../ModalLayer"
import { postAlertIfHasErrors } from "../../../storage/errors"
import {
  downloadSectionsAsJSON,
  readSectionData,
  SectionImporter,
} from "../../../storage/sectionDataBrowserClient"

const handleProgressUpdate = (newProgress: number) => {
  const progressEvent = new CustomEvent("progress", {
    detail: {
      progress: newProgress,
    },
  })

  document.dispatchEvent(progressEvent)
}

const handleExport = async (worklistNumber?: number) => {
  const res = await readSectionData()
  postAlertIfHasErrors(res)
  downloadSectionsAsJSON(res.data, worklistNumber)
}

interface IProps {
  handleImportSections: SectionImporter
}

const ExportImport = ({ handleImportSections }: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext)

  return (
    <div>
      <div className="SettingsHeader">Export/Import</div>
      <hr className="Divider" />
      <ExportImportIndividual handleImportSections={handleImportSections} />
      <div className="ExportImportButtonContainer">
        <div className="ExportImportRow">
          <div className="ExportImportButton" onClick={() => handleExport()}>
            Export All Worklists
          </div>
          <div className="ExportImportButton">
            <input
              type="file"
              accept="application/json"
              onChange={async (e) =>
                handleImportSections(
                  await e.target.files?.[0].text(),
                  dispatchModal
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

export { ExportImport, handleProgressUpdate, handleExport }
