import React, {useEffect, useState} from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';

import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import ForgotPasswordScreen from '../screens/ForgotPasswordScreen';
import CustomersScreen from '../screens/CustomersScreen';
import AddCustomerScreen from '../screens/AddCustomerScreen';
import ProductsScreen from '../screens/ProductsScreen';
import AddProductScreen from '../screens/AddProductScreen';
import SalesScreen from '../screens/SalesScreen';
import ReturnsScreen from '../screens/ReturnsScreen';
import PayrollScreen from '../screens/PayrollScreen';
import AttendanceScreen from '../screens/AttendanceScreen';
import CustomerDetailsScreen from '../screens/CustomerDetailsScreen';
import SalesReturnTotalScreen from '../screens/SalesReturnTotalScreen';
import ProfileScreen from '../screens/ProfileScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import StocksScreen from '../screens/StocksScreen';
import ProductDetailsScreen from '../screens/ProductDetailsScreen';

const Stack = createNativeStackNavigator();

export default function MainStack() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Check authentication status when the component mounts
    useEffect(() => {
        const checkAuth = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                setIsAuthenticated(true);
            } else {
                setIsAuthenticated(false);
            }
        };

        checkAuth();
    }, []);

    return (
        <Stack.Navigator
            initialRouteName={isAuthenticated ? 'Home' : 'Login'} // Conditional route based on auth status
            screenOptions={{headerShown: false}}
        >
            {/* 🔐 Authentication */}
            <Stack.Screen name="Login" component={LoginScreen}/>
            <Stack.Screen name="Register" component={RegisterScreen}/>
            <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen}/>

            {/* App Screens - Protected Routes */}
            {isAuthenticated && (
                <>
                    <Stack.Screen name="Home" component={HomeScreen}/>
                    <Stack.Screen name="Customers" component={CustomersScreen}/>
                    <Stack.Screen name="AddCustomer" component={AddCustomerScreen}/>
                    <Stack.Screen name="Products" component={ProductsScreen}/>
                    <Stack.Screen name="AddProduct" component={AddProductScreen}/>
                    <Stack.Screen name="Sales" component={SalesScreen}/>
                    <Stack.Screen name="Returns" component={ReturnsScreen}/>
                    <Stack.Screen name="Payroll" component={PayrollScreen}/>
                    <Stack.Screen name="Attendance" component={AttendanceScreen}/>
                    <Stack.Screen name="CustomerDetails" component={CustomerDetailsScreen}/>
                    <Stack.Screen name="SalesReturnTotal" component={SalesReturnTotalScreen}/>
                    <Stack.Screen name="Profile" component={ProfileScreen}/>
                    <Stack.Screen name="Notifications" component={NotificationsScreen}/>
                    <Stack.Screen name="Stocks" component={StocksScreen}/>
                    <Stack.Screen name="ProductDetails" component={ProductDetailsScreen}/>
                </>
            )}
        </Stack.Navigator>
    );
}
