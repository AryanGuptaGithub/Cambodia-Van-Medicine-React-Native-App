import React, {createContext, useEffect, useState} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const _NotificationContext = createContext();

const STORAGE_KEY = 'notifications_v1';

export function NotificationProvider({children}) {
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        (async () => {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) setNotifications(JSON.parse(raw));
        })();
    }, []);

    const refreshNotifications = async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (raw) setNotifications(JSON.parse(raw));
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <_NotificationContext.Provider value={{notifications, unreadCount, refreshNotifications}}>
            {children}
        </_NotificationContext.Provider>
    );
}
