// src/screens/LoginScreen.js
import React, {useState} from 'react';
import {Alert, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {login} from '../api/_api'; // Import the login function from _api.js

export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            setLoading(true);  // Show loading state
            const response = await login(email, password);
            if (response.token) {
                // Successfully logged in, navigate to Home
                Alert.alert('Login Successful', 'Welcome back!', [
                    {text: 'OK', onPress: () => navigation.replace('Home')},
                ]);
            }
        } catch (error) {
            setLoading(false);  // Hide loading state
            Alert.alert('Login Failed', error.message || 'Please try again.');
        }
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
                    }}>
                        Email / Username
                    </Text>
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
                    }}>
                        Password
                    </Text>
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

                    {/* Forgot Password */}
                    <TouchableOpacity
                        style={{marginTop: 10, alignSelf: 'flex-end'}}
                        onPress={() => navigation.navigate('ForgotPassword')}
                    >
                        <Text style={{fontSize: 12, color: '#2563eb', fontWeight: '600'}}>
                            Forgot password?
                        </Text>
                    </TouchableOpacity>

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
                        disabled={loading}  // Disable while loading
                    >
                        <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>
                            {loading ? 'Logging in...' : 'Login'}
                        </Text>
                    </TouchableOpacity>

                </View>

                {/* Bottom Register Link */}
                <View style={{
                    marginTop: 20,
                    alignItems: 'center'
                }}>
                    <Text style={{color: '#6b7280'}}>
                        Don’t have an account?{' '}
                        <Text
                            onPress={() => navigation.navigate('Register')}
                            style={{color: '#2563eb', fontWeight: '700'}}
                        >
                            Register
                        </Text>
                    </Text>
                </View>

                <View style={{alignItems: 'center', marginTop: 100}}>
                    <Text>For the testing use to login:</Text>
                    <View
                        style={{
                            marginTop: 8,
                            borderWidth: 1,
                            padding: 10,
                            borderRadius: 16,
                            backgroundColor: '#fff',
                            borderColor: 'orange'
                        }}>
                        <Text>
                            Email: <Text>mr1@email.com</Text>
                        </Text>
                        <Text>
                            Password: <Text>12345678</Text>
                        </Text>
                    </View>

                </View>


            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
