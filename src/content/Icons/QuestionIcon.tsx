interface IProps {
  size: number
}

const QuestionIcon = ({ size }: IProps) => {
  return (
    <svg
      width={`${size}px`}
      height={`${size}px`}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g clip-path="url(#clip0_429_11043)">
        <circle
          cx="12"
          cy="11.9999"
          r="9"
          stroke="#292929"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
        <rect
          x="12"
          y="16"
          width="0.01"
          height="0.01"
          stroke="#292929"
          stroke-width="3.75"
          stroke-linejoin="round"
        />
        <path
          d="M10.5858 7.58572C10.9754 7.1961 11.4858 7.00083 11.9965 6.99994C12.5095 6.99904 13.0228 7.1943 13.4142 7.58572C13.8047 7.97625 14 8.48809 14 8.99994C14 9.51178 13.8047 10.0236 13.4142 10.4141C13.0228 10.8056 12.5095 11.0008 11.9965 10.9999L12 11.9999"
          stroke="#292929"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
      <defs>
        <clipPath id="clip0_429_11043">
          <rect width="24" height="24" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default QuestionIcon
