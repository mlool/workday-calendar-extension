export type LoadingEventDetail = {
    isLoading: boolean;
    progress?: number; // 0-100
    message?: string;  // used for heading / errors depending on isLoading
};

// Provides a centralized channel for frequent communication using CustomEvent.
// Events sent through this channel are ephemeral (not persisted) and are used
// to notify the UI of frequent changes such as progress updates.
export default class ExtensionEventChannel {
    /*
    For Loading Events such as importing schedules, loading section data, etc.
    */
    static readonly LOADING_EVENT_NAME = "extensionLoadingState";

    static setIsLoading(isLoading: boolean, message?: string): void {
        const detail: LoadingEventDetail = isLoading
            ? { isLoading: true, progress: 0, message: undefined }
            : { isLoading: false, progress: 100, message };

        document.dispatchEvent(new CustomEvent<LoadingEventDetail>(this.LOADING_EVENT_NAME, { detail }));
    }

    static setLoadingProgress(progress: number): void {
        const clampedProgress = Math.min(Math.max(progress, 0), 100);
        const detail: LoadingEventDetail = {
            isLoading: true,
            progress: clampedProgress,
            message: undefined,
        };

        document.dispatchEvent(new CustomEvent<LoadingEventDetail>(this.LOADING_EVENT_NAME, { detail }));
    }

    // Subscribes to loading state updates.
    // The provided handler is called whenever a loading-related CustomEvent is dispatched.
    // Returns a cleanup function that removes the event listener, which should be called
    // when the listener is no longer needed (e.g. when a React component unmounts).
    static onLoadingUpdate(handler: (detail: LoadingEventDetail) => void): () => void {
        const listener = (event: Event) => {
            const ce = event as CustomEvent<LoadingEventDetail>;
            if (!ce.detail) return;
            handler(ce.detail);
        };

        document.addEventListener(this.LOADING_EVENT_NAME, listener);
        return () => document.removeEventListener(this.LOADING_EVENT_NAME, listener);
    }
}