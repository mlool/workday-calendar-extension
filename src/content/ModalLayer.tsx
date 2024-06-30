import {
  createContext,
  Dispatch,
  Reducer,
  useContext,
  useReducer,
  useState,
} from "react"
import { ISectionData } from "./App/App.types"
import ManualEntryModalBody from "./modalBodies/ManualEntryModalBody"
import "./ModalLayer.css"
import SectionInfoBody from "./SectionPopup/SectionInfoBody"

enum ModalAlignment {
  Top,
  Center,
}

enum ModalPreset {
  CLEAR,
  ConfirmClearWorklist,
  AutofillSettingInfo,
  HidePfpInfo,
  SectionPopup,
  ImportStatus,
  SyncErrors,
  SyncInstructions,
  SyncConfirm,
  ApiError,
  ManualCourseEntry,
}

enum ModalActionType {
  Normal,
  Destructive,
}

interface ModalConfig {
  title: string
  body: string | JSX.Element
  hasTintedBg?: boolean
  alignment?: ModalAlignment
  actionType?: ModalActionType
  closeButtonText?: string
  actionButtonText?: string
  actionHandler?: () => void
  actionHandlerWithParams?: (x: unknown) => void
  cancelHandler?: () => void
}

interface ModalAction {
  preset: ModalPreset
  additionalData?: unknown
}

interface ModalLayerProps {
  currentWorklistNumber: number
  handleClearWorklist: VoidCallback
  handleDeleteSection: (sectionToDelete: ISectionData) => void
  children: JSX.Element
}

const ModalDispatchContext = createContext<Dispatch<ModalAction>>(() => {})

function ModalLayer(props: ModalLayerProps) {
  const [modalBodyData, setModalBodyData] = useState<unknown>(undefined)

  const modalReducer: Reducer<ModalConfig | null, ModalAction> = (
    conf: ModalConfig | null,
    action: ModalAction
  ): ModalConfig | null => {
    switch (action.preset) {
      case ModalPreset.CLEAR:
        setModalBodyData(undefined)
        return null
      case ModalPreset.ConfirmClearWorklist:
        return {
          title: "Confirm Clear Worklist",
          body: `Clearing the worklist will remove all sections from both terms under worklist ${props.currentWorklistNumber}. Are you sure you want to continue?`,
          closeButtonText: "Cancel",
          actionType: ModalActionType.Destructive,
          actionButtonText: "Confirm",
          actionHandler: props.handleClearWorklist,
        }
      case ModalPreset.AutofillSettingInfo:
        return {
          title: "Info: Enable Autofill",
          body: 'Autofills "Find Course Sections".',
        }
      case ModalPreset.HidePfpInfo:
        return {
          title: "Info: Hide Profile Picture",
          body: "Hides your profile picture.",
        }
      case ModalPreset.SectionPopup: {
        const sectionData: ISectionData = action.additionalData as ISectionData
        return {
          title: sectionData.code,
          body: <SectionInfoBody selectedSection={sectionData} />,
          closeButtonText: "Close",
          actionButtonText: "Remove",
          actionType: ModalActionType.Destructive,
          actionHandler: () => props.handleDeleteSection(sectionData),
          alignment: ModalAlignment.Top,
          hasTintedBg: false,
        }
      }
      case ModalPreset.ImportStatus: {
        const message: JSX.Element = action.additionalData as JSX.Element

        return {
          title: "Import Status",
          body: message,
        }
      }
      case ModalPreset.SyncErrors: {
        const syncErrors = action.additionalData as string[]

        const errors = (
          <ul style={{ fontSize: "1.2em", padding: "10px" }}>
            {syncErrors.map((error, index) => (
              <li key={index}>
                {index + 1}. {error}
                <br />
              </li>
            ))}
          </ul>
        )

        return {
          title: "Error Syncing With Saved Schedule",
          body: errors,
          hasTintedBg: false,
        }
      }
      case ModalPreset.SyncInstructions: {
        return {
          title: "Sync Saved Schedules Instructions",
          body: `Note that you must be on the "View Saved Schedules" page. If you have multiple schedules, click the "Add course sections" button on the one you which to add to, otherwise it will add to the first one. You must satisfy all instructional format requirements (for example class requires lab and lecture) in your worklist`,
          hasTintedBg: true,
        }
      }
      case ModalPreset.SyncConfirm: {
        return {
          title: "Sync Saved Schedules Success",
          body: `Any matching classes were added to this saved schedule! Please refresh page to see changes.`,
          hasTintedBg: true,
        }
      }
      case ModalPreset.ApiError: {
        return {
          title: "Import Error",
          body: `Something went wrong! To fix this, head to the "Find Course Sections Page", accessible from "Home" > "Academics" > "Registration & Courses" > "Find Course Sections". If the issue persists, please contact the developers.`,
          hasTintedBg: false,
        }
      }
      case ModalPreset.ManualCourseEntry: {
        const submitHandler = action.additionalData as (x: unknown) => void
        return {
          title: "Manual Course Entry",
          body: <ManualEntryModalBody handleURLUpdate={setModalBodyData} />,
          closeButtonText: "Close",
          actionHandlerWithParams: submitHandler,
          actionButtonText: "Add Course",
        }
      }
      default:
        throw Error("ModalPreset not valid!")
    }
  }

  const [modalConfig, dispatchModal] = useReducer(modalReducer, null)

  return (
    <ModalDispatchContext.Provider value={dispatchModal}>
      {modalConfig && (
        <ModalWindow modalConfig={modalConfig} bodyData={modalBodyData} />
      )}
      {props.children}
    </ModalDispatchContext.Provider>
  )
}

interface ModalWindowProps {
  modalConfig: ModalConfig
  bodyData: unknown
}

function ModalWindow({ modalConfig, bodyData }: ModalWindowProps) {
  const dispatchModal = useContext(ModalDispatchContext)

  const bgStyle = (): string => {
    const styles = ["modal-background"]
    if (
      modalConfig!.hasTintedBg === undefined ||
      modalConfig!.hasTintedBg === true
    ) {
      styles.push("tinted-bg")
    }
    switch (modalConfig!.alignment) {
      case ModalAlignment.Top:
        styles.push("position-top")
        break
      default:
        styles.push("position-center")
    }
    return styles.join(" ")
  }

  const handleActionButtonClick = () => {
    if (bodyData !== undefined) {
      if (modalConfig.actionHandlerWithParams === undefined)
        throw "WARNING: Your modal body posts data to modalBodyData, but does not have an actionHandler that can handle parameters."
      modalConfig.actionHandlerWithParams!(bodyData)
    } else {
      modalConfig.actionHandler!()
    }
    dispatchModal({ preset: ModalPreset.CLEAR })
  }

  return (
    <div className={bgStyle()}>
      <div className="modal-window">
        <div className="modal-header">{modalConfig.title}</div>
        <div className="modal-body">
          {typeof modalConfig.body === "string" ? (
            <p className="modal-text-body">{modalConfig.body}</p>
          ) : (
            modalConfig.body
          )}
        </div>
        <div className="modal-button-container">
          <button
            className="modal-button cancel-button"
            onClick={() => {
              modalConfig.cancelHandler && modalConfig.cancelHandler()
              dispatchModal({ preset: ModalPreset.CLEAR })
            }}
          >
            {modalConfig.closeButtonText ?? "OK"}
          </button>
          {(modalConfig.actionHandler ||
            modalConfig.actionHandlerWithParams) && (
            <button
              className={`modal-button action-button${
                modalConfig.actionType === ModalActionType.Destructive
                  ? "-destructive"
                  : ""
              }`}
              onClick={handleActionButtonClick}
            >
              {modalConfig.actionButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export { ModalLayer, ModalPreset, ModalDispatchContext }
