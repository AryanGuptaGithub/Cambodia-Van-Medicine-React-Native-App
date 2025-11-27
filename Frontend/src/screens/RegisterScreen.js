import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import {BASE_URL} from '../api/_api';

export default function RegisterScreen({navigation}) {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPass, setShowPass] = useState(false);

    const handleRegister = async () => {
        if (!name || !email || !password || !confirmPassword) {
            alert("Please fill all fields");
            return;
        }

        if (password !== confirmPassword) {
            alert("Passwords do not match");
            return;
        }

        const user = {
            name,
            email,
            phone,
            password
            // No need to send 'role' anymore
        };

        try {
            const response = await axios.post(`${BASE_URL}/auth/register`, user);
            const {token, user: userData} = response.data;
            await AsyncStorage.setItem('token', token);
            await AsyncStorage.setItem('user', JSON.stringify(userData));

            navigation.replace('Home'); // Navigate to Home screen after registration
        } catch (error) {
            console.error("Registration error: ", error.response?.data?.message || error.message);
            alert(error.response?.data?.message || 'Registration failed. Please try again.');
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f4f6f9'}}>
            <KeyboardAvoidingView style={{flex: 1}} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
                <View style={{paddingTop: 40, paddingHorizontal: 24}}>
                    <Text style={{fontSize: 28, fontWeight: '700', color: '#1f2937'}}>Create Account ✨</Text>
                    <Text style={{fontSize: 14, color: '#6b7280', marginTop: 6}}>
                        Register to start managing your sales.
                    </Text>
                </View>

                <View style={{
                    backgroundColor: '#fff',
                    marginTop: 40,
                    marginHorizontal: 20,
                    padding: 20,
                    borderRadius: 16,
                    elevation: 4
                }}>
                    {/* Full Name */}
                    <Text style={styles.label}>Full Name</Text>
                    <View style={styles.inputBox}>
                        <Icon name="account-outline" size={20} color="#9ca3af"/>
                        <TextInput
                            value={name}
                            onChangeText={setName}
                            placeholder="Enter your name"
                            style={styles.input}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Email */}
                    <Text style={styles.label}>Email</Text>
                    <View style={styles.inputBox}>
                        <Icon name="email-outline" size={20} color="#9ca3af"/>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            style={styles.input}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Phone */}
                    <Text style={styles.label}>Phone</Text>
                    <View style={styles.inputBox}>
                        <Icon name="phone-outline" size={20} color="#9ca3af"/>
                        <TextInput
                            value={phone}
                            onChangeText={setPhone}
                            placeholder="Phone number"
                            keyboardType="phone-pad"
                            style={styles.input}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Password */}
                    <Text style={styles.label}>Password</Text>
                    <View style={styles.inputBox}>
                        <Icon name="lock-outline" size={20} color="#9ca3af"/>
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            placeholder="Password"
                            secureTextEntry={!showPass}
                            style={styles.input}
                            placeholderTextColor="#9ca3af"
                        />
                        <TouchableOpacity onPress={() => setShowPass(!showPass)}>
                            <Icon name={showPass ? 'eye-off-outline' : 'eye-outline'} size={20} color="#9ca3af"/>
                        </TouchableOpacity>
                    </View>

                    {/* Confirm Password */}
                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.inputBox}>
                        <Icon name="lock-check-outline" size={20} color="#9ca3af"/>
                        <TextInput
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            placeholder="Confirm password"
                            secureTextEntry={!showPass}
                            style={styles.input}
                            placeholderTextColor="#9ca3af"
                        />
                    </View>

                    {/* Register Button */}
                    <TouchableOpacity onPress={handleRegister} style={styles.button}>
                        <Text style={styles.buttonText}>Register</Text>
                    </TouchableOpacity>

                    {/* Go back to login */}
                    <TouchableOpacity onPress={() => navigation.goBack()} style={{marginTop: 16, alignSelf: 'center'}}>
                        <Text style={{color: '#2563eb', fontWeight: '600'}}>Already have an account? Login</Text>
                    </TouchableOpacity>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = {
    inputBox: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        backgroundColor: '#f9fafb',
        borderRadius: 10,
        paddingHorizontal: 10,
        marginBottom: 14,
    },
    input: {flex: 1, paddingVertical: 10, marginLeft: 8},
    label: {fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#6b7280'},
    button: {
        marginTop: 20,
        backgroundColor: '#2563eb',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
    },
    buttonText: {color: '#fff', fontWeight: '700', fontSize: 16},
};
