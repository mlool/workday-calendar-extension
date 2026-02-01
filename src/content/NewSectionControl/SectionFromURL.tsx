
import { fetchSectionFromUrl } from "../../backends/workday/idSearchApi"
import ExtensionStorage from "../../objects/ExtensionStorage"
import "./SectionFromURL.css"
import { useState } from "react"

interface IProps {
    onClose: () => void
}


const SectionFromURL: React.FC<IProps> = ({ onClose }) => {
    const [url, setUrl] = useState("")

    const onClick = () => {
        fetchSectionFromUrl(url).then((section) => {
            if (section) {
                ExtensionStorage.setNewSection(section)
                onClose()
            }
        }).catch((error) => {
            if (error instanceof Error) {
                alert(error.message)
            }
        })
    }

    return (
        <div className="url-popup-overlay" onClick={onClose}>
            <div className="url-popup" onClick={(e) => e.stopPropagation()}>
                <h1>Right click on the course title, select "Copy URL" and paste it here:</h1>
                <div className="url-popup-input-group">
                    <input
                        className="url-popup-input-field"
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        placeholder="e.g. https://wd10.myworkday.com/ubc/d/inst/1$15194/15194$458290.htmld"
                    />
                </div>
                <div className="url-popup-button-row">
                    <button
                        className="section-control-button btn-primary"
                        onClick={onClick}
                    >
                        Add Section
                    </button>
                    <button
                        className="section-control-button btn-secondary"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    )
}

export default SectionFromURL