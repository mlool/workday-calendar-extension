import { ColorTheme } from "./courseColors"
import "./Settings.css"
import { ISectionData } from "../App/App.types"
import Tools from "./Tools/Tools"
import Theme from "./Theme/Theme"
import ExportImport from "./ExportImport/ExportImport"
import Contact from "./Contact/Contact"
import { filterSectionsByWorklist } from "../utils"

interface ISettingsProps {
  colorTheme: ColorTheme
  sections: ISectionData[]
  currentWorklistNumber: number
  setColorTheme: (theme: ColorTheme) => void
  setSections: (data: ISectionData[]) => void
}

const Settings = ({
  colorTheme,
  sections,
  currentWorklistNumber,
  setColorTheme,
  setSections,
}: ISettingsProps) => {
  return (
    <div>
      <div className="Settings">
        <Theme colorTheme={colorTheme} setColorTheme={setColorTheme} />
        <Tools sections={filterSectionsByWorklist(sections, currentWorklistNumber)}/>
        <ExportImport sections={sections} setSections={setSections} />
        <Contact />
      </div>
    </div>
  )
}

export default Settings
