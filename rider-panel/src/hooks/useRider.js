import { useContext } from 'react';
import { RiderContext } from '../context/RiderContext';

export const useRider = () => {
    const context = useContext(RiderContext);
    if (context === undefined) {
        throw new Error('useRider must be used within a RiderProvider');
    }
    return context;
};
