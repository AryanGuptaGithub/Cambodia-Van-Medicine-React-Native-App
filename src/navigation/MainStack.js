// src/navigation/MainStack.js
import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import HomeScreen from '../screens/HomeScreen';
import CustomersScreen from '../screens/CustomersScreen';
import AddCustomerScreen from '../screens/AddCustomerScreen';
import ProductsScreen from '../screens/ProductsScreen';
import AddProductScreen from '../screens/AddProductScreen';
import SalesScreen from '../screens/SalesScreen';
import ReturnsScreen from '../screens/ReturnsScreen';
import PayrollScreen from '../screens/PayrollScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import CustomerDetailsScreen from '../screens/CustomerDetailsScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
    return (
        <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
            <Stack.Screen name="Home" component={HomeScreen}/>
            <Stack.Screen name="Customers" component={CustomersScreen}/>
            <Stack.Screen name="AddCustomer" component={AddCustomerScreen}/>
            <Stack.Screen name="Products" component={ProductsScreen}/>
            <Stack.Screen name="AddProduct" component={AddProductScreen}/>
            <Stack.Screen name="Sales" component={SalesScreen}/>
            <Stack.Screen name="Returns" component={ReturnsScreen}/>
            <Stack.Screen name="Payroll" component={PayrollScreen}/>
            <Stack.Screen name="Attendance" component={AttendanceScreen}/>
            <Stack.Screen
                name="CustomerDetails"
                component={CustomerDetailsScreen}
            />
        </Stack.Navigator>
    );
}

// // src/navigation/MainStack.js
// import React from 'react';
// import {createNativeStackNavigator} from '@react-navigation/native-stack';
// import HomeScreen from '../screens/HomeScreen';
// import CustomersScreen from '../screens/CustomersScreen';
// import AddCustomerScreen from '../screens/AddCustomerScreen';
// import ProductsScreen from '../screens/ProductsScreen';
// import AddProductScreen from '../screens/AddProductScreen';
// import SalesScreen from '../screens/SalesScreen';
// import ReturnsScreen from '../screens/ReturnsScreen';
// import PayrollScreen from '../screens/PayrollScreen';
// import AttendanceScreen from '../screens/AttendanceScreen';
//
// const Stack = createNativeStackNavigator();
//
// export default function MainStack() {
//     return (
//         <Stack.Navigator initialRouteName="Home" screenOptions={{headerShown: false}}>
//             <Stack.Screen name="Home" component={HomeScreen}/>
//             <Stack.Screen name="Customers" component={CustomersScreen}/>
//             <Stack.Screen name="AddCustomer" component={AddCustomerScreen}/>
//             <Stack.Screen name="Products" component={ProductsScreen}/>
//             <Stack.Screen name="AddProduct" component={AddProductScreen}/>
//             <Stack.Screen name="Sales" component={SalesScreen}/>
//             <Stack.Screen name="Returns" component={ReturnsScreen}/>
//             <Stack.Screen name="Payroll" component={PayrollScreen}/>
//             <Stack.Screen name="Attendance" component={AttendanceScreen}/>
//         </Stack.Navigator>
//     );
// }
