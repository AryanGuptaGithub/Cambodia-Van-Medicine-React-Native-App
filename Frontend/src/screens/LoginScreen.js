import React, {useContext, useState} from 'react';
import {
    Alert,
    Image,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StatusBar,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {_AppContext} from '../context/_AppContext';
import * as api from '../api/_api';


export default function LoginScreen({navigation}) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);


    const {login} = useContext(_AppContext);


    const handleLogin = async () => {
        try {
            setLoading(true);

            // Make the actual API call
            const response = await api.login(email, password); // <-- replace with your real API function

            if (response?.token && response?.user) {
                // Save user and token via context
                await login(response.user, response.token);

                Alert.alert("Login Successful", "Welcome back!");
                // ❌ Do NOT navigate manually. MainStack auto-switches when user != null
            } else {
                Alert.alert("Login Failed", "Invalid credentials");
            }

        } catch (error) {
            Alert.alert("Login Failed", error.message || "Please try again.");
        } finally {
            setLoading(false);
        }
    };


    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f4f6f9'}}>
            <StatusBar barStyle="dark-content" backgroundColor="#f4f6f9"/>

            {/* This combo gives you: scroll + keyboard push + tap outside to dismiss */}
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
            >
                <ScrollView
                    contentContainerStyle={{flexGrow: 1, paddingBottom: 40}}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"   // Important: dismiss keyboard on tap
                >
                    {/* Logo / Image at the top */}
                    <View style={{alignItems: 'center', paddingTop: 60}}>
                        <Image
                            source={require('../../assets/images/splash_logo.png')} // Add your image here
                            style={{width: 140, height: 140, resizeMode: 'contain'}}
                        />
                    </View>

                    {/* Header Text */}
                    <View style={{paddingHorizontal: 24, marginTop: 30}}>
                        <Text style={{fontSize: 28, fontWeight: '700', color: '#1f2937', textAlign: 'center'}}>
                            Welcome Back
                        </Text>
                        <Text style={{fontSize: 14, color: '#6b7280', marginTop: 8, textAlign: 'center'}}>
                            Login to continue managing your sales.
                        </Text>
                    </View>

                    {/* Login Card */}
                    <View style={{
                        backgroundColor: '#fff',
                        marginTop: 40,
                        marginHorizontal: 20,
                        padding: 24,
                        borderRadius: 16,
                        elevation: 6,
                        shadowColor: '#000',
                        shadowOpacity: 0.08,
                        shadowOffset: {width: 0, height: 4},
                    }}>
                        {/* Email Field */}
                        <Text style={{fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#6b7280'}}>
                            Email / Username
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            backgroundColor: '#f9fafb',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                            marginBottom: 16,
                        }}>
                            <Icon name="account-outline" size={20} color="#9ca3af"/>
                            <TextInput
                                value={email}
                                onChangeText={setEmail}
                                placeholder="Enter your email"
                                placeholderTextColor="#9ca3af"
                                style={{flex: 1, paddingVertical: 14, marginLeft: 10}}
                                autoCapitalize="none"
                                keyboardType="email-address"
                            />
                        </View>

                        {/* Password Field */}
                        <Text style={{fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#6b7280'}}>
                            Password
                        </Text>
                        <View style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            backgroundColor: '#f9fafb',
                            borderRadius: 12,
                            paddingHorizontal: 12,
                        }}>
                            <Icon name="lock-outline" size={20} color="#9ca3af"/>
                            <TextInput
                                value={password}
                                onChangeText={setPassword}
                                placeholder="Enter your password"
                                secureTextEntry={!showPass}
                                placeholderTextColor="#9ca3af"
                                style={{flex: 1, paddingVertical: 14, marginLeft: 10}}
                            />
                            <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                                <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af"/>
                            </TouchableOpacity>
                        </View>

                        {/* Forgot Password */}
                        <TouchableOpacity
                            style={{marginTop: 12, alignSelf: 'flex-end'}}
                            onPress={() => navigation.navigate('ForgotPassword')}
                        >
                            <Text style={{fontSize: 13, color: '#2563eb', fontWeight: '600'}}>
                                Forgot password?
                            </Text>
                        </TouchableOpacity>

                        {/* Login Button */}
                        <TouchableOpacity
                            onPress={handleLogin}
                            disabled={loading}
                            style={{
                                marginTop: 30,
                                backgroundColor: '#2563eb',
                                paddingVertical: 16,
                                borderRadius: 12,
                                alignItems: 'center',
                            }}
                        >
                            <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>
                                {loading ? 'Logging in...' : 'Login'}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {/* Register Link */}
                    <View style={{marginTop: 30, alignItems: 'center'}}>
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

                    {/* Test Credentials Box (Optional – remove in production) */}
                    <View style={{alignItems: 'center', marginTop: 40, paddingHorizontal: 20}}>
                        <Text style={{color: '#666', marginBottom: 8}}>For testing:</Text>
                        <View style={{
                            backgroundColor: '#fffbe6',
                            padding: 16,
                            borderRadius: 12,
                            borderWidth: 1,
                            borderColor: '#ffd666',
                            width: '100%',
                        }}>
                            <Text style={{fontWeight: '600'}}>Email: mr1@email.com</Text>
                            <Text style={{fontWeight: '600', marginTop: 4}}>Password: 123</Text>
                        </View>
                    </View>

                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}