// src/screens/ProfileScreen.js
import React, {useContext, useEffect, useState} from 'react';
import {Alert, Image, StyleSheet, Switch, Text, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/jsfiles/Header';
import {_AppContext} from '../context/_AppContext';

export default function ProfileScreen({navigation}) {
    // If you keep user data in context later, you can read from context.
    const {customers = [], products = []} = useContext(_AppContext);

    const [user, setUser] = useState({
        id: 'mr-001',
        name: 'MR John Doe',
        email: 'mr.john@example.com',
        phone: '+91-98765-43210',
        role: 'Medical Representative',
        company: 'Healthcare Van',
        // default profile image — using uploaded file path (you asked to use this path).
        // Your environment/build system will convert/serve it accordingly.
        avatar: {uri: '/mnt/data/16e1317b-3d59-4f8c-accf-97815479089d.jpg'},
    });

    const [darkMode, setDarkMode] = useState(false);
    const {logout} = useContext(_AppContext);

    useEffect(() => {
        // Try to load real user from AsyncStorage if available
        (async () => {
            try {
                const raw = await AsyncStorage.getItem('user');
                if (raw) {
                    const parsed = JSON.parse(raw);
                    // if parsed.avatar is a path string, convert to {uri: parsed.avatar}
                    if (parsed.avatar && typeof parsed.avatar === 'string') {
                        parsed.avatar = {uri: parsed.avatar};
                    }
                    setUser(prev => ({...prev, ...parsed}));
                }
            } catch (e) {
                // ignore
            }
        })();
    }, []);

    const onLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            {text: 'Cancel', style: 'cancel'},
            {text: 'Logout', style: 'destructive', onPress: logout},
        ]);
    };


    const onEditProfile = () => {
        // open an edit screen or modal (not implemented here)
        Alert.alert('Edit profile', 'Open an edit profile screen here.');
    };

    return (
        <SafeAreaView style={[styles.wrapper, darkMode ? styles.darkBg : styles.lightBg]}>
            <Header title="Profile" onBack={() => navigation.goBack()} backgroundColor="#2563eb"/>

            <View style={styles.container}>
                {/* Top card */}
                <View style={styles.topCard}>
                    <Image source={user.avatar} style={styles.avatar}/>

                    <View style={{flex: 1, marginLeft: 14}}>
                        <Text style={styles.name}>{user.name}</Text>
                        <Text style={styles.role}>{user.role} • {user.company}</Text>

                        <View style={styles.row}>
                            <Icon name="email-outline" size={16} color="#6b7280"/>
                            <Text style={styles.metaText}>{user.email}</Text>
                        </View>

                        <View style={styles.row}>
                            <Icon name="phone-outline" size={16} color="#6b7280"/>
                            <Text style={styles.metaText}>{user.phone}</Text>
                        </View>
                    </View>
                </View>

                {/* Quick stats */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{customers.length}</Text>
                        <Text style={styles.statLabel}>Customers</Text>
                    </View>

                    <View style={styles.statCard}>
                        <Text style={styles.statValue}>{products.length}</Text>
                        <Text style={styles.statLabel}>Products</Text>
                    </View>

                    <View style={styles.statCard}>
                        {/* You can replace with real sales count */}
                        <Text style={styles.statValue}>120</Text>
                        <Text style={styles.statLabel}>Sales</Text>
                    </View>
                </View>

                {/* Actions */}
                <View style={styles.actions}>
                    <TouchableOpacity style={styles.actionBtn} onPress={onEditProfile}>
                        <Icon name="account-edit" size={15} color="#2563eb"/>
                        <Text style={styles.actionText}>Edit Profile</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Payroll')}>
                        <Icon name="currency-usd" size={18} color="#10b981"/>
                        <Text style={styles.actionText}>Payroll</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.actionBtn} onPress={() => navigation.navigate('Attendance')}>
                        <Icon name="calendar-check" size={15} color="#3b82f6"/>
                        <Text style={styles.actionText}>Attendance</Text>
                    </TouchableOpacity>
                </View>

                {/* Preferences */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Preferences</Text>

                    <View style={styles.prefRow}>
                        <Text style={styles.prefLabel}>Dark Mode</Text>
                        <Switch value={darkMode} onValueChange={setDarkMode}/>
                    </View>

                    <View style={styles.prefRow}>
                        <Text style={styles.prefLabel}>App version</Text>
                        <Text style={styles.prefVal}>1.0.0</Text>
                    </View>
                </View>

                {/* Danger zone */}
                <View style={styles.section}>
                    <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
                        <Icon name="logout" size={18} color="#fff"/>
                        <Text style={styles.logoutText}>Logout</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    wrapper: {flex: 1},
    lightBg: {backgroundColor: '#f8fafc'},
    darkBg: {backgroundColor: '#0f172a'},

    container: {padding: 16, flex: 1},

    topCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 14,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 14,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    avatar: {width: 86, height: 86, borderRadius: 86 / 2, backgroundColor: '#e5e7eb'},
    name: {fontSize: 18, fontWeight: '700', color: '#0f172a'},
    role: {fontSize: 13, color: '#6b7280', marginTop: 4},

    row: {flexDirection: 'row', alignItems: 'center', marginTop: 8},
    metaText: {marginLeft: 8, color: '#4b5563'},

    statsRow: {flexDirection: 'row', justifyContent: 'space-between', marginBottom: 14},
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        paddingVertical: 14,
        paddingHorizontal: 10,
        marginHorizontal: 6,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    statValue: {fontSize: 20, fontWeight: '700'},
    statLabel: {color: '#6b7280', fontSize: 12, marginTop: 4},

    actions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 14,
    },
    actionBtn: {
        backgroundColor: '#fff',
        flex: 1,
        marginHorizontal: 6,
        paddingVertical: 12,
        borderRadius: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb',
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 8,
    },
    actionText: {marginLeft: 8, color: '#111827', fontWeight: '600'},

    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 12,
    },
    sectionTitle: {fontWeight: '700', marginBottom: 8},

    prefRow: {flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 8},
    prefLabel: {color: '#374151', fontWeight: '600'},
    prefVal: {color: '#6b7280'},

    logoutBtn: {
        backgroundColor: '#ef4444',
        paddingVertical: 12,
        borderRadius: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 8
    },
    logoutText: {color: '#fff', marginLeft: 8, fontWeight: '700'},
});
