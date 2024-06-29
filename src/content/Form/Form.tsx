import { ISectionData } from "../App/App.types"
import "./Form.css"
import { useContext, useEffect, useState } from "react"
import { ModalDispatchContext, ModalPreset } from "../ModalLayer"
import ManualCourseEntry from "../ManualCourseEntry/ManualCourseEntry"

interface IProps {
  newSection: ISectionData | null
  sectionConflict: boolean
  handleAddNewSection: () => void
  handleCancel: () => void
}

interface CourseAddingProgressEventDetail {
  progress: number
}

interface CourseLoadingEventDetail {
  isLoading: boolean
}

const Form = (props: IProps) => {
  const dispatchModal = useContext(ModalDispatchContext)
  const [isCourseLoading, setIsCourseLoading] = useState(false)
  const [progress, setProgress] = useState(0)

  const handleCourseAddingProgress = (
    event: CustomEvent<CourseAddingProgressEventDetail>
  ) => {
    setProgress(event.detail.progress)
  }

  const handleCourseLoading = (
    event: CustomEvent<CourseLoadingEventDetail>
  ) => {
    setIsCourseLoading(event.detail.isLoading)
  }

  useEffect(() => {
    const progressEventHandler = handleCourseAddingProgress as EventListener
    const courseLoadingEventHandler = handleCourseLoading as EventListener

    document.addEventListener("courseAddingProgress", progressEventHandler)
    document.addEventListener("isCourseLoading", courseLoadingEventHandler)
  }, [])

  return (
    <div className="NewSectionForm">
      {isCourseLoading ? (
        <div className="LoadingContainer">
          <div className="NewSectionCode">Loading Course Data...</div>
          <progress value={progress / 100} />
        </div>
      ) : props.newSection ? (
        <div className="NewSectionInfo">
          <div className="NewSectionCode">{props.newSection.code}</div>
          <div>{props.newSection.name}</div>
        </div>
      ) : null}
      <div className="NewSectionButtonContainer">
        <button
          className="NewSectionButton"
          disabled={props.newSection === null}
          title="Cancel"
          onClick={props.handleCancel}
        >
          Cancel
        </button>
        <button
          className="NewSectionButton"
          disabled={props.sectionConflict || props.newSection === null}
          title="Add Section"
          onClick={props.handleAddNewSection}
        >
          Add Section
        </button>
      </div>
      <ManualCourseEntry />
      <div
        className="ClearWorklistButton"
        title="Clear Worklist"
        onClick={() =>
          dispatchModal({ preset: ModalPreset.ConfirmClearWorklist })
        }
      >
        Clear Worklist
      </div>
    </div>
  )
}

export default Form
