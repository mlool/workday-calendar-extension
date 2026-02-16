import { useEffect, useState } from "react";
import ExtensionEventChannel, {
  LoadingEventDetail,
} from "../../objects/ExtensionEventChannel";
import "./ProgressModal.css";

type LoadingState = {
  isLoading: boolean;
  progress: number;
  message?: string;
};

export default function ProgressBar() {
  const [state, setState] = useState<LoadingState>({
    isLoading: false,
    progress: 0,
    message: undefined,
  });

  useEffect(() => {
    // Subscribe on mount
    const unsubscribe = ExtensionEventChannel.onLoadingUpdate(
      (detail: LoadingEventDetail) => {
        setState((prev) => ({
          isLoading: detail.isLoading,
          progress: detail.progress ?? prev.progress,
          message: detail.message ?? prev.message,
        }));
      }
    );

    // Unsubscribe on unmount
    return unsubscribe;
  }, []);

  if (state.isLoading) {
    return (
      <div className="progress-modal-overlay">
        <div className="progress-modal-popup">
          <div className="progress-modal-header">
            <h2>{state.message ?? "Loading..."}</h2>
          </div>
          <div className="progress-modal-content">
            <progress value={state.progress} max="100"></progress>
          </div>
        </div>
      </div>
    );
  }

  return <></>;
}
