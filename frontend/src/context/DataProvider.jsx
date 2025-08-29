import React, { useState } from 'react';
import { DataContext } from './DataContext';

export const DataProvider = ({ children }) => {
    const [dataVersion, setDataVersion] = useState(0);

    const refreshData = () => {
        setDataVersion(prevVersion => prevVersion + 1);
    };

    const value = {
        dataVersion,
        refreshData,
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};