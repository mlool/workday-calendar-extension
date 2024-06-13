import { createContext, Dispatch, Reducer, useReducer } from "react";
import "./ModalLayer.css";

enum ModalAlignment {
  Top,
  Center,
}

enum ModalPreset {
  CLEAR,
  ConfirmClearWorklist,
  AutofillSettingInfo,
  HidePfpInfo,
}

interface ModalConfig {
  title: string;
  body: string | JSX.Element;
  hasTintedBg?: boolean;
  alignment?: ModalAlignment;
  closeButtonText?: string;
  actionButtonText?: string;
  actionHandler?: () => void;
}

interface ModalAction {
  preset: ModalPreset;
}

interface ModalLayerProps {
  reducer: Reducer<ModalConfig | null, ModalAction>;
  children: JSX.Element;
}

const ModalDispatchContext = createContext<Dispatch<ModalAction>>(() => {});

function ModalLayer(props: ModalLayerProps) {
  const [modalConfig, dispatchModal] = useReducer(props.reducer, null);

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
    <ModalDispatchContext.Provider value={dispatchModal}>
      {modalConfig && (
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
                onClick={() => dispatchModal({ preset: ModalPreset.CLEAR })}
              >
                {modalConfig.closeButtonText ?? "OK"}
              </button>
              {modalConfig.actionHandler && (
                <button
                  className="modal-button action-button"
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
      )}
      {props.children}
    </ModalDispatchContext.Provider>
  );
}

export {
  ModalLayer,
  ModalPreset,
  ModalAlignment,
  type ModalConfig,
  type ModalAction,
  ModalDispatchContext,
};
