import { useState, useEffect } from "react"
interface IProps {
  message: string
}

interface EventDetail {
  progress: number
}

const ProgressBar = (props: IProps) => {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const progressEventHandler = handleProgress as EventListener

    document.addEventListener("progress", progressEventHandler)
  }, [])

  const handleProgress = (event: CustomEvent<EventDetail>) => {
    setProgress(event.detail.progress)
  }
  return (
    <div className="ProgressContainer">
      {props.message}
      <progress className="ProgressBar" value={progress} max={1}></progress>
    </div>
  )
}

export default ProgressBar
