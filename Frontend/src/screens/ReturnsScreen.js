// src/screens/ReturnsScreen.js
import React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import {Alert, FlatList, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';

import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';
import {ProductPicker} from '../../components/jsfiles/ProductPicker';

export default function ReturnsScreen({navigation}) {
    const {
        customers,
        products,
        salesHistory,
        incrementStock,
        addReturn,
        user,
        fetchLatestCustomers,
        fetchLatestProducts,
    } = useContext(_AppContext);

    const [form, setForm] = useState({
        invoiceNumber: '',
        recordingDate: '',
        invoiceDate: '',
        customer: '',
        customerName: '',
        totalAmount: '',
        paidAmount: '',
        remarks: '',
    });

    const [items, setItems] = useState([]);
    const [productPickerVisible, setProductPickerVisible] = useState(false);

    // Invoice search
    const [searchInvoice, setSearchInvoice] = useState('');
    const [filteredInvoices, setFilteredInvoices] = useState([]);

    useFocusEffect(
        useCallback(() => {
            fetchLatestCustomers();
            fetchLatestProducts();
        }, [])
    );

    // Filter invoices dynamically with defensive checks
    useEffect(() => {
        if (!searchInvoice) {
            setFilteredInvoices([]);
            return;
        }

        const filtered = (salesHistory || [])
            .filter(sale => sale && sale.invoiceNumber)
            .filter(sale =>
                sale.invoiceNumber.toLowerCase().includes(searchInvoice.toLowerCase())
            );
        setFilteredInvoices(filtered);
    }, [searchInvoice, salesHistory]);

    const dueAmount = useMemo(() => {
        const total = Number(form.totalAmount) || 0;
        const paid = Number(form.paidAmount) || 0;
        return Math.max(total - paid, 0);
    }, [form.totalAmount, form.paidAmount]);

    const selectedCustomerName = form.customerName || 'No customer selected';

    const updateField = (key, value) => setForm(prev => ({...prev, [key]: value}));

    const addReturnedProduct = (product, qty) => {
        if (!product || !product.id) return;

        const pid = String(product.id);
        const quantity = Math.max(1, Number(qty) || 1);

        setItems(prev => {
            const idx = prev.findIndex(i => String(i.id) === pid);
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
                    price: product.sellingPrice || 0,
                },
            ];
        });

        setProductPickerVisible(false);
    };

    const removeItem = id => setItems(prev => prev.filter(i => String(i.id) !== String(id)));

    // Autofill invoice
    const selectInvoice = sale => {
        if (!sale) return;

        const customer = customers.find(c =>
            String(c.id || c._id) === String(sale.customerId) ||
            String(c._id || c.id) === String(sale.customerId)
        );

        setForm({
            invoiceNumber: sale.invoiceNumber || '',
            recordingDate: sale.recordingDate || new Date().toISOString().slice(0, 10),
            invoiceDate: sale.invoiceDate || new Date().toISOString().slice(0, 10),
            customer: customer ? String(customer.id || customer._id) : '',
            customerName: sale.customerName || customer?.name || customer?.customerName || 'Unknown',
            totalAmount: sale.totalAmount?.toString() || '0',
            paidAmount: sale.paidAmount?.toString() || '0',
            remarks: sale.remark || '',
        });

        const validProducts = (sale.products || [])
            .filter(p => p && (p.productId || p._id || p.id))
            .map((p) => ({
                id: String(p.productId || p._id || p.id),
                name: p.productName || 'Unknown Product',
                quantity: Number(p.salesQty) || 0,
                price: Number(p.sellingPrice) || 0,
            }));

        setItems(validProducts);
        setSearchInvoice('');
        setFilteredInvoices([]);
    };

    const submitReturn = async () => {
        if (!form.customer) {
            return Alert.alert('Select customer', 'Please choose a customer');
        }
        if (items.length === 0) {
            return Alert.alert('No products', 'Add at least one returned product');
        }

        const returnRecord = {
            returnNumber: `RET-${Date.now()}`,
            customerId: form.customer,
            customerName: form.customerName || 'Unknown',
            products: items.map(i => ({
                id: i.id,
                name: i.name,
                quantity: i.quantity,
                price: i.price,
            })),
            totalAmount: items.reduce((a, p) => a + p.quantity * p.price, 0),
            remarks: form.remarks || '',
            recordedBy: user?.name || 'Unknown',
            recordedAt: new Date().toISOString(),
        };

        try {
            await incrementStock(items.map(i => ({id: i.id, quantity: i.quantity})));
            await addReturn(returnRecord);

            Alert.alert(
                'Return Recorded',
                `Return #: ${returnRecord.returnNumber}\nItems: ${items.length}`
            );

            setForm({
                invoiceNumber: '',
                recordingDate: '',
                invoiceDate: '',
                customer: '',
                customerName: '',
                totalAmount: '',
                paidAmount: '',
                remarks: '',
            });
            setItems([]);
        } catch (err) {
            console.log('Return submission failed:', err);
            Alert.alert('Error', 'Failed to record return, try again.');
        }
    };

    // Render function for the main content
    const renderContent = () => (
        <>
            {/* Invoice Search */}
            <LabeledInput
                label="Search Invoice"
                value={searchInvoice}
                onChange={setSearchInvoice}
                placeholder="Type invoice number..."
            />
            {filteredInvoices.length > 0 && (
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 8,
                        marginTop: 4,
                        marginBottom: 8,
                        maxHeight: 200,
                        shadowColor: '#000',
                        shadowOffset: {width: 0, height: 2},
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                    }}
                >
                    {filteredInvoices.map((sale, index) => (
                        <TouchableOpacity
                            key={String(sale._id || sale.id || sale.invoiceNumber || `invoice-${index}`)}
                            style={{
                                padding: 10,
                                borderBottomWidth: 1,
                                borderColor: '#e5e7eb',
                            }}
                            onPress={() => selectInvoice(sale)}
                        >
                            <Text>
                                {sale.invoiceNumber || 'No Invoice #'} - {sale.customerName || 'Unknown Customer'}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>
            )}

            {/* Form Card */}
            <View
                style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 12,
                    marginTop: 12,
                    marginBottom: 12,
                }}
            >
                <LabeledInput
                    label="Invoice Number"
                    value={form.invoiceNumber}
                    onChange={v => updateField('invoiceNumber', v)}
                    placeholder="INV-XXXXX"
                />
                <LabeledInput
                    label="Recording Date"
                    value={form.recordingDate}
                    onChange={v => updateField('recordingDate', v)}
                    placeholder="YYYY-MM-DD"
                />
                <LabeledInput
                    label="Invoice Date"
                    value={form.invoiceDate}
                    onChange={v => updateField('invoiceDate', v)}
                    placeholder="YYYY-MM-DD"
                />

                {/* READ-ONLY CUSTOMER FIELD */}
                <View style={{marginBottom: 8}}>
                    <Text style={{color: '#374151', fontWeight: '600', marginBottom: 2}}>
                        Customer
                    </Text>
                    <View
                        style={{
                            padding: 10,
                            borderRadius: 8,
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            backgroundColor: '#f3f4f6',
                        }}
                    >
                        <Text style={{color: form.customer ? '#111827' : '#9ca3af'}}>
                            {selectedCustomerName}
                        </Text>
                    </View>
                </View>

                <View style={{flexDirection: 'row', justifyContent: 'space-between', gap: 8}}>
                    <View style={{flex: 1}}>
                        <LabeledInput
                            label="Total Amount"
                            value={form.totalAmount}
                            onChange={v => updateField('totalAmount', v)}
                            keyboardType="numeric"
                            placeholder="0.00"
                        />
                    </View>
                    <View style={{flex: 1}}>
                        <LabeledInput
                            label="Paid Amount"
                            value={form.paidAmount}
                            onChange={v => updateField('paidAmount', v)}
                            keyboardType="numeric"
                            placeholder="0.00"
                        />
                    </View>
                </View>

                <View style={{marginTop: 4}}>
                    <Text style={{fontSize: 12, color: '#6b7280'}}>Due Amount</Text>
                    <Text style={{paddingVertical: 4, fontWeight: '700', color: '#b91c1c'}}>
                        ${dueAmount.toFixed(2)}
                    </Text>
                </View>

                <LabeledInput
                    label="Remarks"
                    value={form.remarks}
                    onChange={v => updateField('remarks', v)}
                    multiline
                    placeholder="Notes about returned items, reasons, etc."
                />
            </View>

            {/* Returned Products */}
            <View
                style={{
                    backgroundColor: '#fff',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                }}
            >
                <Text style={{fontWeight: '700', marginBottom: 8}}>Returned Products</Text>

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
                    <Text style={{color: '#b91c1c', fontWeight: '600'}}>+ Add Returned Product</Text>
                </TouchableOpacity>

                {items.length === 0 ? (
                    <Text style={{marginTop: 6, color: '#6b7280', fontSize: 12}}>
                        No returned products added yet.
                    </Text>
                ) : (
                    items.map((item, index) => (
                        <View
                            key={String(item.id || `item-${index}`)}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                padding: 8,
                                backgroundColor: '#fef2f2',
                                borderRadius: 8,
                                marginTop: 8,
                            }}
                        >
                            <View style={{flex: 1, paddingRight: 8}}>
                                <Text style={{fontWeight: '700'}}>{item.name || 'Unknown'}</Text>
                                <Text style={{fontSize: 12, color: '#6b7280'}}>
                                    Returned Qty: {item.quantity || 0}
                                </Text>
                            </View>

                            <TouchableOpacity onPress={() => removeItem(item.id)}>
                                <Text style={{color: '#b91c1c', fontSize: 12}}>Remove</Text>
                            </TouchableOpacity>
                        </View>
                    ))
                )}
            </View>

            <TouchableOpacity
                style={{
                    backgroundColor: '#b91c1c',
                    padding: 14,
                    borderRadius: 12,
                    alignItems: 'center',
                    marginBottom: 20,
                }}
                onPress={submitReturn}
            >
                <Text style={{color: '#fff', fontWeight: '700'}}>Submit Return & Update Stock</Text>
            </TouchableOpacity>
        </>
    );

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fef2f2'}}>
            <View style={{flex: 1}}>
                <Header
                    title="Sale Return"
                    onBack={() => navigation.goBack()}
                    backgroundColor="#b91c1c"
                />

                <FlatList
                    data={[{key: 'content'}]}
                    renderItem={() => <View style={{padding: 12}}>{renderContent()}</View>}
                    keyExtractor={item => item.key}
                    keyboardShouldPersistTaps="handled"
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
            </View>
        </SafeAreaView>
    );
}

function LabeledInput({label, value, onChange, keyboardType = 'default', placeholder, multiline = false}) {
    return (
        <View style={{marginBottom: 8}}>
            <Text style={{color: '#374151', fontWeight: '600', marginBottom: 2}}>{label}</Text>
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