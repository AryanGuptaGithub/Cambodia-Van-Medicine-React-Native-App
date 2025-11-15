import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainStack from './src/navigation/MainStack';
import {AppProvider} from './src/context/_AppContext';

export default function App() {
    return (
        <AppProvider>
        <NavigationContainer>
            <MainStack />
        </NavigationContainer>
        </AppProvider>
    );
}

