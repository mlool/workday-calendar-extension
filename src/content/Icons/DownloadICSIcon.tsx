import { useState } from "react"

interface IProps {
    size: number,
    disabled: boolean,
    onClick: () => void
}

const colorHover = "#ffffffff"
const color = "#efefefff"

const DownloadICSIcon = ({ size, disabled, onClick }: IProps) => {
    const [hovered, setHovered] = useState(false)
    if (disabled) return <></>
    return (
        <svg width={`${size}px`} height={`${size}px`}
            viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            onClick={onClick}
        >
            <path d="M20 10V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V10M20 10H4M20 10V11.75M4 10V19C4 20.1046 4.89543 21 6 21H12M8 3V7M16 3V7"
                stroke={hovered ? colorHover : color}
                strokeWidth="2"
                strokeLinecap="round"
            />
            <path d="M18 15V21M18 21L15.5 18.5M18 21L20.5 18.5"
                stroke={hovered ? colorHover : color}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    )
}

export default DownloadICSIcon
