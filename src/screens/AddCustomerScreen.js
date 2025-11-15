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
        remark: ''
    });

    const save = () => {
        if (!form.name) return alert('Provide name');
        addCustomer(form);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header title="Add Customer" onBack={() => navigation.goBack()}/>
            <ScrollView contentContainerStyle={{padding: 12}}>
                <LabeledInput label="Customer Name" value={form.name} onChange={(v) => setForm({...form, name: v})}/>
                <LabeledInput label="Type" value={form.agent} onChange={(v) => setForm({...form, agent: v})}
                              placeholder="Pharmacy/Hospital/Clinic"/>
                <LabeledInput label="Med Rep" value={form.medRep} onChange={(v) => setForm({...form, medRep: v})}/>
                <LabeledInput label="Phone" value={form.phone} onChange={(v) => setForm({...form, phone: v})}/>
                <LabeledInput label="Province" value={form.province} onChange={(v) => setForm({...form, province: v})}/>
                <LabeledInput label="Remark" value={form.remark} onChange={(v) => setForm({...form, remark: v})}
                              multiline/>

                <TouchableOpacity onPress={save} style={{
                    backgroundColor: '#059669',
                    padding: 14,
                    borderRadius: 10,
                    marginTop: 12,
                    alignItems: 'center'
                }}>
                    <Text style={{color: '#fff', fontWeight: '700'}}>Save Customer</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const LabeledInput = ({label, value, onChange, placeholder = '', multiline = false}) => (
    <View style={{marginBottom: 10}}>
        <Text style={{fontWeight: '700', marginBottom: 6}}>{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChange}
            placeholder={placeholder}
            multiline={multiline}
            style={{backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e6e6e6'}}
        />
    </View>
);
