import React, {useState} from 'react';
import {KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ForgotPasswordScreen({navigation}) {
    const [email, setEmail] = useState('');

    const handleReset = () => {
        if (!email) return alert("Please enter your email");

        alert("Password reset instructions have been sent to your email.");
        navigation.goBack();
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f4f6f9'}}>
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >

                <View style={{paddingTop: 40, paddingHorizontal: 24}}>
                    <Text style={{fontSize: 28, fontWeight: '700', color: '#1f2937'}}>
                        Forgot Password 🔐
                    </Text>
                    <Text style={{fontSize: 14, color: '#6b7280', marginTop: 6}}>
                        Enter your email to reset your password.
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

                    <Text style={{fontSize: 12, fontWeight: '600', marginBottom: 6, color: '#6b7280'}}>
                        Email Address
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
                        <Icon name="email-outline" size={20} color="#9ca3af"/>
                        <TextInput
                            value={email}
                            onChangeText={setEmail}
                            placeholder="Enter your email"
                            placeholderTextColor="#9ca3af"
                            style={{flex: 1, paddingVertical: 10, marginLeft: 8}}
                        />
                    </View>

                    <TouchableOpacity
                        onPress={handleReset}
                        style={{
                            backgroundColor: '#2563eb',
                            paddingVertical: 14,
                            borderRadius: 12,
                            alignItems: 'center'
                        }}
                    >
                        <Text style={{color: '#fff', fontWeight: '700', fontSize: 16}}>
                            Reset Password
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.goBack()}
                        style={{marginTop: 16, alignSelf: 'center'}}
                    >
                        <Text style={{color: '#2563eb', fontWeight: '600'}}>
                            Back to Login
                        </Text>
                    </TouchableOpacity>

                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
