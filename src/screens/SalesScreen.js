import React, {useContext, useMemo, useState} from 'react';
import {Alert, FlatList, Keyboard, Modal, ScrollView, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';
import CustomerPicker from '../../components/jsfiles/CustomerPicker';
import {ProductPicker} from '../../components/jsfiles/ProductPicker';

export default function SalesScreen({navigation}) {
    const {customers, products, addSaleRecord, decrementStock} = useContext(_AppContext);

    const [saleData, setSaleData] = useState({
        customer: '',
        invoiceNumber: 'INV-' + Date.now(),
        discount: '0',
        deposit: '0',
        paymentType: 'Cash', // default payment type
        paidAmount: '0',
    });

    const [cart, setCart] = useState([]);
    const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
    const [productPickerVisible, setProductPickerVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingQty, setEditingQty] = useState('1');
    const [editingModalVisible, setEditingModalVisible] = useState(false);

    // ---------------- CALCULATIONS ----------------
    const subtotal = useMemo(
        () =>
            cart.reduce((sum, item) => {
                const price = Number(item.price) || 0;
                const qty = Number(item.quantity) || 0;
                return sum + price * qty;
            }, 0),
        [cart]
    );

    const discountNumeric = Number(saleData.discount) || 0;
    const depositNumeric = Number(saleData.deposit) || 0;
    const vatRate = 0.1; // 10%
    const subtotalAfterDiscount = subtotal * (1 - discountNumeric / 100);
    const vatAmount = subtotalAfterDiscount * vatRate;
    const greenTotal = subtotalAfterDiscount + vatAmount;
    const balanceAmount = greenTotal - depositNumeric - (Number(saleData.paidAmount) || 0);

    // ---------------- HANDLERS ----------------
    const handleSelectCustomer = (customer) => {
        setSaleData((prev) => ({...prev, customer: String(customer.id)}));
        setCustomerPickerVisible(false);
    };

    const addProductToCart = (product, qty) => {
        const pid = String(product.id);
        const quantity = Math.max(1, Number(qty) || 1);
        const price = Number(product.sellingPrice) || 0;
        const productStock = typeof product.stock === 'number' ? product.stock : 0;
        const existingInCart = cart.find((i) => String(i.id) === pid);
        const existingQty = existingInCart ? Number(existingInCart.quantity) || 0 : 0;

        if (productStock > 0 && existingQty + quantity > productStock) {
            const remaining = Math.max(productStock - existingQty, 0);
            return Alert.alert(
                'Stock exceeded',
                remaining > 0
                    ? `Only ${remaining} more available for ${product.name}`
                    : `No stock left for ${product.name}`
            );
        }

        setCart((prev) => {
            const index = prev.findIndex((i) => String(i.id) === pid);
            if (index >= 0) {
                const updated = [...prev];
                updated[index] = {
                    ...updated[index],
                    quantity: (Number(updated[index].quantity) || 0) + quantity,
                    price,
                };
                return updated;
            } else {
                return [...prev, {...product, id: pid, quantity, price}];
            }
        });

        setProductPickerVisible(false);
    };

    const removeFromCart = (id) => setCart((prev) => prev.filter((item) => String(item.id) !== String(id)));

    const openEditItem = (item) => {
        setEditingItem(item);
        setEditingQty(String(item.quantity));
        setEditingModalVisible(true);
    };

    const incrementEditingQty = () => setEditingQty((prev) => String((parseInt(prev, 10) || 0) + 1));
    const decrementEditingQty = () => setEditingQty((prev) => {
        const n = Math.max(1, parseInt(prev, 10) || 1);
        return String(Math.max(1, n - 1));
    });

    const saveEditQty = () => {
        if (!editingItem) return;
        const newQty = Math.max(1, parseInt(editingQty, 10) || 1);
        const product = products.find((p) => String(p.id) === String(editingItem.id));
        if (product) {
            const productStock = typeof product.stock === 'number' ? product.stock : 0;
            if (newQty > productStock) {
                Alert.alert('Stock exceeded', `Only ${productStock} available for ${product.name}`);
                return;
            }
        }

        setCart((prev) =>
            prev.map((it) => (String(it.id) === String(editingItem.id) ? {...it, quantity: newQty} : it))
        );

        setEditingModalVisible(false);
        setEditingItem(null);
        setEditingQty('1');
    };

    const completeSale = async () => {
        if (!saleData.customer) return Alert.alert('Select customer', 'Please choose a customer');
        if (cart.length === 0) return Alert.alert('Cart empty', 'Please add at least one product');

        const saleRecord = {
            invoice: saleData.invoiceNumber,
            customerId: saleData.customer,
            items: cart,
            subtotal,
            discount: discountNumeric,
            vat: vatAmount,
            deposit: depositNumeric,
            greenTotal,
            paidAmount: Number(saleData.paidAmount) || 0,
            balanceAmount,
            paymentType: saleData.paymentType,
            createdAt: new Date().toISOString(),
        };

        await addSaleRecord(saleRecord);
        await decrementStock(cart.map((i) => ({id: i.id, quantity: i.quantity})));

        Alert.alert('Sale Completed', `Invoice: ${saleData.invoiceNumber}`);
        setCart([]);
        setSaleData({
            customer: '',
            invoiceNumber: 'INV-' + Date.now(),
            discount: '0',
            deposit: '0',
            paymentType: 'Cash',
            paidAmount: '0'
        });
    };

    const selectedCustomerName = customers.find((c) => String(c.id) === String(saleData.customer))?.name ?? 'Select Customer';
    const openCustomerPicker = () => {
        Keyboard.dismiss();
        setTimeout(() => setCustomerPickerVisible(true), 50);
    };
    const openProductPicker = () => {
        Keyboard.dismiss();
        setTimeout(() => setProductPickerVisible(true), 50);
    };

    // ---------------- RENDER ----------------
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f3f4f6'}}>
            <Header title="Add New Sale" onBack={() => navigation.goBack()} backgroundColor="#16a34a"/>
            <ScrollView style={{flex: 1, padding: 12}} contentContainerStyle={{paddingBottom: 24}}>
                {/* Invoice + Customer */}
                <View style={{backgroundColor: '#fff', padding: 12, borderRadius: 12}}>
                    <Text style={{fontWeight: '600'}}>Invoice Number</Text>
                    <Text style={{
                        backgroundColor: '#f3f4f6',
                        padding: 10,
                        borderRadius: 8
                    }}>{saleData.invoiceNumber}</Text>

                    <Text style={{marginTop: 10, fontWeight: '600'}}>Customer</Text>
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            backgroundColor: '#f9fafb',
                            borderWidth: 1,
                            borderColor: '#e5e7eb',
                            borderRadius: 8
                        }}
                        onPress={openCustomerPicker}>
                        <Text style={{color: saleData.customer ? '#111' : '#999'}}>{selectedCustomerName}</Text>
                    </TouchableOpacity>
                </View>

                {/* Product List */}
                <View style={{backgroundColor: '#fff', marginTop: 12, padding: 12, borderRadius: 12}}>
                    <Text style={{fontWeight: '700'}}>Products</Text>
                    <TouchableOpacity
                        style={{
                            padding: 10,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#bbf7d0',
                            borderStyle: 'dashed',
                            marginTop: 10,
                            alignItems: 'center'
                        }}
                        onPress={openProductPicker}>
                        <Text style={{color: '#166534', fontWeight: '600'}}>+ Add Product</Text>
                    </TouchableOpacity>

                    {cart.length === 0 ? (
                        <Text style={{color: '#777', marginTop: 10}}>No products added yet.</Text>
                    ) : (
                        <FlatList
                            data={cart}
                            keyExtractor={(item) => String(item.id)}
                            scrollEnabled={false}
                            renderItem={({item}) => (
                                <View style={{
                                    marginTop: 10,
                                    width: '100%',
                                    backgroundColor: '#f9fafb',
                                    padding: 10,
                                    borderRadius: 8,
                                    flexDirection: 'row',
                                    justifyContent: 'space-between'
                                }}>
                                    <View>
                                        <Text style={{fontWeight: '700'}}>{item.name}</Text>
                                        <Text style={{fontSize: 12, marginTop: 4}}>Qty: {item.quantity} ×
                                            ${item.price}</Text>
                                        <Text style={{
                                            fontWeight: '600',
                                            marginTop: 4
                                        }}>${(item.quantity * item.price).toFixed(2)}</Text>
                                    </View>
                                    <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 6, gap: 15}}>
                                        <TouchableOpacity onPress={() => openEditItem(item)}>
                                            <MaterialIcons name="edit" size={20} color="#0ea7e8"/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                            <MaterialIcons name="delete" size={20} color="#b91c1c"/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    )}
                </View>

                {/* Order Summary */}
                <View style={{backgroundColor: '#fff', marginTop: 12, padding: 12, borderRadius: 12}}>
                    <Text style={{fontWeight: '700'}}>Order Summary</Text>

                    {/* Subtotal */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                        <Text>Subtotal</Text>
                        <Text>${subtotal.toFixed(2)}</Text>
                    </View>

                    {/* Discount */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                        <Text>Discount (%)</Text>
                        <TextInput
                            style={{
                                width: 80,
                                borderWidth: 1,
                                borderColor: '#ddd',
                                padding: 6,
                                borderRadius: 8,
                                textAlign: 'right'
                            }}
                            value={saleData.discount}
                            onChangeText={(v) => setSaleData({...saleData, discount: v})}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* VAT */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                        <Text>VAT (10%)</Text>
                        <Text>${vatAmount.toFixed(2)}</Text>
                    </View>

                    {/* Deposit */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                        <Text>Deposit</Text>
                        <TextInput
                            style={{
                                width: 80,
                                borderWidth: 1,
                                borderColor: '#ddd',
                                padding: 6,
                                borderRadius: 8,
                                textAlign: 'right'
                            }}
                            value={saleData.deposit}
                            onChangeText={(v) => setSaleData({...saleData, deposit: v})}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Payment Type */}
                    <View style={{
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        marginTop: 10,
                        alignItems: 'center'
                    }}>
                        <Text>Payment Type</Text>
                        <View style={{flexDirection: 'row', gap: 10}}>
                            {['Cash', 'Credit', 'Partially Paid'].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setSaleData({...saleData, paymentType: type})}
                                    style={{
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 6,
                                        borderWidth: 1,
                                        borderColor: saleData.paymentType === type ? '#059669' : '#ddd',
                                        backgroundColor: saleData.paymentType === type ? '#d1fae5' : '#fff'
                                    }}>
                                    <Text>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Paid Amount */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                        <Text>Paid Amount</Text>
                        <TextInput
                            style={{
                                width: 100,
                                borderWidth: 1,
                                borderColor: '#ddd',
                                padding: 6,
                                borderRadius: 8,
                                textAlign: 'right'
                            }}
                            value={saleData.paidAmount}
                            onChangeText={(v) => setSaleData({...saleData, paidAmount: v})}
                            keyboardType="numeric"
                        />
                    </View>

                    {/* Balance Amount */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                        <Text>Balance Amount</Text>
                        <Text style={{fontWeight: '700', color: '#b91c1c'}}>${balanceAmount.toFixed(2)}</Text>
                    </View>

                    {/* Green Total */}
                    <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 10}}>
                        <Text style={{fontWeight: '700'}}>Green Total</Text>
                        <Text
                            style={{fontWeight: '700', color: '#059669', fontSize: 18}}>${greenTotal.toFixed(2)}</Text>
                    </View>

                    {/* Complete Sale Button */}
                    <TouchableOpacity
                        style={{
                            marginTop: 12,
                            backgroundColor: '#059669',
                            padding: 14,
                            borderRadius: 12,
                            alignItems: 'center'
                        }}
                        onPress={completeSale}>
                        <Text style={{color: '#fff', fontWeight: '700'}}>Complete Sale</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* Customer Picker */}
            <CustomerPicker visible={customerPickerVisible} onClose={() => setCustomerPickerVisible(false)}
                            customers={customers} onSelect={handleSelectCustomer}/>

            {/* Product Picker */}
            <ProductPicker visible={productPickerVisible} onClose={() => setProductPickerVisible(false)}
                           products={products} onAddProduct={(product, qty) => addProductToCart(product, qty)}/>

            {/* Edit Quantity Modal */}
            <Modal visible={editingModalVisible} transparent animationType="slide">
                <View style={{flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.4)'}}>
                    <View style={{
                        backgroundColor: '#fff',
                        padding: 16,
                        borderTopLeftRadius: 12,
                        borderTopRightRadius: 12
                    }}>
                        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                            <Text style={{fontWeight: '700'}}>{editingItem ? editingItem.name : 'Edit Quantity'}</Text>
                            <TouchableOpacity onPress={() => {
                                setEditingModalVisible(false);
                                setEditingItem(null);
                            }}>
                                <Text style={{color: '#b91c1c'}}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{flexDirection: 'row', justifyContent: 'center', marginTop: 20}}>
                            <TouchableOpacity onPress={decrementEditingQty}
                                              style={{padding: 12, backgroundColor: '#eee', borderRadius: 8}}>
                                <Text style={{fontSize: 20}}>−</Text>
                            </TouchableOpacity>

                            <TextInput
                                style={{
                                    width: 80,
                                    marginHorizontal: 12,
                                    borderWidth: 1,
                                    borderColor: '#ddd',
                                    textAlign: 'center',
                                    padding: 8,
                                    borderRadius: 8
                                }}
                                value={editingQty}
                                onChangeText={(v) => setEditingQty(v.replace(/[^0-9]/g, ''))}
                                keyboardType="numeric"
                            />

                            <TouchableOpacity onPress={incrementEditingQty}
                                              style={{padding: 12, backgroundColor: '#eee', borderRadius: 8}}>
                                <Text style={{fontSize: 20}}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 20}}>
                            <TouchableOpacity onPress={() => {
                                setEditingModalVisible(false);
                                setEditingItem(null);
                            }}
                                              style={{
                                                  width: '48%',
                                                  padding: 12,
                                                  backgroundColor: '#e5e7eb',
                                                  borderRadius: 8,
                                                  alignItems: 'center'
                                              }}>
                                <Text>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity onPress={saveEditQty} style={{
                                width: '48%',
                                padding: 12,
                                backgroundColor: '#059669',
                                borderRadius: 8,
                                alignItems: 'center'
                            }}>
                                <Text style={{color: '#fff'}}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
