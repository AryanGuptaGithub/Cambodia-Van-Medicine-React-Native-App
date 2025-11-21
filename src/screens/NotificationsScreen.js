// src/screens/NotificationsScreen.js
import React, {useContext, useEffect, useState} from 'react';
import {Alert, FlatList, Image, Modal, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Header from '../../components/jsfiles/Header';
import {_NotificationContext} from '../context/_NotificationContext';

// key used in AsyncStorage
const STORAGE_KEY = 'notifications_v1';

// demo image from your uploaded files (dev note: transform path when bundling)
const SAMPLE_IMAGE = '/mnt/data/16e1317b-3d59-4f8c-accf-97815479089d.jpg';

export default function NotificationsScreen({navigation}) {
    const [notifications, setNotifications] = useState([]);
    const [filter, setFilter] = useState('all'); // all | unread
    const [selected, setSelected] = useState(null);
    const {refreshNotifications} = useContext(_NotificationContext);


    useEffect(() => {
        (async () => {
            await ensureSeeded(); // comment this out later when using real backend
            const raw = await AsyncStorage.getItem(STORAGE_KEY);
            if (raw) setNotifications(JSON.parse(raw));
        })();
    }, []);

    const persist = async (next) => {
        setNotifications(next);
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    };

    const seedNotifications = () => {
        const now = Date.now();
        return [
            {
                id: `n-${now}-1`,
                title: 'Sale Completed',
                body: 'Invoice INV-12345 completed successfully.',
                createdAt: new Date().toISOString(),
                read: false,
                image: SAMPLE_IMAGE,
            },
            {
                id: `n-${now}-2`,
                title: 'Low stock alert',
                body: 'Product F has only 8 units left.',
                createdAt: new Date().toISOString(),
                read: false,
            },
            {
                id: `n-${now}-3`,
                title: 'New Customer added',
                body: 'John Pharmacy was added by you.',
                createdAt: new Date().toISOString(),
                read: true,
            },
        ];
    };

    // only seed if empty
    const ensureSeeded = async () => {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(seedNotifications()));
        }
    };

    const markAsRead = async (id) => {
        const next = notifications.map(n =>
            n.id === id ? {...n, read: true} : n
        );

        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
        refreshNotifications();   // 🔥 updates red dot in Header
        setNotifications(next);   // local state update
    };


    const markAllRead = async () => {
        const next = notifications.map(n => ({...n, read: true}));
        await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

        refreshNotifications();   // 🔥 important
        setNotifications(next);
    };


    const clearAll = async () => {
        Alert.alert('Clear all', 'Delete all notifications?', [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Clear',
                style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem(STORAGE_KEY);
                    setNotifications([]);

                    refreshNotifications();  // 🔥 resets header badge

                },
            },
        ]);
    };

    const onPressItem = async (item) => {
        setSelected(item);
        if (!item.read) await markAsRead(item.id);
    };

    const unreadCount = notifications.filter((n) => !n.read).length;

    const filtered = notifications
        .slice()
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .filter((n) => (filter === 'unread' ? !n.read : true));

    const renderItem = ({item}) => (
        <TouchableOpacity onPress={() => onPressItem(item)} style={styles.row}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <View style={styles.thumbWrap}>
                    {item.image ? (
                        <Image source={{uri: item.image}} style={styles.thumb}/>
                    ) : (
                        <Icon name="bell-outline" size={22} color="#2563eb"/>
                    )}
                </View>

                <View style={{flex: 1, marginLeft: 12}}>
                    <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
                        <Text style={[styles.title, item.read ? styles.readTitle : null]} numberOfLines={1}>
                            {item.title}
                        </Text>
                        {!item.read && <View style={styles.unreadDot}/>}
                    </View>
                    <Text style={styles.body} numberOfLines={2}>
                        {item.body}
                    </Text>
                    <Text style={styles.time}>{new Date(item.createdAt).toLocaleString()}</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header title="Notifications" onBack={() => navigation.goBack()} backgroundColor="#2563eb"/>

            {/* Top controls */}
            <View style={styles.controls}>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Text style={{fontWeight: '700', marginRight: 8}}>Filter:</Text>
                    <TouchableOpacity
                        onPress={() => setFilter('all')}
                        style={[styles.filterBtn, filter === 'all' ? styles.filterBtnActive : null]}
                    >
                        <Text style={filter === 'all' ? styles.filterTextActive : styles.filterText}>All</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => setFilter('unread')}
                        style={[styles.filterBtn, filter === 'unread' ? styles.filterBtnActive : null]}
                    >
                        <Text style={filter === 'unread' ? styles.filterTextActive : styles.filterText}>Unread
                            ({unreadCount})</Text>
                    </TouchableOpacity>
                </View>

                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity onPress={markAllRead} style={{marginRight: 12}}>
                        <Text style={{color: '#2563eb', fontWeight: '700'}}>Mark all read</Text>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={clearAll}>
                        <Text style={{color: '#ef4444', fontWeight: '700'}}>Clear</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* List */}
            <FlatList
                data={filtered}
                keyExtractor={(i) => String(i.id)}
                renderItem={renderItem}
                contentContainerStyle={{padding: 12, paddingBottom: 40}}
                ListEmptyComponent={
                    <View style={{padding: 20, alignItems: 'center'}}>
                        <Text style={{color: '#6b7280'}}>No notifications</Text>
                    </View>
                }
            />

            {/* Detail modal */}
            <Modal visible={!!selected} animationType="slide" transparent>
                <View style={styles.detailBackdrop}>
                    <View style={styles.detailCard}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center'}}>
                            <Text style={{fontWeight: '700', fontSize: 16}}>Notification</Text>
                            <TouchableOpacity onPress={() => setSelected(null)}>
                                <Text style={{color: '#ef4444', fontWeight: '700'}}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        {selected?.image ? (
                            <Image source={{uri: selected.image}} style={styles.detailImage}/>
                        ) : null}

                        <Text style={{fontSize: 18, fontWeight: '700', marginTop: 10}}>{selected?.title}</Text>
                        <Text style={{color: '#374151', marginTop: 8}}>{selected?.body}</Text>
                        <Text style={{
                            color: '#9ca3af',
                            marginTop: 12
                        }}>{selected ? new Date(selected.createdAt).toLocaleString() : ''}</Text>

                        <View style={{flexDirection: 'row', marginTop: 16}}>
                            <TouchableOpacity
                                onPress={async () => {
                                    if (!selected) return;
                                    await markAsRead(selected.id);
                                    setSelected(null);
                                }}
                                style={[styles.detailAction, {backgroundColor: '#059669'}]}
                            >
                                <Text style={{color: '#fff', fontWeight: '700'}}>Mark read</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={() => {
                                // delete single notification
                                Alert.alert('Delete', 'Remove this notification?', [
                                    {text: 'Cancel', style: 'cancel'},
                                    {
                                        text: 'Delete',
                                        style: 'destructive',
                                        onPress: async () => {
                                            const next = notifications.filter(n => n.id !== selected.id);

                                            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));

                                            refreshNotifications();   // 🔥 important
                                            setNotifications(next);
                                            setSelected(null);
                                        }

                                    }
                                ]);
                            }} style={[styles.detailAction, {backgroundColor: '#ef4444', marginLeft: 8}]}>
                                <Text style={{color: '#fff', fontWeight: '700'}}>Delete</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    controls: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    filterBtn: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 999,
        backgroundColor: '#f3f4f6',
        marginRight: 8,
    },
    filterBtnActive: {backgroundColor: '#2563eb'},
    filterText: {color: '#374151', fontWeight: '700'},
    filterTextActive: {color: '#fff', fontWeight: '700'},

    row: {
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    thumbWrap: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#f1f5f9',
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    thumb: {width: '100%', height: '100%'},
    title: {fontWeight: '700'},
    readTitle: {color: '#9ca3af'},
    body: {color: '#4b5563', marginTop: 6, fontSize: 13},
    time: {color: '#9ca3af', marginTop: 6, fontSize: 11},
    unreadDot: {width: 10, height: 10, borderRadius: 99, backgroundColor: '#ef4444'},

    detailBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.45)',
        justifyContent: 'flex-end',
    },
    detailCard: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
        padding: 16,
        maxHeight: '70%',
    },
    detailImage: {width: '100%', height: 160, borderRadius: 8, marginTop: 12},
    detailAction: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
});
