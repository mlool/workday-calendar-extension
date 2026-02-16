import { useState } from "react"

interface IProps {
    size: number
    onClick: () => void
}

const color = "#252525ff"
const hoverColor = "#0a0a0aff"

const InfoSquareIcon = ({ size, onClick }: IProps) => {
    const [isHovered, setIsHovered] = useState(false)

    return (
        <svg
            width={`${size}px`}
            height={`${size}px`}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            onClick={onClick}
            style={{ cursor: "pointer" }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <path
                d="M12 17V11"
                stroke={isHovered ? hoverColor : color}
                fill="none"
                strokeWidth="1.5"
                strokeLinecap="round"
            />
            <circle
                cx="1"
                cy="1"
                r="1"
                transform="matrix(1 0 0 -1 11 9)"
                fill={isHovered ? hoverColor : color}
            />
            <path
                d="M2 12C2 7.28595 2 4.92893 3.46447 3.46447C4.92893 2 7.28595 2 12 2C16.714 2 19.0711 2 20.5355 3.46447C22 4.92893 22 7.28595 22 12C22 16.714 22 19.0711 20.5355 20.5355C19.0711 22 16.714 22 12 22C7.28595 22 4.92893 22 3.46447 20.5355C2 19.0711 2 16.714 2 12Z"
                stroke={isHovered ? hoverColor : color}
                fill="none"
                strokeWidth="1.5"
            />
        </svg>
    )
}

export default InfoSquareIcon
