// import React from 'react';
// import {NavigationContainer} from '@react-navigation/native';
// import MainStack from "./src/navigation/MainStack";
// import {SafeAreaView} from "react-native";
// // import {AppProvider} from './src/context/_AppContext';
//
// export default function App() {
//     return (
//         // <AppProvider>
//         <SafeAreaView>
//             <NavigationContainer>
//                 <MainStack/>
//             </NavigationContainer>
//         </SafeAreaView>
//         // </AppProvider>
//     );
// }
//
//


// App.js
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import MainStack from './src/navigation/MainStack';
import {AppProvider} from './src/context/_AppContext';
import Toast from 'react-native-toast-message';
import {NotificationProvider} from './src/context/_NotificationContext';

export default function App() {
    return (
        <SafeAreaProvider>
            <NotificationProvider>
                <AppProvider>
                    <NavigationContainer>
                        <MainStack/>
                    </NavigationContainer>

                </AppProvider>
            </NotificationProvider>
            <Toast/>
        </SafeAreaProvider>
    );
}
//