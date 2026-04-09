import React, { createContext, useContext } from 'react';
import useAlerts from '../hooks/useAlerts';

const AlertContext = createContext();

export const useAlertContext = () => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlertContext must be used within an AlertProvider');
    }
    return context;
};

export const AlertProvider = ({ children }) => {
    const { alerts, markRead, clearAll, addAlert } = useAlerts();

    return (
        <AlertContext.Provider value={{ alerts, markRead, clearAll, addAlert }}>
            {children}
        </AlertContext.Provider>
    );
};
