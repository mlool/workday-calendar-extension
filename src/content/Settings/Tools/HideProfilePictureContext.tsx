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
        const profilePictures = document.querySelectorAll('img.wdappchrome-aax') as NodeListOf<HTMLImageElement>;
        profilePictures.forEach((img) => {
            img.style.visibility = hide ? 'hidden' : 'visible';
        });
    };

    const hidePfp = () => {
        applyVisibility(hideProfilePicture);
    };

    useEffect(() => {
        const storedHideProfilePicture = localStorage.getItem('hideProfilePicture') === 'true';
        setHideProfilePicture(storedHideProfilePicture);
    }, []);

    useEffect(() => {
        localStorage.setItem('hideProfilePicture', hideProfilePicture.toString());
        hidePfp();
    }, [hideProfilePicture]);

    useEffect(() => {
        const observer = new MutationObserver(hidePfp);
        observer.observe(document.body, { childList: true, subtree: true });

        return () => observer.disconnect();
    }, [hideProfilePicture]);

    return (
        <HideProfilePictureContext.Provider value={{ hideProfilePicture, setHideProfilePicture }}>
            {children}
        </HideProfilePictureContext.Provider>
    );
};
