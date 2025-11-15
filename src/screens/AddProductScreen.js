// src/screens/AddProductScreen.js
import React, {useContext, useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {_AppContext} from '../context/_AppContext'
import {SafeAreaView} from 'react-native-safe-area-context';


export default function AddProductScreen({navigation}) {
    const {addProduct} = useContext(_AppContext);

    const [form, setForm] = useState({
        name: '',
        type: 'Tablet',
        stock: '0',
        sellingPrice: '0',
        purchasingPrice: '0',
        drugLicense: '',
        validity: ''
    });

    const save = () => {
        if (!form.name) return alert('Provide name');
        addProduct({
            name: form.name,
            type: form.type,
            stock: Number(form.stock) || 0,
            sellingPrice: Number(form.sellingPrice) || 0,
            purchasingPrice: Number(form.purchasingPrice) || 0,
            drugLicense: form.drugLicense,
            validity: form.validity
        });
        navigation.goBack();
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <View style={{
                padding: 12,
                backgroundColor: '#6d28d9',
                flexDirection: 'row',
                justifyContent: 'space-between'
            }}>
                <TouchableOpacity onPress={() => navigation.goBack()}><Text
                    style={{color: '#fff'}}>Back</Text></TouchableOpacity>
                <Text style={{color: '#fff', fontWeight: '700'}}>Add Product</Text>
                <View style={{width: 40}}/>
            </View>

            <ScrollView contentContainerStyle={{padding: 12}}>
                <LabeledInput label="Product Name" value={form.name} onChange={(v) => setForm({...form, name: v})}/>
                <LabeledInput label="Type" value={form.type} onChange={(v) => setForm({...form, type: v})}/>
                <LabeledInput label="Stock" value={form.stock} onChange={(v) => setForm({...form, stock: v})}
                              keyboardType="numeric"/>
                <LabeledInput label="Selling Price" value={form.sellingPrice}
                              onChange={(v) => setForm({...form, sellingPrice: v})} keyboardType="numeric"/>
                <LabeledInput label="Purchasing Price" value={form.purchasingPrice}
                              onChange={(v) => setForm({...form, purchasingPrice: v})} keyboardType="numeric"/>
                <LabeledInput label="Drug License" value={form.drugLicense}
                              onChange={(v) => setForm({...form, drugLicense: v})}/>
                <LabeledInput label="Validity (YYYY-MM-DD)" value={form.validity}
                              onChange={(v) => setForm({...form, validity: v})}/>

                <TouchableOpacity onPress={save} style={{
                    backgroundColor: '#059669',
                    padding: 14,
                    borderRadius: 10,
                    marginTop: 12,
                    alignItems: 'center'
                }}>
                    <Text style={{color: '#fff', fontWeight: '700'}}>Save Product</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const LabeledInput = ({label, value, onChange, keyboardType = 'default'}) => (
    <View style={{marginBottom: 10}}>
        <Text style={{fontWeight: '700', marginBottom: 6}}>{label}</Text>
        <TextInput
            value={value}
            onChangeText={onChange}
            keyboardType={keyboardType}
            style={{backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e6e6e6'}}
        />
    </View>
);
