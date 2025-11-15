// src/screens/SalesScreen.js
import React, {useContext, useMemo, useState} from 'react';
import {Alert, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';
import CustomerPicker from '../../components/jsfiles/CustomerPicker';
import ProductPicker from '../../components/jsfiles/ProductPicker';

export default function SalesScreen({navigation}) {
    const {customers, products, addSaleRecord, decrementStock} = useContext(_AppContext);

    const [saleData, setSaleData] = useState({
        customer: '',
        invoiceNumber: 'INV-' + Date.now(),
        discount: '0'
    });
    const [cart, setCart] = useState([]);
    const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
    const [productPickerVisible, setProductPickerVisible] = useState(false);

    const [editingItem, setEditingItem] = useState(null);
    const [editingQty, setEditingQty] = useState('1');
    const [editingModalVisible, setEditingModalVisible] = useState(false);

    const subtotal = useMemo(() => cart.reduce((s, it) => s + it.quantity * it.price, 0), [cart]);
    const discountNumeric = Number(saleData.discount) || 0;
    const total = useMemo(() => +(subtotal * (1 - discountNumeric / 100)).toFixed(2), [subtotal, discountNumeric]);

    const addProductToCart = (product, qty) => {
        const pid = String(product.id);
        const quantity = Math.max(1, Number(qty) || 1);

        // stock check:
        if (typeof product.stock === 'number' && product.stock >= 0) {
            // find existing qty in cart
            const existing = cart.find(c => String(c.id) === pid);
            const existingQty = existing ? existing.quantity : 0;
            if (existingQty + quantity > product.stock) {
                return Alert.alert('Stock exceeded', `Only ${product.stock - existingQty} more available for ${product.name}`);
            }
        }

        setCart(prev => {
            const existingIndex = prev.findIndex(item => String(item.id) === pid);
            if (existingIndex >= 0) {
                const updated = [...prev];
                updated[existingIndex].quantity += quantity;
                return updated;
            } else {
                return [...prev, {...product, id: pid, quantity, price: product.sellingPrice}];
            }
        });

        setProductPickerVisible(false);
    };

    const removeFromCart = pid => {
        setCart(prev => prev.filter(item => String(item.id) !== String(pid)));
    };

    const openEditItem = (item) => {
        setEditingItem(item);
        setEditingQty(String(item.quantity));
        setEditingModalVisible(true);
    };

    const saveEditQty = () => {
        if (!editingItem) return;
        const qty = Math.max(1, parseInt(editingQty, 10) || 1);

        // check against product stock
        const product = products.find(p => String(p.id) === String(editingItem.id));
        if (product && typeof product.stock === 'number' && qty > product.stock) {
            Alert.alert('Stock exceeded', `Only ${product.stock} available for ${product.name}`);
            return;
        }

        setCart(prev => prev.map(it => (String(it.id) === String(editingItem.id) ? {...it, quantity: qty} : it)));
        setEditingModalVisible(false);
        setEditingItem(null);
        setEditingQty('1');
    };

    const incrementEditingQty = () => setEditingQty(prev => String(Math.max(1, (parseInt(prev, 10) || 0) + 1)));
    const decrementEditingQty = () => setEditingQty(prev => String(Math.max(1, (parseInt(prev, 10) || 1) - 1)));

    const completeSale = async () => {
        if (!saleData.customer) return Alert.alert('Select customer', 'Please choose a customer');
        if (cart.length === 0) return Alert.alert('Cart empty', 'Add products');

        const saleRecord = {
            invoice: saleData.invoiceNumber,
            customerId: saleData.customer,
            items: cart,
            subtotal,
            discount: discountNumeric,
            total,
            createdAt: new Date().toISOString()
        };

        // persist sale and decrement stock
        addSaleRecord(saleRecord);
        await decrementStock(cart.map(i => ({id: i.id, quantity: i.quantity})));

        Alert.alert('Sale completed', `Invoice ${saleData.invoiceNumber}\nTotal: $${total}`);
        setCart([]);
        setSaleData({customer: '', invoiceNumber: 'INV-' + Date.now(), discount: '0'});
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f3f4f6'}}>
            <Header title="Add New Sale" onBack={() => navigation.goBack()}/>

            <View style={{flex: 1, padding: 12}}>
                <View style={styles.card}>
                    <Text style={styles.label}>Invoice Number</Text>
                    <Text style={styles.readonly}>{saleData.invoiceNumber}</Text>

                    <Text style={[styles.label, {marginTop: 10}]}>Customer</Text>
                    <TouchableOpacity style={styles.selector} onPress={() => setCustomerPickerVisible(true)}>
                        <Text>{customers.find(c => String(c.id) === String(saleData.customer))?.name ?? 'Select Customer'}</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Products</Text>
                    <TouchableOpacity style={styles.addBtn} onPress={() => setProductPickerVisible(true)}>
                        <Text style={{color: '#066', fontWeight: '700'}}>+ Add Product</Text>
                    </TouchableOpacity>

                    {cart.length === 0 ? (
                        <Text style={{paddingTop: 12, color: '#6b7280'}}>No items yet</Text>
                    ) : (
                        cart.map(item => (
                            <TouchableOpacity key={String(item.id)} style={styles.cartItem}
                                              onPress={() => openEditItem(item)} activeOpacity={0.8}>
                                <View>
                                    <Text style={{fontWeight: '700'}}>{item.name}</Text>
                                    <Text style={{color: '#6b7280'}}>Qty: {item.quantity} × ${item.price}</Text>
                                </View>

                                <View style={{alignItems: 'flex-end'}}>
                                    <Text style={{fontWeight: '700'}}>${(item.quantity * item.price).toFixed(2)}</Text>
                                    <View style={{flexDirection: 'row', marginTop: 6}}>
                                        <TouchableOpacity onPress={() => removeFromCart(item.id)}
                                                          style={{marginLeft: 8}}>
                                            <Text style={{color: '#ef4444'}}>Remove</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => openEditItem(item)} style={{marginLeft: 12}}>
                                            <Text style={{color: '#2563eb'}}>Edit Qty</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Order Summary</Text>
                    <View style={styles.rowBetween}><Text>Subtotal</Text><Text>${subtotal.toFixed(2)}</Text></View>
                    <View style={[styles.rowBetween, {marginTop: 6}]}>
                        <Text>Discount (%)</Text>
                        <TextInput keyboardType="numeric" value={saleData.discount}
                                   onChangeText={v => setSaleData({...saleData, discount: v})}
                                   style={styles.discountBox}/>
                    </View>
                    <View style={[styles.rowBetween, {marginTop: 10}]}><Text
                        style={{fontWeight: '700'}}>Total</Text><Text
                        style={{fontWeight: '700', fontSize: 18, color: '#059669'}}>${total.toFixed(2)}</Text></View>
                </View>

                <TouchableOpacity style={styles.submitBtn} onPress={completeSale}><Text
                    style={{color: '#fff', fontWeight: '700'}}>Complete Sale</Text></TouchableOpacity>
            </View>

            <CustomerPicker visible={customerPickerVisible} onClose={() => setCustomerPickerVisible(false)}
                            customers={customers} onSelect={c => {
                setSaleData(prev => ({...prev, customer: String(c.id)}));
                setCustomerPickerVisible(false);
            }}/>

            <ProductPicker visible={productPickerVisible} onClose={() => setProductPickerVisible(false)}
                           products={products} onAddProduct={(product, qty) => addProductToCart(product, qty)}
                           onUpdateProduct={() => {
                           }}/>

            <Modal visible={editingModalVisible} transparent animationType="slide">
                <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                                      style={{flex: 1, justifyContent: 'flex-end'}}>
                    <View style={{
                        backgroundColor: '#fff',
                        padding: 16,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12
                    }}>
                        <View style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 12
                        }}>
                            <Text style={{fontWeight: '700'}}>{editingItem ? editingItem.name : 'Edit Quantity'}</Text>
                            <TouchableOpacity onPress={() => {
                                setEditingModalVisible(false);
                                setEditingItem(null);
                            }}><Text style={{color: '#ef4444'}}>Close</Text></TouchableOpacity>
                        </View>

                        <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'center'}}>
                            <TouchableOpacity onPress={decrementEditingQty}
                                              style={{padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6'}}><Text
                                style={{fontSize: 18}}>−</Text></TouchableOpacity>
                            <TextInput value={editingQty} onChangeText={(v) => setEditingQty(v.replace(/[^0-9]/g, ''))}
                                       keyboardType="numeric" style={{
                                width: 80,
                                marginHorizontal: 12,
                                borderWidth: 1,
                                borderColor: '#e5e7eb',
                                padding: 8,
                                borderRadius: 8,
                                textAlign: 'center',
                                fontWeight: '700'
                            }}/>
                            <TouchableOpacity onPress={incrementEditingQty}
                                              style={{padding: 12, borderRadius: 8, backgroundColor: '#f3f4f6'}}><Text
                                style={{fontSize: 18}}>+</Text></TouchableOpacity>
                        </View>

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 16}}>
                            <TouchableOpacity onPress={() => {
                                setEditingModalVisible(false);
                                setEditingItem(null);
                            }} style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: '#e5e7eb',
                                width: '48%',
                                alignItems: 'center'
                            }}><Text>Cancel</Text></TouchableOpacity>
                            <TouchableOpacity onPress={saveEditQty} style={{
                                padding: 12,
                                borderRadius: 8,
                                backgroundColor: '#059669',
                                width: '48%',
                                alignItems: 'center'
                            }}><Text style={{color: '#fff'}}>Save</Text></TouchableOpacity>
                        </View>
                    </View>
                </KeyboardAvoidingView>
            </Modal>
        </SafeAreaView>
    );
}

const styles = {
    card: {backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12},
    label: {color: '#374151', marginBottom: 6, fontWeight: '600'},
    readonly: {backgroundColor: '#f9fafb', padding: 10, borderRadius: 8, color: '#374151'},
    selector: {padding: 10, borderWidth: 1, borderColor: '#eee', borderRadius: 8},
    addBtn: {
        padding: 12,
        borderWidth: 1,
        borderColor: '#bbf7d0',
        borderStyle: 'dashed',
        borderRadius: 10,
        marginTop: 6
    },
    cartItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#f8fafc',
        borderRadius: 8,
        marginTop: 8
    },
    cardTitle: {fontWeight: '700', marginBottom: 8},
    rowBetween: {flexDirection: 'row', justifyContent: 'space-between'},
    discountBox: {width: 80, borderWidth: 1, borderColor: '#eee', padding: 6, borderRadius: 8, textAlign: 'right'},
    submitBtn: {backgroundColor: '#059669', padding: 14, borderRadius: 12, alignItems: 'center', marginTop: 8}
};
