import { ColorTheme } from "../../helpers/courseColors"

interface IThemePickerProps {
    colorTheme: ColorTheme,
    setColorTheme: (theme: ColorTheme) => void
}

const ThemePicker = ({colorTheme, setColorTheme}: IThemePickerProps) => {

return (
    <div style={{width: '50%', display: "flex", margin: '0 auto', marginBottom: '5px'}}>
        <span style={{marginRight: '5px'}}>Theme: </span>
        <select value={colorTheme} onChange={(event) => {
            setColorTheme(event.target.value as unknown as ColorTheme)
        }}>
            {Object.entries(ColorTheme).map(([key, val]) => (
                <option key={key} value={val}>{key}</option>
            ))}
        </select>
    </div>
    )
}

export default ThemePicker