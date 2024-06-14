import {
  createContext,
  Dispatch,
  Reducer,
  SetStateAction,
  useContext,
  useReducer,
} from "react";
import { ISectionData } from "./App/App.types";
import "./ModalLayer.css";
import SectionInfoBody from "./SectionPopup/SectionInfoBody";

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
}

enum ModalActionType {
  Normal,
  Destructive,
}

interface ModalConfig {
  title: string;
  body: string | JSX.Element;
  hasTintedBg?: boolean;
  alignment?: ModalAlignment;
  actionType?: ModalActionType;
  closeButtonText?: string;
  actionButtonText?: string;
  actionHandler?: () => void;
  cancelHandler?: () => void;
}

interface ModalAction {
  preset: ModalPreset;
  additionalData?: unknown;
}

interface ModalLayerProps {
  currentWorklistNumber: number;
  handleClearWorklist: VoidCallback;
  handleDeleteSelectedSection: VoidCallback;
  setSelectedSection: Dispatch<SetStateAction<ISectionData | null>>;
  children: JSX.Element;
}

const ModalDispatchContext = createContext<Dispatch<ModalAction>>(() => {});

function ModalLayer(props: ModalLayerProps) {
  const modalReducer: Reducer<ModalConfig | null, ModalAction> = (
    conf: ModalConfig | null,
    action: ModalAction
  ): ModalConfig | null => {
    switch (action.preset) {
      case ModalPreset.CLEAR:
        return null;
      case ModalPreset.ConfirmClearWorklist:
        return {
          title: "Confirm Clear Worklist",
          body: `Clearing the worklist will remove all sections from both terms under worklist ${props.currentWorklistNumber}. Are you sure you want to continue?`,
          closeButtonText: "Cancel",
          actionButtonText: "Confirm",
          actionHandler: props.handleClearWorklist,
        };
      case ModalPreset.AutofillSettingInfo:
        return {
          title: "Info: Enable Autofill",
          body: 'Autofills "Find Course Sections".',
        };
      case ModalPreset.HidePfpInfo:
        return {
          title: "Info: Hide Profile Picture",
          body: "Hides your profile picture.",
        };
      case ModalPreset.SectionPopup:
        const sectionData: ISectionData = action.additionalData as ISectionData;
        return {
          title: sectionData.code,
          body: <SectionInfoBody selectedSection={sectionData} />,
          closeButtonText: "Close",
          actionButtonText: "Remove",
          actionHandler: props.handleDeleteSelectedSection,
          cancelHandler: () => props.setSelectedSection(null),
          alignment: ModalAlignment.Top,
          hasTintedBg: false,
        };
      default:
        throw Error("ModalPreset not valid!");
    }
  };

  const [modalConfig, dispatchModal] = useReducer(modalReducer, null);

  return (
    <ModalDispatchContext.Provider value={dispatchModal}>
      {modalConfig && <ModalWindow modalConfig={modalConfig} />}
      {props.children}
    </ModalDispatchContext.Provider>
  );
}

interface ModalWindowProps {
  modalConfig: ModalConfig;
}

function ModalWindow({ modalConfig }: ModalWindowProps) {
  const dispatchModal = useContext(ModalDispatchContext);

  const bgStyle = (): string => {
    const styles = ["modal-background"];
    if (
      modalConfig!.hasTintedBg === undefined ||
      modalConfig!.hasTintedBg === true
    ) {
      styles.push("tinted-bg");
    }
    switch (modalConfig!.alignment) {
      case ModalAlignment.Top:
        styles.push("position-top");
        break;
      default:
        styles.push("position-center");
    }
    return styles.join(" ");
  };

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
              modalConfig.cancelHandler && modalConfig.cancelHandler();
              dispatchModal({ preset: ModalPreset.CLEAR });
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
                modalConfig.actionHandler!();
                dispatchModal({ preset: ModalPreset.CLEAR });
              }}
            >
              {modalConfig.actionButtonText}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export { ModalLayer, ModalPreset, ModalDispatchContext };
