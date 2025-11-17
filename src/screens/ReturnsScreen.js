// src/screens/ReturnsScreen.js
import React, {useContext, useMemo, useState} from 'react';
import {Alert, FlatList, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';
import CustomerPicker from '../../components/jsfiles/CustomerPicker';
import ProductPicker from '../../components/jsfiles/ProductPicker';

export default function ReturnsScreen({navigation}) {
    const {customers, products, incrementStock} = useContext(_AppContext);

    const [form, setForm] = useState({
        invoiceNumber: '',
        recordingDate: '',
        invoiceDate: '',
        customer: '',
        totalAmount: '',
        paidAmount: '',
        remarks: '',
    });

    const [items, setItems] = useState([]);
    const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
    const [productPickerVisible, setProductPickerVisible] = useState(false);

    const dueAmount = useMemo(() => {
        const total = Number(form.totalAmount) || 0;
        const paid = Number(form.paidAmount) || 0;
        return Math.max(total - paid, 0);
    }, [form.totalAmount, form.paidAmount]);

    const selectedCustomerName =
        customers.find((c) => String(c.id) === String(form.customer))?.name ??
        'Select Customer';

    const updateField = (key, value) =>
        setForm((prev) => ({...prev, [key]: value}));

    const addReturnedProduct = (product, qty) => {
        const pid = String(product.id);
        const quantity = Math.max(1, Number(qty) || 1);

        setItems((prev) => {
            const idx = prev.findIndex((i) => String(i.id) === pid);
            if (idx >= 0) {
                const updated = [...prev];
                updated[idx] = {
                    ...updated[idx],
                    quantity: updated[idx].quantity + quantity,
                };
                return updated;
            }
            return [
                ...prev,
                {
                    ...product,
                    id: pid,
                    quantity,
                    price: product.sellingPrice,
                },
            ];
        });

        setProductPickerVisible(false);
    };

    const removeItem = (id) => {
        setItems((prev) => prev.filter((i) => String(i.id) !== String(id)));
    };

    const submitReturn = async () => {
        if (!form.customer) {
            return Alert.alert('Select customer', 'Please choose a customer');
        }
        if (items.length === 0) {
            return Alert.alert('No products', 'Add at least one returned product');
        }

        // In a future step we can save this as a returnsHistory record.
        // For now: only update stock.
        await incrementStock(
            items.map((i) => ({
                id: i.id,
                quantity: i.quantity,
            }))
        );

        Alert.alert(
            'Return recorded',
            `Invoice: ${form.invoiceNumber || 'N/A'}\nItems: ${items.length}`
        );

        // Reset
        setForm({
            invoiceNumber: '',
            recordingDate: '',
            invoiceDate: '',
            customer: '',
            totalAmount: '',
            paidAmount: '',
            remarks: '',
        });
        setItems([]);
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fef2f2'}}>
            <Header
                title="Sale Return"
                onBack={() => navigation.goBack()}
                backgroundColor="#b91c1c"
            />

            <View style={{flex: 1, padding: 12}}>
                {/* Top form card */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <LabeledInput
                        label="Invoice Number"
                        value={form.invoiceNumber}
                        onChange={(v) => updateField('invoiceNumber', v)}
                        placeholder="INV-XXXXX"
                    />

                    <LabeledInput
                        label="Recording Date"
                        value={form.recordingDate}
                        onChange={(v) => updateField('recordingDate', v)}
                        placeholder="YYYY-MM-DD"
                    />

                    <LabeledInput
                        label="Invoice Date"
                        value={form.invoiceDate}
                        onChange={(v) => updateField('invoiceDate', v)}
                        placeholder="YYYY-MM-DD"
                    />

                    <Text
                        style={{
                            color: '#374151',
                            fontWeight: '600',
                            marginTop: 8,
                            marginBottom: 4,
                        }}
                    >
                        Customer
                    </Text>
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            backgroundColor: '#f9fafb',
                            marginBottom: 8,
                        }}
                        onPress={() => setCustomerPickerVisible(true)}
                    >
                        <Text
                            style={{
                                color: form.customer ? '#111827' : '#9ca3af',
                            }}
                        >
                            {selectedCustomerName}
                        </Text>
                    </TouchableOpacity>

                    {/* Amounts */}
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: 8,
                        }}
                    >
                        <View style={{flex: 1}}>
                            <LabeledInput
                                label="Total Amount"
                                value={form.totalAmount}
                                onChange={(v) => updateField('totalAmount', v)}
                                keyboardType="numeric"
                                placeholder="0.00"
                            />
                        </View>
                        <View style={{flex: 1}}>
                            <LabeledInput
                                label="Paid Amount"
                                value={form.paidAmount}
                                onChange={(v) => updateField('paidAmount', v)}
                                keyboardType="numeric"
                                placeholder="0.00"
                            />
                        </View>
                    </View>

                    <View style={{marginTop: 4}}>
                        <Text style={{fontSize: 12, color: '#6b7280'}}>Due Amount</Text>
                        <Text
                            style={{
                                paddingVertical: 4,
                                fontWeight: '700',
                                color: '#b91c1c',
                            }}
                        >
                            ${dueAmount.toFixed(2)}
                        </Text>
                    </View>

                    <LabeledInput
                        label="Remarks"
                        value={form.remarks}
                        onChange={(v) => updateField('remarks', v)}
                        multiline
                        placeholder="Notes about returned items, reasons, etc."
                    />
                </View>

                {/* Returned products */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <Text style={{fontWeight: '700', marginBottom: 8}}>
                        Returned Products
                    </Text>

                    <TouchableOpacity
                        style={{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#fecaca',
                            borderStyle: 'dashed',
                            alignItems: 'center',
                        }}
                        onPress={() => setProductPickerVisible(true)}
                    >
                        <Text style={{color: '#b91c1c', fontWeight: '600'}}>
                            + Add Returned Product
                        </Text>
                    </TouchableOpacity>

                    {items.length === 0 ? (
                        <Text style={{marginTop: 6, color: '#6b7280', fontSize: 12}}>
                            No returned products added yet.
                        </Text>
                    ) : (
                        <FlatList
                            data={items}
                            keyExtractor={(i) => String(i.id)}
                            scrollEnabled={false}
                            style={{marginTop: 8}}
                            renderItem={({item}) => (
                                <View
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        padding: 8,
                                        backgroundColor: '#fef2f2',
                                        borderRadius: 8,
                                        marginBottom: 6,
                                    }}
                                >
                                    <View style={{flex: 1, paddingRight: 8}}>
                                        <Text style={{fontWeight: '700'}}>{item.name}</Text>
                                        <Text style={{fontSize: 12, color: '#6b7280'}}>
                                            Returned Qty: {item.quantity}
                                        </Text>
                                    </View>

                                    <TouchableOpacity onPress={() => removeItem(item.id)}>
                                        <Text style={{color: '#b91c1c', fontSize: 12}}>
                                            Remove
                                        </Text>
                                    </TouchableOpacity>
                                </View>
                            )}
                        />
                    )}
                </View>

                <TouchableOpacity
                    style={{
                        backgroundColor: '#b91c1c',
                        padding: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                    }}
                    onPress={submitReturn}
                >
                    <Text style={{color: '#fff', fontWeight: '700'}}>
                        Submit Return & Update Stock
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Customer Picker */}
            <CustomerPicker
                visible={customerPickerVisible}
                onClose={() => setCustomerPickerVisible(false)}
                customers={customers}
                onSelect={(c) => {
                    updateField('customer', String(c.id));
                    setCustomerPickerVisible(false);
                }}
            />

            {/* Product Picker */}
            <ProductPicker
                visible={productPickerVisible}
                onClose={() => setProductPickerVisible(false)}
                products={products}
                onAddProduct={(product, qty) => addReturnedProduct(product, qty)}
                onUpdateProduct={() => {
                }}
            />
        </SafeAreaView>
    );
}

function LabeledInput({
                          label,
                          value,
                          onChange,
                          keyboardType = 'default',
                          placeholder,
                          multiline = false,
                      }) {
    return (
        <View style={{marginBottom: 8}}>
            <Text style={{color: '#374151', fontWeight: '600', marginBottom: 2}}>
                {label}
            </Text>
            <TextInput
                value={value}
                onChangeText={onChange}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor="#9ca3af"
                multiline={multiline}
                style={{
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                    borderRadius: 8,
                    paddingHorizontal: 10,
                    paddingVertical: multiline ? 8 : 6,
                    minHeight: multiline ? 60 : undefined,
                    backgroundColor: '#f9fafb',
                    textAlignVertical: multiline ? 'top' : 'center',
                }}
            />
        </View>
    );
}
