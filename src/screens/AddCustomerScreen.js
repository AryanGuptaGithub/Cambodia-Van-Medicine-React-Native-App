// src/screens/AddCustomerScreen.js
import React, {useContext, useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';

export default function AddCustomerScreen({navigation}) {
    const {addCustomer} = useContext(_AppContext);

    const [form, setForm] = useState({
        name: '',
        agent: '',
        medRep: '',
        phone: '',
        zone: 'Zone A',
        province: '',
        address: '',
        remark: '',
        outstanding: '0',
    });

    const updateField = (key, value) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    const save = async () => {
        if (!form.name.trim()) {
            return alert('Please enter customer name');
        }

        const customerPayload = {
            name: form.name.trim(),
            agent: form.agent.trim() || 'Pharmacy',
            medRep: form.medRep.trim(),
            phone: form.phone.trim(),
            zone: form.zone || 'Zone A',
            province: form.province.trim(),
            address: form.address.trim(),
            remark: form.remark.trim(),
            outstanding: Number(form.outstanding) || 0,
        };

        await addCustomer(customerPayload);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header
                title="Add Customer"
                onBack={() => navigation.goBack()}
                backgroundColor="#2563eb"
            />

            <ScrollView
                contentContainerStyle={{padding: 12, paddingBottom: 24}}
                keyboardShouldPersistTaps="handled"
            >
                <LabeledInput
                    label="Customer Name *"
                    value={form.name}
                    onChange={(v) => updateField('name', v)}
                    placeholder="Business name"
                />

                <LabeledInput
                    label="Type of Business"
                    value={form.agent}
                    onChange={(v) => updateField('agent', v)}
                    placeholder="Pharmacy / Hospital / Clinic"
                />

                <LabeledInput
                    label="Medical Representative Name"
                    value={form.medRep}
                    onChange={(v) => updateField('medRep', v)}
                    placeholder="Contact person"
                />

                <LabeledInput
                    label="Phone Number"
                    value={form.phone}
                    onChange={(v) => updateField('phone', v)}
                    placeholder="012-XXX-XXX"
                    keyboardType="phone-pad"
                />

                <LabeledInput
                    label="Address"
                    value={form.address}
                    onChange={(v) => updateField('address', v)}
                    placeholder="Full address"
                    multiline
                />

                {/* Zone + Province side by side */}
                <View style={{flexDirection: 'row', gap: 8}}>
                    <View style={{flex: 1}}>
                        <Text style={{fontWeight: '700', marginBottom: 4}}>Zone</Text>
                        <View
                            style={{
                                borderWidth: 1,
                                borderColor: '#e5e7eb',
                                borderRadius: 8,
                                backgroundColor: '#f9fafb',
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                            }}
                        >
                            <TextInput
                                value={form.zone}
                                onChangeText={(v) => updateField('zone', v)}
                                placeholder="Zone A"
                                placeholderTextColor="#9ca3af"
                            />
                        </View>
                    </View>

                    <View style={{flex: 1}}>
                        <LabeledInput
                            label="Province"
                            value={form.province}
                            onChange={(v) => updateField('province', v)}
                            placeholder="Province"
                        />
                    </View>
                </View>

                {/*<LabeledInput*/}
                {/*    label="Outstanding Balance (USD)"*/}
                {/*    value={form.outstanding}*/}
                {/*    onChange={(v) => updateField('outstanding', v)}*/}
                {/*    keyboardType="numeric"*/}
                {/*    placeholder="0.00"*/}
                {/*/>*/}

                <LabeledInput
                    label="Remark"
                    value={form.remark}
                    onChange={(v) => updateField('remark', v)}
                    placeholder="Additional notes"
                    multiline
                />

                <TouchableOpacity
                    onPress={save}
                    style={{
                        backgroundColor: '#059669',
                        padding: 14,
                        borderRadius: 12,
                        marginTop: 12,
                        alignItems: 'center',
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
                style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 10,
                    paddingVertical: multiline ? 8 : 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    minHeight: multiline ? 60 : undefined,
                    textAlignVertical: multiline ? 'top' : 'center',
                }}
            />
        </View>
    );
}
