// src/screens/ReturnsScreen.js
import React, {useCallback, useContext, useState} from 'react';
import {Alert, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';

export default function ReturnsScreen({navigation}) {
    const {customers, addSaleRecord} = useContext(_AppContext);

    const [form, setForm] = useState({
        invoiceNumber: '',
        recordingDate: new Date().toISOString().slice(0, 10),
        invoiceDate: new Date().toISOString().slice(0, 10),
        medRep: '',
        customerId: '',
        creditDays: '30',
        totalAmount: '0.00',
        paidAmount: '0.00',
        dueAmount: '0.00',
        dueDate: new Date().toISOString().slice(0, 10),
        deliveryDate: new Date().toISOString().slice(0, 10),
        products: '',
        remarks: ''
    });

    const [customerPickerVisible, setCustomerPickerVisible] = useState(false);

    // computeDue safely when called explicitly
    const computeDue = useCallback(({totalAmount, paidAmount}) => {
        const t = Number(totalAmount) || 0;
        const p = Number(paidAmount) || 0;
        return (t - p).toFixed(2);
    }, []);

    // call this on blur of total/paid inputs
    const handleBlurCalculate = () => {
        const due = computeDue({totalAmount: form.totalAmount, paidAmount: form.paidAmount});
        // Only update if it's different to avoid unnecessary re-renders
        if (String(due) !== String(form.dueAmount)) {
            setForm(prev => ({...prev, dueAmount: String(due)}));
        }
    };

    const submit = () => {
        if (!form.invoiceNumber) return Alert.alert('Validation', 'Provide invoice number');
        if (!form.customerId) return Alert.alert('Validation', 'Select customer');

        const record = {
            type: 'return',
            invoiceNumber: form.invoiceNumber,
            recordingDate: form.recordingDate,
            invoiceDate: form.invoiceDate,
            medRep: form.medRep,
            customerId: form.customerId,
            creditDays: Number(form.creditDays) || 0,
            totalAmount: Number(form.totalAmount) || 0,
            paidAmount: Number(form.paidAmount) || 0,
            dueAmount: Number(form.dueAmount) || 0,
            dueDate: form.dueDate,
            deliveryDate: form.deliveryDate,
            products: form.products,
            remarks: form.remarks,
            createdAt: new Date().toISOString()
        };

        addSaleRecord(record);
        Alert.alert('Return recorded', `Return ${form.invoiceNumber} saved.`);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header title="Add Sale Return" onBack={() => navigation.goBack()}/>

            <ScrollView contentContainerStyle={{padding: 12}}>
                <Labeled label="Invoice Number">
                    <TextInput
                        value={form.invoiceNumber}
                        onChangeText={(v) => setForm(prev => ({...prev, invoiceNumber: v}))}
                        placeholder="INV-XXXXX"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Recording Date">
                    <TextInput
                        value={form.recordingDate}
                        onChangeText={(v) => setForm(prev => ({...prev, recordingDate: v}))}
                        placeholder="YYYY-MM-DD"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Invoice Date">
                    <TextInput
                        value={form.invoiceDate}
                        onChangeText={(v) => setForm(prev => ({...prev, invoiceDate: v}))}
                        placeholder="YYYY-MM-DD"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Med Rep">
                    <TextInput
                        value={form.medRep}
                        onChangeText={(v) => setForm(prev => ({...prev, medRep: v}))}
                        placeholder="Rep name"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Customer">
                    <TouchableOpacity
                        onPress={() => setCustomerPickerVisible(true)}
                        style={{
                            padding: 10,
                            borderRadius: 8,
                            backgroundColor: '#fff',
                            borderWidth: 1,
                            borderColor: '#e6e6e6'
                        }}
                    >
                        <Text>
                            {customers.find(c => String(c.id) === String(form.customerId))?.name ?? 'Choose customer (tap to select)'}
                        </Text>
                    </TouchableOpacity>
                    <Text style={{color: '#6b7280', fontSize: 12, marginTop: 4}}>
                        Tip: use Customers screen to add customers or pick from list
                    </Text>
                </Labeled>

                <Labeled label="Total Amount">
                    <TextInput
                        keyboardType="numeric"
                        value={form.totalAmount}
                        onChangeText={(v) => setForm(prev => ({...prev, totalAmount: v}))}
                        onBlur={handleBlurCalculate}
                        placeholder="0.00"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Paid Amount">
                    <TextInput
                        keyboardType="numeric"
                        value={form.paidAmount}
                        onChangeText={(v) => setForm(prev => ({...prev, paidAmount: v}))}
                        onBlur={handleBlurCalculate}
                        placeholder="0.00"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Due Amount">
                    <TextInput
                        keyboardType="numeric"
                        value={form.dueAmount}
                        editable={false}
                        placeholder="0.00"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Due Date">
                    <TextInput
                        value={form.dueDate}
                        onChangeText={(v) => setForm(prev => ({...prev, dueDate: v}))}
                        placeholder="YYYY-MM-DD"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Delivery Date">
                    <TextInput
                        value={form.deliveryDate}
                        onChangeText={(v) => setForm(prev => ({...prev, deliveryDate: v}))}
                        placeholder="YYYY-MM-DD"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Products (details)">
                    <TextInput
                        value={form.products}
                        onChangeText={(v) => setForm(prev => ({...prev, products: v}))}
                        placeholder="Product1 x2, Product2 x1"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8}}
                    />
                </Labeled>

                <Labeled label="Remarks">
                    <TextInput
                        value={form.remarks}
                        onChangeText={(v) => setForm(prev => ({...prev, remarks: v}))}
                        multiline
                        placeholder="Notes about return"
                        style={{padding: 8, backgroundColor: '#fff', borderRadius: 8, height: 80}}
                    />
                </Labeled>

                <TouchableOpacity
                    onPress={submit}
                    style={{
                        backgroundColor: '#ef4444',
                        padding: 14,
                        borderRadius: 10,
                        alignItems: 'center',
                        marginTop: 12
                    }}
                >
                    <Text style={{color: '#fff', fontWeight: '700'}}>Submit Return</Text>
                </TouchableOpacity>
            </ScrollView>

            {/*<CustomerPicker*/}
            {/*    visible={customerPickerVisible}*/}
            {/*    onClose={() => setCustomerPickerVisible(false)}*/}
            {/*    customers={customers}*/}
            {/*    onSelect={(c) => {*/}
            {/*        setForm(prev => ({...prev, customerId: String(c.id)}));*/}
            {/*        setCustomerPickerVisible(false);*/}
            {/*    }}*/}
            {/*/>*/}
        </SafeAreaView>
    );
}

const Labeled = ({label, children}) => (
    <View style={{marginBottom: 12}}>
        <Text style={{fontWeight: '700', marginBottom: 6}}>{label}</Text>
        <View style={{backgroundColor: '#fff', padding: 8, borderRadius: 8, borderWidth: 1, borderColor: '#e6e6e6'}}>
            {children}
        </View>
    </View>
);
