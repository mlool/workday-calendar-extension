import { ISectionData } from "../../../App/App.types"
import "../ExportImport.css"
import { useState, useContext } from "react"
import ExportCalendarPopup from "../ExportImportPopups/ExportCalendarPopup"
import ImportCalendarPopup from "../ExportImportPopups/ImportCalendarPopup"
import { ModalDispatchContext, ModalPreset } from "../../../ModalLayer"

interface IProps {
  sections: ISectionData[]
  setSections: (data: ISectionData[]) => void
  handleSectionImport: (data: ISectionData[]) => void
}

const ExportImportIndividual = ({ sections, handleSectionImport }: IProps) => {
  const [showExportPopup, setShowExportPopup] = useState(false)
  const [showImportPopup, setShowImportPopup] = useState(false)
  const dispatchModal = useContext(ModalDispatchContext)

  const handleExport = (sections: ISectionData[], worklistNumber: number) => {
    sections = sections.filter(
      (section) => section.worklistNumber === worklistNumber
    )
    if (sections.length !== 0) {
      const json = JSON.stringify(sections, null, 2)
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

  const handleImport = (
    event: React.ChangeEvent<HTMLInputElement>,
    worklistNumber: number
  ) => {
    dispatchModal({
      preset: ModalPreset.ImportStatus,
      additionalData: "Loading...",
    })
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        let data: ISectionData[] = JSON.parse(e.target?.result as string)
        let newSections = [...sections]
        newSections = newSections.filter(
          (section) => section.worklistNumber !== worklistNumber
        )
        data = data.map((section) => ({
          code: section.code,
          color: section.color,
          name: section.name,
          sectionDetails: section.sectionDetails,
          worklistNumber: worklistNumber,
          term: section.term,
          instructors: section.instructors,
        }))
        newSections = newSections.concat(data)
        handleSectionImport(newSections)
      } catch (error) {
        console.error("Failed to parse JSON file", error)
      }
    }
    reader.readAsText(file)
  }

  return (
    <div>
      {showExportPopup && (
        <ExportCalendarPopup
          onCancel={() => setShowExportPopup(false)}
          sections={sections}
          exportFunction={handleExport}
        />
      )}
      {showImportPopup && (
        <ImportCalendarPopup
          onCancel={() => setShowImportPopup(false)}
          sections={sections}
          handleImport={handleImport}
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
