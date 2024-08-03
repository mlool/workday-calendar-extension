import { ColorTheme } from "./Theme/courseColors"
import "./Settings.css"
import { ISectionData } from "../App/App.types"
import Tools from "./Tools/Tools"
import Theme from "./Theme/Theme"
import ExportImport from "./ExportImport/ExportImport"
import Contact from "./Contact/Contact"
import WorklistActions from "./WorklistActions/WorklistActions"
import { ValidVersionData } from "../../storage/legacyStorageMigrators"
import { VersionWithNoNumber } from "../../storage/helpers/unnumberedVersionTypeGuards"

interface ISettingsProps {
  colorTheme: ColorTheme
  sections: ISectionData[]
  setColorTheme: (theme: ColorTheme) => void
  handleImportSections: (
    data: ValidVersionData | VersionWithNoNumber,
    worklistNumber?: number
  ) => Promise<void>
}

const Settings = ({
  colorTheme,
  sections,
  setColorTheme,
  handleImportSections,
}: ISettingsProps) => {
  return (
    <div className="Settings">
      <Theme colorTheme={colorTheme} setColorTheme={setColorTheme} />
      <Tools />
      <ExportImport handleImportSections={handleImportSections} />
      <WorklistActions sections={sections} />
      <Contact />
    </div>
  )
}

export default Settings
