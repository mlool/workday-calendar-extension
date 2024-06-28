import { ISectionData } from "../../App/App.types"
import "../Settings.css"
import "./ExportImport.css"
import ExternalCalendarExport from "./ExternalCalendarExport/ExternalCalendarExport"
import ExportImportIndividual from "./ExportImportIndividual/ExportImportIndividual"
import { findCourseId } from "../../../backends/scheduler/nameSearchApi"
import { useContext } from "react"
import { ModalDispatchContext, ModalPreset } from "../../ModalLayer"

interface IProps {
  sections: ISectionData[]
  setSections: (data: ISectionData[]) => void
}

const ExportImport = ({ sections, setSections }: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext)

  const handleExport = () => {
    const json = JSON.stringify(sections, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "schedule.json"
    link.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    dispatchExportImportModal("Loading...")
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string)
        handleSectionImport(data)
      } catch (error) {
        console.error("Failed to parse JSON file", error)
      }
    }
    reader.readAsText(file)
  }

  const handleProgressUpdate = (newProgress: number) => {
    const progressEvent = new CustomEvent("progress", {
      detail: {
        progress: newProgress,
      },
    })

    document.dispatchEvent(progressEvent)
  }

  const handleSectionImport = async (sections: ISectionData[]) => {
    const fetchedCourseIDs: string[] = []
    const sectionsCount = sections.filter((section) => !section.courseID).length
    await sections.reduce(async (promise, section) => {
      await promise
      if (!section.courseID) {
        const courseID = await findCourseId(section.code)
        if (!courseID) {
          return
        }
        fetchedCourseIDs.push(courseID)
        handleProgressUpdate(fetchedCourseIDs.length / sectionsCount)
      }
    }, Promise.resolve())

    const newSections = sections.map((s) => {
      if (s.courseID) return s
      return {
        ...s,
        courseID: fetchedCourseIDs.shift(),
      }
    })

    setSections(newSections)
    dispatchExportImportModal(
      "Import Successful! Your courses should now be viewable in your worklist"
    )
  }

  const dispatchExportImportModal = (message: string) => {
    dispatchModal({
      preset: ModalPreset.ImportStatus,
      additionalData: message,
    })
  }

  return (
    <div>
      <div className="SettingsHeader">Export/Import</div>
      <hr className="Divider" />
      <ExportImportIndividual
        sections={sections}
        setSections={setSections}
        handleSectionImport={handleSectionImport}
      />
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
        <ExternalCalendarExport sections={sections} />
      </div>
    </div>
  )
}

export default ExportImport
