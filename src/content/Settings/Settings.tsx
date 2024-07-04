import { ColorTheme } from "./Theme/courseColors"
import "./Settings.css"
import { ISectionData, Term } from "../App/App.types"
import Tools from "./Tools/Tools"
import Theme from "./Theme/Theme"
import ExportImport from "./ExportImport/ExportImport"
import Contact from "./Contact/Contact"
import WorklistActions from "./WorklistActions/WorklistActions"

interface ISettingsProps {
  colorTheme: ColorTheme
  sections: ISectionData[]
  currentWorklistNumber: number
  currentTerm: Term
  setColorTheme: (theme: ColorTheme) => void
  setSections: (data: ISectionData[]) => void
}

const Settings = ({
  colorTheme,
  sections,
  setColorTheme,
  setSections,
}: ISettingsProps) => {
  return (
    <div className="Settings">
      <Theme colorTheme={colorTheme} setColorTheme={setColorTheme} />
      <Tools />
      <ExportImport sections={sections} setSections={setSections} />
      <WorklistActions sections={sections} />
      <Contact />
    </div>
  )
}

export default Settings
