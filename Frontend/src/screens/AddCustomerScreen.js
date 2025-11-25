// src/screens/AddCustomerScreen.js
import React, {useContext, useEffect, useState} from 'react';
import {Alert, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {Picker} from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';
import {fetchProvinces, fetchZones} from '../api/_api';

export default function AddCustomerScreen({navigation}) {
    const {addCustomer} = useContext(_AppContext);

    const [zones, setZones] = useState([]);
    const [provinces, setProvinces] = useState([]);
    const [form, setForm] = useState({
        name: '',
        email: '',
        typeOfBusiness: 'Pharmacy',
        medRep: '', // will be auto-filled
        phone: '',
        zone: '',
        province: '',
        address: '',
        remark: '',
        date: new Date().toISOString().split('T')[0],
    });

    useEffect(() => {
        (async () => {
            try {
                const z = await fetchZones();
                const p = await fetchProvinces();
                setZones(z);
                setProvinces(p);

                // Auto-fill MR name from logged-in user
                const userStr = await AsyncStorage.getItem('user');
                const user = userStr ? JSON.parse(userStr) : {};
                if (user?.name) {
                    updateField('medRep', user.name);
                }
            } catch (err) {
                console.error('Failed to fetch zones/provinces:', err.message);
            }
        })();
    }, []);

    const updateField = (key, value) => setForm(prev => ({...prev, [key]: value}));

    const save = async () => {
        if (!form.name.trim()) return Alert.alert('Validation', 'Please enter customer name');

        try {
            // We only pass fields that context needs. customerCode is generated in context.
            const customerPayload = {
                name: form.name.trim(),
                email: form.email.trim(),
                typeOfBusiness: form.typeOfBusiness,
                medRep: form.medRep, // context will map to medicalRepName
                phone: form.phone.trim(),
                zone: form.zone,
                province: form.province,
                address: form.address.trim(),
                remark: form.remark.trim(),
                date: form.date,
            };

            const newCustomer = await addCustomer(customerPayload);

            Alert.alert('Success', `Customer ${newCustomer.name} added!`);
            navigation.goBack();
        } catch (err) {
            console.error('Save customer error:', err.response?.data || err.message);
            Alert.alert('Error', 'Failed to add customer. See console for details.');
        }
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header title="Add Customer" onBack={() => navigation.goBack()} backgroundColor="#2563eb"/>
            <ScrollView contentContainerStyle={{padding: 12, paddingBottom: 24}} keyboardShouldPersistTaps="handled">
                <LabeledInput label="Customer Name *" value={form.name} onChange={v => updateField('name', v)}
                              placeholder="Business name"/>
                <LabeledInput label="Email" value={form.email} onChange={v => updateField('email', v)}
                              placeholder="Email address" keyboardType="email-address"/>

                <View style={{marginBottom: 10}}>
                    <Text style={{fontWeight: '700', marginBottom: 4}}>Type of Business</Text>
                    <View style={{borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8, backgroundColor: '#f9fafb'}}>
                        <Picker selectedValue={form.typeOfBusiness}
                                onValueChange={v => updateField('typeOfBusiness', v)}>
                            {['Pharmacy', 'Hospital', 'Clinic', 'Distributor', 'Agent'].map(t => (
                                <Picker.Item key={t} label={t} value={t}/>
                            ))}
                        </Picker>
                    </View>
                </View>

                <LabeledInput label="Medical Representative Name" value={form.medRep}
                              onChange={v => updateField('medRep', v)} placeholder="Auto-filled" editable={false}/>
                <LabeledInput label="Phone Number" value={form.phone} onChange={v => updateField('phone', v)}
                              placeholder="012-XXX-XXX" keyboardType="phone-pad"/>
                <LabeledInput label="Address" value={form.address} onChange={v => updateField('address', v)}
                              placeholder="Full address" multiline/>

                <View style={{flexDirection: 'row', gap: 8}}>
                    <View style={{flex: 1}}>
                        <Text style={{fontWeight: '700', marginBottom: 4}}>Zone</Text>
                        <View style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            backgroundColor: '#f9fafb'
                        }}>
                            <Picker selectedValue={form.zone} onValueChange={v => updateField('zone', v)}>
                                {zones.map(z => <Picker.Item key={z} label={z} value={z}/>)}
                            </Picker>
                        </View>
                    </View>

                    <View style={{flex: 1}}>
                        <Text style={{fontWeight: '700', marginBottom: 4}}>Province</Text>
                        <View style={{
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8,
                            backgroundColor: '#f9fafb'
                        }}>
                            <Picker selectedValue={form.province} onValueChange={v => updateField('province', v)}>
                                {provinces.map(p => <Picker.Item key={p} label={p} value={p}/>)}
                            </Picker>
                        </View>
                    </View>
                </View>

                <LabeledInput label="Date Added" value={form.date} onChange={v => updateField('date', v)}
                              placeholder="YYYY-MM-DD"/>
                <LabeledInput label="Remark" value={form.remark} onChange={v => updateField('remark', v)}
                              placeholder="Additional notes" multiline/>

                <TouchableOpacity
                    onPress={save}
                    style={{
                        backgroundColor: '#059669',
                        padding: 14,
                        borderRadius: 12,
                        marginTop: 12,
                        alignItems: 'center'
                    }}
                >
                    <Text style={{color: '#fff', fontWeight: '700'}}>Save Customer</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

function LabeledInput({
                          label,
                          value,
                          onChange,
                          placeholder = '',
                          keyboardType = 'default',
                          multiline = false,
                          editable = true
                      }) {
    return (
        <View style={{marginBottom: 10}}>
            <Text style={{fontWeight: '700', marginBottom: 4}}>{label}</Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                keyboardType={keyboardType}
                multiline={multiline}
                editable={editable}
                style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 10,
                    paddingVertical: multiline ? 8 : 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    minHeight: multiline ? 60 : undefined,
                    textAlignVertical: multiline ? 'top' : 'center',
                    color: editable ? '#374151' : '#6b7280',
                }}
            />
        </View>
    );
}
