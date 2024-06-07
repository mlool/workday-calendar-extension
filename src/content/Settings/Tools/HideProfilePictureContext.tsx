import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HideProfilePictureContextProps {
    hideProfilePicture: boolean;
    setHideProfilePicture: (value: boolean) => void;
}

const HideProfilePictureContext = createContext<HideProfilePictureContextProps | undefined>(undefined);

export const useHideProfilePicture = () => {
    const context = useContext(HideProfilePictureContext);
    if (!context) {
        throw new Error('useHideProfilePicture must be used within a HideProfilePictureProvider');
    }
    return context;
};

interface HideProfilePictureProviderProps {
    children: ReactNode;
}

export const HideProfilePictureProvider = ({ children }: HideProfilePictureProviderProps) => {
    const [hideProfilePicture, setHideProfilePicture] = useState(false);

    const applyVisibility = (hide: boolean) => {
        const selectors = [
            'img.wdappchrome-aax',
            'img.wdappchrome-aaam',
            'img.gwt-Image.WN0P.WF5.WO0P.WJ0P.WK0P.WIEW'
        ];

        const profilePictures = document.querySelectorAll(selectors.join(', ')) as NodeListOf<HTMLImageElement>;
        profilePictures.forEach((img) => {
            img.style.visibility = hide ? 'hidden' : 'visible';
        });
    };

    useEffect(() => {
        const storedHideProfilePicture = localStorage.getItem('hideProfilePicture') === 'true';
        setHideProfilePicture(storedHideProfilePicture);
    }, []);

    useEffect(() => {
        localStorage.setItem('hideProfilePicture', hideProfilePicture.toString());
        applyVisibility(hideProfilePicture)
    }, [hideProfilePicture]);

    useEffect(() => {
        const observer = new MutationObserver(() => applyVisibility(hideProfilePicture));
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [hideProfilePicture]);

    return (
        <HideProfilePictureContext.Provider value={{ hideProfilePicture, setHideProfilePicture }}>
            {children}
        </HideProfilePictureContext.Provider>
    );
};
