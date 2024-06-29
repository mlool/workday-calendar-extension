import { ColorTheme } from "./courseColors"
import "./Settings.css"
import { ISectionData, Term } from "../App/App.types"
import Tools from "./Tools/Tools"
import Theme from "./Theme/Theme"
import ExportImport from "./ExportImport/ExportImport"
import Contact from "./Contact/Contact"
import { filterSections } from "../utils"

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
  currentWorklistNumber,
  currentTerm,
  setColorTheme,
  setSections,
}: ISettingsProps) => {
  return (
    <div>
      <div className="Settings">
        <Theme colorTheme={colorTheme} setColorTheme={setColorTheme} />
        <Tools
          sections={filterSections(
            sections,
            currentWorklistNumber,
            currentTerm
          )}
        />
        <ExportImport sections={sections} setSections={setSections} />
        <Contact />
      </div>
    </div>
  )
}

export default Settings
