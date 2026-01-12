import { useEffect, useState } from "react";
import ExtensionEventChannel, { LoadingEventDetail } from "../../objects/ExtensionEventChannel";

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
        const unsubscribe = ExtensionEventChannel.onLoadingUpdate((detail: LoadingEventDetail) => {
            setState((prev) => ({
                isLoading: detail.isLoading,
                progress: detail.progress ?? prev.progress,
                message: detail.message ?? prev.message,
            }));
        });

        // Unsubscribe on unmount
        return unsubscribe;
    }, []);

    if (state.isLoading) {
        return <div>Loading... {state.progress}%</div>;
    }

    return <div>{state.message ?? ""}</div>;
}
