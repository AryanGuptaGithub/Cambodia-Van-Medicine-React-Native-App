// src/screens/AttendanceScreen.js
import React, {useEffect, useState} from 'react';
import {Alert, FlatList, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../../components/jsfiles/Header';

const STORAGE_KEY = 'attendanceRecords';

export default function AttendanceScreen() {
    const [records, setRecords] = useState([]);
    const [checkedIn, setCheckedIn] = useState(false);

    useEffect(() => {
        load();
    }, []);

    const load = async () => {
        try {
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) setRecords(JSON.parse(raw));
        } catch (e) {
            console.log('attendance load', e.message);
        }
    };

    const persist = async (next) => {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            setRecords(next);
        } catch (e) {
            console.log('attendance save', e.message);
        }
    };

    const handleCheckIn = async () => {
        const now = new Date();
        const rec = {id: String(Date.now()), type: 'checkin', ts: now.toISOString(), display: now.toLocaleString()};
        const next = [rec, ...records];
        await persist(next);
        setCheckedIn(true);
        Alert.alert('Checked in', `Checked in at ${now.toLocaleTimeString()}`);
    };

    const handleCheckOut = async () => {
        if (!checkedIn) {
            Alert.alert('Not checked in', 'You need to check in first.');
            return;
        }
        const now = new Date();
        const rec = {id: String(Date.now()), type: 'checkout', ts: now.toISOString(), display: now.toLocaleString()};
        const next = [rec, ...records];
        await persist(next);
        setCheckedIn(false);
        Alert.alert('Checked out', `Checked out at ${now.toLocaleTimeString()}`);
    };

    const clearRecords = async () => {
        await AsyncStorage.removeItem(STORAGE_KEY);
        setRecords([]);
        setCheckedIn(false);
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header title="Attendance & Leaves"/>
            <View style={{padding: 12}}>
                <View style={{backgroundColor: '#fff', padding: 16, borderRadius: 12, marginBottom: 12}}>
                    <Text style={{fontWeight: '700', fontSize: 16}}>Today's Check-in</Text>
                    <Text style={{color: '#6b7280', marginTop: 6}}>{new Date().toLocaleDateString()}</Text>

                    <View style={{flexDirection: 'row', marginTop: 12}}>
                        <TouchableOpacity onPress={handleCheckIn} style={{
                            flex: 1,
                            backgroundColor: '#059669',
                            padding: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginRight: 6
                        }}>
                            <Text style={{color: '#fff', fontWeight: '700'}}>Check In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity onPress={handleCheckOut} style={{
                            flex: 1,
                            backgroundColor: '#ef4444',
                            padding: 12,
                            borderRadius: 8,
                            alignItems: 'center',
                            marginLeft: 6
                        }}>
                            <Text style={{color: '#fff', fontWeight: '700'}}>Check Out</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <Text style={{fontWeight: '700', marginBottom: 8}}>Recent Attendance</Text>
                <FlatList
                    data={records}
                    keyExtractor={i => String(i.id)}
                    renderItem={({item}) => (
                        <View style={{
                            backgroundColor: '#fff',
                            padding: 12,
                            borderRadius: 10,
                            marginBottom: 8,
                            flexDirection: 'row',
                            justifyContent: 'space-between'
                        }}>
                            <View>
                                <Text
                                    style={{fontWeight: '700'}}>{item.type === 'checkin' ? 'Check In' : 'Check Out'}</Text>
                                <Text style={{color: '#6b7280'}}>{item.display}</Text>
                            </View>
                        </View>
                    )}
                    ListEmptyComponent={<Text style={{color: '#6b7280'}}>No attendance records</Text>}
                />

                <TouchableOpacity onPress={clearRecords} style={{marginTop: 8, alignItems: 'center'}}>
                    <Text style={{color: '#ef4444'}}>Clear Records</Text>
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}
