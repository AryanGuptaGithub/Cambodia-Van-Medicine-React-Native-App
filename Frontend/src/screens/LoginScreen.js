// src/screens/LoginScreen.js
import React, {useEffect, useState} from 'react';
import {KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    // 🔥 Auto-redirect if user already logged in
    useEffect(() => {
        (async () => {
            const raw = await AsyncStorage.getItem('user');
            if (raw) {
                navigation.replace('Home');
            }
        })();
    }, []);

    // 🔥 Save and login
    const handleLogin = async () => {
        if (!email || !password) {
            alert("Please enter email and password");
            return;
        }

        // Dummy user (replace with real API later)
        const user = {
            id: 'mr-001',
            name: 'MR John Doe',
            email,
            role: 'Medical Representative',
            company: 'Healthcare Van',
            avatar: '/mnt/data/16e1317b-3d59-4f8c-accf-97815479089d.jpg'
        };

        await AsyncStorage.setItem('user', JSON.stringify(user));

        navigation.replace('Home');  // proper login redirect
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f4f6f9'}}>
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >

                {/* Header */}
                <View style={{paddingTop: 40, paddingHorizontal: 24}}>
                    <Text style={{fontSize: 28, fontWeight: '700', color: '#1f2937'}}>
                        Welcome Back 👋
                    </Text>
                    <Text style={{fontSize: 14, color: '#6b7280', marginTop: 6}}>
                        Login to continue managing your sales.
                    </Text>
                </View>

                {/* Login Card */}
                <View style={{
                    backgroundColor: '#fff',
                    marginTop: 40,
                    marginHorizontal: 20,
                    padding: 20,
                    borderRadius: 16,
                    elevation: 4,
                    shadowColor: '#000',
                    shadowOpacity: 0.05,
                    shadowOffset: {width: 0, height: 2},
                }}>

                    {/* Email Field */}
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        marginBottom: 6,
                        color: '#6b7280'
                    }}>Email / Username</Text>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        backgroundColor: '#f9fafb',
                        borderRadius: 10,
                        paddingHorizontal: 10,
                        marginBottom: 16
                    }}>
                        <Icon name="account-outline" size={20} color="#9ca3af"/>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#9ca3af"
                            style={{flex: 1, paddingVertical: 10, marginLeft: 8}}
                        />
                    </View>

                    {/* Password Field */}
                    <Text style={{
                        fontSize: 12,
                        fontWeight: '600',
                        marginBottom: 6,
                        color: '#6b7280'
                    }}>Password</Text>

                    <View style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        backgroundColor: '#f9fafb',
                        borderRadius: 10,
                        paddingHorizontal: 10
                    }}>
                        <Icon name="lock-outline" size={20} color="#9ca3af"/>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Enter your password"
                            secureTextEntry={!showPass}
                            placeholderTextColor="#9ca3af"
                            style={{flex: 1, paddingVertical: 10, marginLeft: 8}}
                        />
                        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                            <Icon
                                name={showPass ? 'eye-off-outline' : 'eye-outline'}
                                size={20}
                                color="#9ca3af"
                            />
                        </TouchableOpacity>
                    </View>

                    {/* Login Button */}
                    <TouchableOpacity
                        onPress={handleLogin}
                        style={{
                            marginTop: 28,
                            backgroundColor: '#2563eb',
                            paddingVertical: 14,
                            borderRadius: 12,
                            alignItems: 'center',
                            shadowColor: '#2563eb',
                            shadowOpacity: 0.3,
                            shadowOffset: {width: 0, height: 3}
                        }}
                    >
                        <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>
                            Login
                        </Text>
                    </TouchableOpacity>

                </View>

            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
