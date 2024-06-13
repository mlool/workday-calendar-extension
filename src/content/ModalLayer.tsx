import { useState } from "react";
import "./ModalLayer.css";
import Contact from "./Settings/Contact/Contact";

enum ModalAlignment {
  Top,
  Center,
}

function ModalLayer() {
  const { modalConfig, setModalConfig } = useModal();

  if (modalConfig === null) return <></>;

  const bgStyle = (): string => {
    const styles = ["modal-background"];
    if (modalConfig.hasTintedBg) styles.push("tinted-bg");
    switch (modalConfig.alignment) {
      case ModalAlignment.Top:
        styles.push("position-top");
        break;
      case ModalAlignment.Center:
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
          onClick={() => setModalConfig(null)}
        >
            {modalConfig.closeButtonText}
        </button>
        {modalConfig.actionHandler && (
          <button
          className="modal-button action-button"
            onClick={modalConfig.actionHandler}
          >
              {modalConfig.actionButtonText}
          </button>
        )}
      </div>
      </div>
    </div>
  );
}

interface ModalConfig {
  hasTintedBg: boolean;
  alignment: ModalAlignment;
  title: string;
  body: string | JSX.Element;
  closeButtonText: string;
  actionButtonText?: string;
  actionHandler?: (() => void);
}

function useModal() {
  const [modalConfig, setModalConfig] = useState<ModalConfig | null>({
    hasTintedBg: true,
    alignment: ModalAlignment.Top,
    title: "Untitled",
    //body: (
    //  <>
    //    <Contact />
    //    <Contact />
    //    <Contact />
    //    <Contact />
    //    <Contact />
    //  </>
    //),
    closeButtonText: "Close",
    body: "test",
    actionHandler: () => alert("WHEE"),
    actionButtonText: "OK",
  });

  return {
    modalConfig,
    setModalConfig,
  };
}

export { ModalLayer, useModal };
