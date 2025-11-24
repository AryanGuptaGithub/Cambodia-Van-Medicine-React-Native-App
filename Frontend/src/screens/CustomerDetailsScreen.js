// src/screens/CustomerProfileScreen.js
import React, {useState} from 'react';
import {Image, ScrollView, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/jsfiles/Header';
import * as ImagePicker from 'expo-image-picker'; // Optional: if using expo for image picking

export default function CustomerProfileScreen({route, navigation}) {
    const {customer} = route.params;

    const [profileImage, setProfileImage] = useState(customer.profileImage || null);

    const pickImage = async () => {
        // Optional: use expo-image-picker to select an image
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setProfileImage(result.assets[0].uri);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Customer Profile" onBack={() => navigation.goBack()}/>

            <ScrollView contentContainerStyle={styles.content}>
                <View style={styles.profileCard}>
                    <TouchableOpacity onPress={pickImage}>
                        <Image
                            source={
                                profileImage
                                    ? {uri: profileImage}
                                    : require('../../assets/profilepicture/profilepicture1.png')
                            }
                            style={styles.profileImage}
                        />
                        <Text style={styles.changePhotoText}>Change Photo</Text>
                    </TouchableOpacity>

                    <Text style={styles.name}>{customer.name}</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{customer.agent || 'Customer'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Phone:</Text>
                        <Text style={styles.value}>{customer.phone || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Email:</Text>
                        <Text style={styles.value}>{customer.email || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Address:</Text>
                        <Text style={styles.value}>{customer.address || 'N/A'}</Text>
                    </View>

                    <View style={styles.infoRow}>
                        <Text style={styles.label}>Date Added:</Text>
                        <Text style={styles.value}>{customer.dateAdded || 'N/A'}</Text>
                    </View>

                    {typeof customer.outstanding === 'number' && (
                        <View style={styles.outstandingContainer}>
                            <Text style={styles.outstandingLabel}>Outstanding:</Text>
                            <Text style={styles.outstandingValue}>${customer.outstanding}</Text>
                        </View>
                    )}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    content: {
        padding: 16,
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOpacity: 0.05,
        shadowRadius: 10,
        shadowOffset: {width: 0, height: 4},
        elevation: 5,
    },
    profileImage: {
        width: 120,
        height: 120,
        borderRadius: 60,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#2563eb',
    },
    changePhotoText: {
        fontSize: 12,
        color: '#2563eb',
        marginTop: 4,
        textAlign: 'center',
    },
    name: {
        fontSize: 22,
        fontWeight: '700',
        marginBottom: 4,
        textAlign: 'center',
    },
    badge: {
        backgroundColor: '#e0f2fe',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 16,
    },
    badgeText: {
        color: '#0369a1',
        fontWeight: '600',
        fontSize: 12,
    },
    infoRow: {
        flexDirection: 'row',
        width: '100%',
        marginBottom: 8,
    },
    label: {
        fontWeight: '600',
        color: '#374151',
        width: 90,
    },
    value: {
        color: '#1f2937',
        flex: 1,
        flexWrap: 'wrap',
    },
    outstandingContainer: {
        marginTop: 16,
        padding: 12,
        backgroundColor: '#fee2e2',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    outstandingLabel: {
        fontWeight: '600',
        color: '#b91c1c',
    },
    outstandingValue: {
        fontWeight: '700',
        color: '#b91c1c',
    },
});
