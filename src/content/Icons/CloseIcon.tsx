import { useState } from "react"

interface IProps {
  size: number
  onClose: () => void
}

const color = "#555555"
const hoverColor = "#333333"

const CloseIcon = ({ size, onClose }: IProps) => {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClose}
      style={{ cursor: "pointer" }}
    >
      <path
        d="M3 21.32L21 3.32001"
        stroke={isHovered ? hoverColor : color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 3.32001L21 21.32"
        stroke={isHovered ? hoverColor : color}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export default CloseIcon
