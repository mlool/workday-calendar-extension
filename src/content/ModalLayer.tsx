import {
  createContext,
  Dispatch,
  Reducer,
  SetStateAction,
  useContext,
  useReducer,
  useState,
} from "react"
import { ISectionData } from "./App/App.types"
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
  cancelHandler?: () => void
}

interface ModalAction {
  preset: ModalPreset
  additionalData?: unknown
}

interface SyncScheduleModalData {
  syncErrors: string[]
  onCancel: () => void
  onConfirm: () => void
}

interface ManualCourseEntryModalData {
  onConfirm: (searchTerm: string, manualUrl?: string) => Promise<string | null>
}

interface ModalLayerProps {
  currentWorklistNumber: number
  handleClearWorklist: VoidCallback
  handleDeleteSelectedSection: VoidCallback
  setSelectedSection: Dispatch<SetStateAction<ISectionData | null>>
  children: JSX.Element
}

const ModalDispatchContext = createContext<Dispatch<ModalAction>>(() => {})

function ModalLayer(props: ModalLayerProps) {
  const modalReducer: Reducer<ModalConfig | null, ModalAction> = (
    conf: ModalConfig | null,
    action: ModalAction
  ): ModalConfig | null => {
    switch (action.preset) {
      case ModalPreset.CLEAR:
        return null
      case ModalPreset.ConfirmClearWorklist:
        return {
          title: "Confirm Clear Worklist",
          body: `Clearing the worklist will remove all sections from both terms under worklist ${props.currentWorklistNumber}. Are you sure you want to continue?`,
          closeButtonText: "Cancel",
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
          actionHandler: props.handleDeleteSelectedSection,
          cancelHandler: () => props.setSelectedSection(null),
          alignment: ModalAlignment.Top,
          hasTintedBg: false,
        }
      }
      case ModalPreset.ImportStatus: {
        const message: string = action.additionalData as string
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
          actionType: ModalActionType.Normal,
        }
      }
      case ModalPreset.SyncInstructions: {
        const data: SyncScheduleModalData =
          action.additionalData as SyncScheduleModalData

        return {
          title: "Sync Saved Schedules Instructions",
          body: `Please note that you must be on the "View Saved Schedules" page. If you have multiple schedules, click the "add course sections" button on the one you which to add to, otherwise it will add to the first one. You must have all requirements (for example class requires lab and lecture) in your worklist`,
          closeButtonText: "Close",
          actionButtonText: "OK",
          actionHandler: data.onConfirm,
          cancelHandler: data.onCancel,
          hasTintedBg: false,
          actionType: ModalActionType.Normal,
        }
      }
      case ModalPreset.SyncConfirm: {
        return {
          title: "Sync Saved Schedules Success",
          body: `Any matching classes were added to this saved schedule! Please refresh page to see changes.`,
          hasTintedBg: false,
          actionType: ModalActionType.Normal,
        }
      }
      case ModalPreset.ApiError: {
        return {
          title: "Import Error",
          body: `Oops something went wrong! Best way to fix this is to head to the "Find Course Sections Page" One way to do this is by going "home" by clicking the UBC logo, then clicking "Academics", "Registration & Courses", "Find Course Sections" . If the issue persists, please contact the developers.`,
          hasTintedBg: false,
          actionType: ModalActionType.Normal,
        }
      }
      case ModalPreset.ManualCourseEntry: {
        const data: ManualCourseEntryModalData =
          action.additionalData as ManualCourseEntryModalData

        const handleChange = (event: React.FormEvent<HTMLFormElement>) => {
          event.preventDefault()
          const form = new FormData(event.currentTarget)
          const url = form.get("manualEntryUrl") as string
          data.onConfirm("MANUAL_ENTRY", url)
          dispatchModal({ preset: ModalPreset.CLEAR })
        }
        const message = `If you are having issues adding courses normally, or if you wish to add the course manually, you can input the link to the course below. The link can be found by clicking on the course in Workday`
        const body = (
          <div style={{ textAlign: "center" }}>
            <label>{message}</label>
            <form onSubmit={handleChange}>
              <input name="manualEntryUrl" placeholder="Enter URL Here" />
              <button type="submit">Submit</button>
            </form>
          </div>
        )
        return {
          title: "Manual Course Entry",
          body: body,
          hasTintedBg: false,
          closeButtonText: "Close",
          actionType: ModalActionType.Normal,
        }
      }
      default:
        throw Error("ModalPreset not valid!")
    }
  }

  const [modalConfig, dispatchModal] = useReducer(modalReducer, null)

  return (
    <ModalDispatchContext.Provider value={dispatchModal}>
      {modalConfig && <ModalWindow modalConfig={modalConfig} />}
      {props.children}
    </ModalDispatchContext.Provider>
  )
}

interface ModalWindowProps {
  modalConfig: ModalConfig
}

function ModalWindow({ modalConfig }: ModalWindowProps) {
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
          {modalConfig.actionHandler && (
            <button
              className={`modal-button action-button${
                modalConfig.actionType === ModalActionType.Normal
                  ? ""
                  : "-destructive"
              }`}
              onClick={() => {
                modalConfig.actionHandler!()
                dispatchModal({ preset: ModalPreset.CLEAR })
              }}
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
