// src/screens/SalesScreen.js
import React, {useContext, useMemo, useState} from 'react';
import {Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View,} from 'react-native';
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
        discount: '0',
    });

    const [cart, setCart] = useState([]);
    const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
    const [productPickerVisible, setProductPickerVisible] = useState(false);

    // For editing item quantity
    const [editingItem, setEditingItem] = useState(null);
    const [editingQty, setEditingQty] = useState('1');
    const [editingModalVisible, setEditingModalVisible] = useState(false);

    const subtotal = useMemo(
        () => cart.reduce((sum, item) => sum + item.quantity * item.price, 0),
        [cart]
    );

    const discountNumeric = Number(saleData.discount) || 0;

    const total = useMemo(
        () => +(subtotal * (1 - discountNumeric / 100)).toFixed(2),
        [subtotal, discountNumeric]
    );

    const handleSelectCustomer = (customer) => {
        setSaleData((prev) => ({...prev, customer: String(customer.id)}));
        setCustomerPickerVisible(false);
    };

    const addProductToCart = (product, qty) => {
        const pid = String(product.id);
        const quantity = Math.max(1, Number(qty) || 1);

        // Check stock vs existing cart quantity
        const productStock = typeof product.stock === 'number' ? product.stock : 0;
        const existingInCart = cart.find((i) => String(i.id) === pid);
        const existingQty = existingInCart ? existingInCart.quantity : 0;

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
                    quantity: updated[index].quantity + quantity,
                };
                return updated;
            } else {
                return [
                    ...prev,
                    {
                        ...product,
                        id: pid,
                        quantity,
                        price: product.sellingPrice,
                    },
                ];
            }
        });

        setProductPickerVisible(false);
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => String(item.id) !== String(id)));
    };

    const openEditItem = (item) => {
        setEditingItem(item);
        setEditingQty(String(item.quantity));
        setEditingModalVisible(true);
    };

    const incrementEditingQty = () => {
        setEditingQty((prev) => String((parseInt(prev, 10) || 0) + 1));
    };

    const decrementEditingQty = () => {
        setEditingQty((prev) => {
            const n = Math.max(1, parseInt(prev, 10) || 1);
            return String(Math.max(1, n - 1));
        });
    };

    const saveEditQty = () => {
        if (!editingItem) return;

        const newQty = Math.max(1, parseInt(editingQty, 10) || 1);
        const product = products.find((p) => String(p.id) === String(editingItem.id));

        if (product) {
            const productStock = typeof product.stock === 'number' ? product.stock : 0;
            if (productStock > 0 && newQty > productStock) {
                Alert.alert(
                    'Stock exceeded',
                    `Only ${productStock} available for ${product.name}`
                );
                return;
            }
        }

        setCart((prev) =>
            prev.map((it) =>
                String(it.id) === String(editingItem.id)
                    ? {...it, quantity: newQty}
                    : it
            )
        );

        setEditingModalVisible(false);
        setEditingItem(null);
        setEditingQty('1');
    };

    const completeSale = async () => {
        if (!saleData.customer) {
            return Alert.alert('Select customer', 'Please choose a customer');
        }
        if (cart.length === 0) {
            return Alert.alert('Cart empty', 'Please add at least one product to the sale');
        }

        const saleRecord = {
            invoice: saleData.invoiceNumber,
            customerId: saleData.customer,
            items: cart,
            subtotal,
            discount: discountNumeric,
            total,
            createdAt: new Date().toISOString(),
        };

        // Save sale locally and (later) to backend
        await addSaleRecord(saleRecord);

        // Decrement stock based on cart
        await decrementStock(
            cart.map((i) => ({
                id: i.id,
                quantity: i.quantity,
            }))
        );

        Alert.alert('Sale completed', `Invoice ${saleData.invoiceNumber}\nTotal: $${total}`);

        // Reset
        setCart([]);
        setSaleData({
            customer: '',
            invoiceNumber: 'INV-' + Date.now(),
            discount: '0',
        });
    };

    const selectedCustomerName =
        customers.find((c) => String(c.id) === String(saleData.customer))?.name ??
        'Select Customer';

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f3f4f6'}}>
            <Header
                title="Add New Sale"
                onBack={() => navigation.goBack()}
                backgroundColor="#16a34a"
            />

            <View style={{flex: 1, padding: 12}}>
                {/* Invoice + Customer */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <Text style={{color: '#374151', fontWeight: '600', marginBottom: 4}}>
                        Invoice Number
                    </Text>
                    <Text
                        style={{
                            backgroundColor: '#f9fafb',
                            padding: 10,
                            borderRadius: 8,
                            color: '#111827',
                        }}
                    >
                        {saleData.invoiceNumber}
                    </Text>

                    <Text
                        style={{
                            color: '#374151',
                            fontWeight: '600',
                            marginTop: 10,
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
                        }}
                        onPress={() => setCustomerPickerVisible(true)}
                    >
                        <Text style={{color: saleData.customer ? '#111827' : '#9ca3af'}}>
                            {selectedCustomerName}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Products & Cart */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <Text style={{fontWeight: '700', marginBottom: 8}}>Products</Text>

                    <TouchableOpacity
                        style={{
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: '#bbf7d0',
                            borderStyle: 'dashed',
                            alignItems: 'center',
                            marginBottom: 8,
                        }}
                        onPress={() => setProductPickerVisible(true)}
                    >
                        <Text style={{color: '#166534', fontWeight: '600'}}>
                            + Add Product
                        </Text>
                    </TouchableOpacity>

                    {cart.length === 0 ? (
                        <Text style={{marginTop: 4, color: '#6b7280'}}>
                            No items yet. Tap "Add Product".
                        </Text>
                    ) : (
                        <FlatList
                            data={cart}
                            keyExtractor={(item) => String(item.id)}
                            scrollEnabled={false}
                            renderItem={({item}) => (
                                <TouchableOpacity
                                    style={{
                                        flexDirection: 'row',
                                        justifyContent: 'space-between',
                                        padding: 10,
                                        backgroundColor: '#f9fafb',
                                        borderRadius: 8,
                                        marginTop: 6,
                                    }}
                                    activeOpacity={0.8}
                                    onPress={() => openEditItem(item)}
                                >
                                    <View style={{flex: 1, paddingRight: 8}}>
                                        <Text style={{fontWeight: '700'}}>{item.name}</Text>
                                        <Text style={{color: '#6b7280', fontSize: 12}}>
                                            Qty: {item.quantity} × ${item.price}
                                        </Text>
                                    </View>

                                    <View style={{alignItems: 'flex-end'}}>
                                        <Text style={{fontWeight: '700'}}>
                                            ${(item.quantity * item.price).toFixed(2)}
                                        </Text>
                                        <View style={{flexDirection: 'row', marginTop: 6}}>
                                            <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                                <Text style={{color: '#b91c1c', marginRight: 12}}>
                                                    Remove
                                                </Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity onPress={() => openEditItem(item)}>
                                                <Text style={{color: '#2563eb'}}>Edit Qty</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </TouchableOpacity>
                            )}
                        />
                    )}
                </View>

                {/* Order Summary */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <Text style={{fontWeight: '700', marginBottom: 8}}>
                        Order Summary
                    </Text>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginBottom: 6,
                        }}
                    >
                        <Text>Subtotal</Text>
                        <Text>${subtotal.toFixed(2)}</Text>
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: 6,
                        }}
                    >
                        <Text>Discount (%)</Text>
                        <TextInput
                            keyboardType="numeric"
                            value={saleData.discount}
                            onChangeText={(v) =>
                                setSaleData((prev) => ({...prev, discount: v}))
                            }
                            style={{
                                width: 80,
                                borderWidth: 1,
                                borderColor: '#e5e7eb',
                                padding: 6,
                                borderRadius: 8,
                                textAlign: 'right',
                            }}
                            placeholder="0"
                        />
                    </View>

                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            marginTop: 8,
                        }}
                    >
                        <Text style={{fontWeight: '700'}}>Total</Text>
                        <Text
                            style={{fontWeight: '700', fontSize: 18, color: '#059669'}}
                        >
                            ${total.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Complete Button */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#059669',
                        padding: 14,
                        borderRadius: 12,
                        alignItems: 'center',
                    }}
                    onPress={completeSale}
                >
                    <Text style={{color: '#fff', fontWeight: '700'}}>Complete Sale</Text>
                </TouchableOpacity>
            </View>

            {/* Customer Picker Modal */}
            <CustomerPicker
                visible={customerPickerVisible}
                onClose={() => setCustomerPickerVisible(false)}
                customers={customers}
                onSelect={handleSelectCustomer}
            />

            {/* Product Picker Modal */}
            <ProductPicker
                visible={productPickerVisible}
                onClose={() => setProductPickerVisible(false)}
                products={products}
                onAddProduct={(product, qty) => addProductToCart(product, qty)}
                onUpdateProduct={() => {
                }}
            />

            {/* Edit Quantity Modal */}
            <Modal visible={editingModalVisible} transparent animationType="slide">
                <View
                    style={{
                        flex: 1,
                        justifyContent: 'flex-end',
                        backgroundColor: 'rgba(0,0,0,0.4)',
                    }}
                >
                    <View
                        style={{
                            backgroundColor: '#fff',
                            padding: 16,
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                        }}
                    >
                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                marginBottom: 12,
                            }}
                        >
                            <Text style={{fontWeight: '700'}}>
                                {editingItem ? editingItem.name : 'Edit Quantity'}
                            </Text>
                            <TouchableOpacity
                                onPress={() => {
                                    setEditingModalVisible(false);
                                    setEditingItem(null);
                                }}
                            >
                                <Text style={{color: '#b91c1c'}}>Close</Text>
                            </TouchableOpacity>
                        </View>

                        <View
                            style={{
                                flexDirection: 'row',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: 16,
                            }}
                        >
                            <TouchableOpacity
                                onPress={decrementEditingQty}
                                style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: '#f3f4f6',
                                }}
                            >
                                <Text style={{fontSize: 18}}>−</Text>
                            </TouchableOpacity>

                            <TextInput
                                value={editingQty}
                                onChangeText={(v) =>
                                    setEditingQty(v.replace(/[^0-9]/g, ''))
                                }
                                keyboardType="numeric"
                                style={{
                                    width: 80,
                                    marginHorizontal: 12,
                                    borderWidth: 1,
                                    borderColor: '#e5e7eb',
                                    padding: 8,
                                    borderRadius: 8,
                                    textAlign: 'center',
                                    fontWeight: '700',
                                }}
                            />

                            <TouchableOpacity
                                onPress={incrementEditingQty}
                                style={{
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: '#f3f4f6',
                                }}
                            >
                                <Text style={{fontSize: 18}}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                            }}
                        >
                            <TouchableOpacity
                                onPress={() => {
                                    setEditingModalVisible(false);
                                    setEditingItem(null);
                                }}
                                style={{
                                    width: '48%',
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: '#e5e7eb',
                                    alignItems: 'center',
                                }}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={saveEditQty}
                                style={{
                                    width: '48%',
                                    padding: 12,
                                    borderRadius: 8,
                                    backgroundColor: '#059669',
                                    alignItems: 'center',
                                }}
                            >
                                <Text style={{color: '#fff'}}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
