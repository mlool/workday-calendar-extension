interface IProps {
    color: string,
    size: number
}

const CloseIcon = ({color, size}:IProps) => {
  return (
    <svg width={`${size}px`} height={`${size}px`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M3 21.32L21 3.32001" stroke={`${color}`} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M3 3.32001L21 21.32" stroke={`${color}`} stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  );
}

export default CloseIcon