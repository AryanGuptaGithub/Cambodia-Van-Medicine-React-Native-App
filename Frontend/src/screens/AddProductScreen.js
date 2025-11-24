// src/screens/AddProductScreen.js
import React, {useContext, useState} from 'react';
import {ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';

export default function AddProductScreen({navigation}) {
    const {addProduct} = useContext(_AppContext);

    const [form, setForm] = useState({
        name: '',
        type: 'Tablet',
        stock: '0',
        sellingPrice: '0',
        purchasingPrice: '0',
        drugLicense: '',
        validity: '',
    });

    const updateField = (key, value) => {
        setForm((prev) => ({...prev, [key]: value}));
    };

    const save = async () => {
        if (!form.name.trim()) {
            return alert('Please enter product name');
        }

        const payload = {
            name: form.name.trim(),
            type: form.type.trim() || 'Tablet',
            stock: Number(form.stock) || 0,
            sellingPrice: Number(form.sellingPrice) || 0,
            purchasingPrice: Number(form.purchasingPrice) || 0,
            drugLicense: form.drugLicense.trim(),
            validity: form.validity.trim(), // YYYY-MM-DD
        };

        await addProduct(payload);
        navigation.goBack();
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header
                title="Add Product"
                onBack={() => navigation.goBack()}
                backgroundColor="#6d28d9"
            />

            <ScrollView
                contentContainerStyle={{padding: 12, paddingBottom: 24}}
                keyboardShouldPersistTaps="handled"
            >
                <LabeledInput
                    label="Product Name *"
                    value={form.name}
                    onChange={(v) => updateField('name', v)}
                    placeholder="Medicine name"
                />

                <LabeledInput
                    label="Type (Tablet / Capsule / Syrup / etc.)"
                    value={form.type}
                    onChange={(v) => updateField('type', v)}
                    placeholder="Tablet"
                />

                <View style={{flexDirection: 'row', gap: 8}}>
                    <View style={{flex: 1}}>
                        <LabeledInput
                            label="Stock"
                            value={form.stock}
                            onChange={(v) => updateField('stock', v)}
                            keyboardType="numeric"
                            placeholder="0"
                        />
                    </View>
                    <View style={{flex: 1}}>
                        <LabeledInput
                            label="Selling Price"
                            value={form.sellingPrice}
                            onChange={(v) => updateField('sellingPrice', v)}
                            keyboardType="numeric"
                            placeholder="0.00"
                        />
                    </View>
                </View>

                <LabeledInput
                    label="Purchasing Price"
                    value={form.purchasingPrice}
                    onChange={(v) => updateField('purchasingPrice', v)}
                    keyboardType="numeric"
                    placeholder="0.00"
                />

                <LabeledInput
                    label="Drug License"
                    value={form.drugLicense}
                    onChange={(v) => updateField('drugLicense', v)}
                    placeholder="DL-XXXX-XXX"
                />

                <LabeledInput
                    label="License Validity (YYYY-MM-DD)"
                    value={form.validity}
                    onChange={(v) => updateField('validity', v)}
                    placeholder="2026-12-31"
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
                    <Text style={{color: '#fff', fontWeight: '700'}}>Save Product</Text>
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
                style={{
                    backgroundColor: '#fff',
                    paddingHorizontal: 10,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                }}
            />
        </View>
    );
}
