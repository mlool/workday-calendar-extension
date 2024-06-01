interface IProps {
  color: string,
  size: number
}

const ExportIcon = ({color, size}: IProps) => {
  return (
    <svg width={`${size}px`} height={`${size}px`} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 15V3M12 3L8 7M12 3L16 7M21 12V19.8C21 20.9201 21 21.4802 20.782 21.908C20.5903 22.2843 20.2843 22.5903 19.908 22.782C19.4802 23 18.9201 23 17.8 23H6.2C5.0799 23 4.51984 23 4.09202 22.782C3.71569 22.5903 3.40973 22.2843 3.21799 21.908C3 21.4802 3 20.9201 3 19.8V12" 
      stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default ExportIcon;