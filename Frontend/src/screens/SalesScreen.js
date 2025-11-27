import React, {useContext, useEffect, useMemo, useState} from "react";
import {Alert, FlatList, Keyboard, Modal, ScrollView, Text, TextInput, TouchableOpacity, View,} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {_AppContext} from "../context/_AppContext";
import Header from "../../components/jsfiles/Header";
import CustomerPicker from "../../components/jsfiles/CustomerPicker";
import {ProductPicker} from "../../components/jsfiles/ProductPicker";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";

export default function SalesScreen({navigation}) {
    const {customers, products, createSale} = useContext(_AppContext);

    const [user, setUser] = useState(null);
    const [saleData, setSaleData] = useState({
        customer: null,
        invoiceNumber: "INV-" + Date.now(),
        discount: "0",
        deposit: "0",
        paymentType: "Cash",
        paidAmount: "0",
        remark: "",
        creditDays: "0",
        deliveryDate: null,
    });

    const [cart, setCart] = useState([]);
    const [customerPickerVisible, setCustomerPickerVisible] = useState(false);
    const [productPickerVisible, setProductPickerVisible] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [editingQty, setEditingQty] = useState("1");
    const [editingModalVisible, setEditingModalVisible] = useState(false);

    // ---------------- LOAD USER ----------------
    useEffect(() => {
        const loadUser = async () => {
            try {
                const storedUser = await AsyncStorage.getItem("user");
                if (storedUser) setUser(JSON.parse(storedUser));
                else Alert.alert("Error", "User not found. Please login again.");
            } catch (err) {
                console.error("Failed to load user:", err);
                Alert.alert("Error", "Failed to load user.");
            }
        };
        loadUser();
    }, []);

    // ---------------- CALCULATIONS ----------------
    const totals = useMemo(() => {
        const subtotal = cart.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
        );
        const discount = Number(saleData.discount) || 0;
        const deposit = Number(saleData.deposit) || 0;
        const paidAmount = Number(saleData.paidAmount) || 0;
        const subtotalAfterDiscount = subtotal * (1 - discount / 100);
        const vatAmount = subtotalAfterDiscount * 0.1;
        const grandTotal = subtotalAfterDiscount + vatAmount;
        const balance = grandTotal - deposit - paidAmount;

        return {subtotal, subtotalAfterDiscount, vatAmount, grandTotal, balance};
    }, [cart, saleData.discount, saleData.deposit, saleData.paidAmount]);

    // ---------------- HANDLERS ----------------
    const handleSelectCustomer = (customer) => {


        // ✅ Normalize: ensure customer has 'id' field (handle both 'id' and '_id')
        const normalizedCustomer = {
            ...customer,
            id: customer.id || customer._id
        };


        setSaleData((prev) => ({...prev, customer: normalizedCustomer}));
        setCustomerPickerVisible(false);
    };

    const addProductToCart = (product, qty = 1) => {
        const id = String(product.id);
        const quantity = Math.max(1, Number(qty) || 1);
        const existing = cart.find((p) => p.id === id);

        if (existing) {
            setCart((prev) =>
                prev.map((p) =>
                    p.id === id ? {...p, quantity: p.quantity + quantity} : p
                )
            );
        } else {
            setCart((prev) => [
                ...prev,
                {id, productName: product.name, price: Number(product.price), quantity},
            ]);
        }
    };

    const removeFromCart = (id) => {
        setCart((prev) => prev.filter((item) => item.id !== id));
    };

    const openEditItem = (item) => {
        setEditingItem(item);
        setEditingQty(String(item.quantity));
        setEditingModalVisible(true);
    };

    const saveEditQty = () => {
        const newQty = Math.max(1, Number(editingQty));
        setCart((prev) =>
            prev.map((item) =>
                item.id === editingItem.id ? {...item, quantity: newQty} : item
            )
        );
        setEditingModalVisible(false);
        setEditingItem(null);
    };

    const completeSale = async () => {
        console.log('=== SALE COMPLETION DEBUG ===');
        console.log('User:', user);
        console.log('Customer selected:', saleData.customer);
        console.log('Customer ID:', saleData.customer?.id);
        console.log('Cart:', cart);

        if (!user || !(user._id || user.id))
            return Alert.alert("Error", "User not loaded. Cannot complete sale.");

        const customerId = saleData.customer?.id || saleData.customer?._id;
        if (!saleData.customer || !customerId) {
            console.log("❌ No customer selected or missing ID");
            return Alert.alert("Error", "Please select a customer.");
        }

        if (cart.length === 0) return Alert.alert("Error", "Cart is empty");

        const selectedProducts = {};
        cart.forEach((item) => {
            selectedProducts[item.id] = {
                id: item.id,
                name: item.productName,
                price: item.price,
                qty: item.quantity,
                bonusQty: 0,           // ✅ Can be enhanced to let users input bonus
                discount: 0,           // ✅ Can be enhanced for per-product discount
                costPrice: 0,          // ✅ If available from product data
            };
        });

        console.log('Selected Products:', selectedProducts);

        try {
            await createSale({
                selectedCustomer: {
                    ...saleData.customer,
                    id: customerId
                },
                selectedProducts,
                totalPaid: Number(saleData.paidAmount) || 0,
                totalDue: totals.grandTotal - (Number(saleData.deposit) || 0) - (Number(saleData.paidAmount) || 0),
                remark: saleData.remark || "",
                creditDays: Number(saleData.creditDays) || 0,        // ✅ NEW
                deliveryDate: saleData.deliveryDate || new Date(),   // ✅ NEW
                discount: Number(saleData.discount) || 0,
            });

            Alert.alert("Sale Completed", `Invoice: ${saleData.invoiceNumber}`);

            // Reset
            setCart([]);
            setSaleData({
                customer: null,
                invoiceNumber: "INV-" + Date.now(),
                discount: "0",
                deposit: "0",
                paymentType: "Cash",
                paidAmount: "0",
                remark: "",
                creditDays: "0",
                deliveryDate: null,
            });
        } catch (error) {
            console.error("Failed to save sale:", error?.message || error);
            Alert.alert("Error", "Failed to save sale. Check console for details.");
        }
    };

    const openCustomerPicker = () => {
        Keyboard.dismiss();
        setTimeout(() => setCustomerPickerVisible(true), 50);
    };

    const openProductPicker = () => {
        Keyboard.dismiss();
        setTimeout(() => setProductPickerVisible(true), 50);
    };

    const selectedCustomerName = saleData.customer?.name || "Select Customer";

    // ---------------- RENDER ----------------
    return (
        <SafeAreaView style={{flex: 1, backgroundColor: "#f3f4f6"}}>
            <Header
                title="Add New Sale"
                onBack={() => navigation.goBack()}
                backgroundColor="#16a34a"
            />

            <ScrollView style={{flex: 1, padding: 12}}>
                {/* Invoice + Customer */}
                <View style={{backgroundColor: "#fff", padding: 12, borderRadius: 12}}>
                    <Text style={{fontWeight: "600"}}>Invoice Number</Text>
                    <Text style={{backgroundColor: "#f3f4f6", padding: 10, borderRadius: 8}}>
                        {saleData.invoiceNumber}
                    </Text>

                    <Text style={{marginTop: 10, fontWeight: "600"}}>Customer</Text>
                    <TouchableOpacity
                        onPress={openCustomerPicker}
                        style={{
                            padding: 10,
                            backgroundColor: "#f9fafb",
                            borderWidth: 1,
                            borderColor: "#e5e7eb",
                            borderRadius: 8,
                        }}
                    >
                        <Text>{selectedCustomerName}</Text>
                    </TouchableOpacity>
                </View>

                {/* PRODUCTS CARD */}
                <View style={{backgroundColor: "#fff", marginTop: 12, padding: 12, borderRadius: 12}}>
                    <Text style={{fontWeight: "700"}}>Products</Text>
                    <TouchableOpacity
                        onPress={openProductPicker}
                        style={{
                            padding: 10,
                            borderRadius: 10,
                            borderWidth: 1,
                            borderColor: "#bbf7d0",
                            borderStyle: "dashed",
                            marginTop: 10,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{color: "#166534", fontWeight: "600"}}>+ Add Product</Text>
                    </TouchableOpacity>

                    {cart.length === 0 ? (
                        <Text style={{marginTop: 10}}>No products added.</Text>
                    ) : (
                        <FlatList
                            data={cart}
                            scrollEnabled={false}
                            keyExtractor={(item) => String(item.id)}
                            renderItem={({item}) => (
                                <View
                                    style={{
                                        marginTop: 10,
                                        backgroundColor: "#f9fafb",
                                        padding: 10,
                                        borderRadius: 8,
                                    }}
                                >
                                    <Text style={{fontWeight: "700"}}>{item.productName}</Text>
                                    <Text style={{marginTop: 4}}>
                                        Qty: {item.quantity} × ₹{item.price}
                                    </Text>
                                    <Text style={{fontWeight: "600", marginTop: 6}}>
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </Text>
                                    <View
                                        style={{flexDirection: "row", justifyContent: "flex-end", marginTop: 8}}
                                    >
                                        <TouchableOpacity
                                            onPress={() => openEditItem(item)}
                                            style={{marginRight: 15}}
                                        >
                                            <FontAwesome5 name="edit" size={18} color="#059669"/>
                                        </TouchableOpacity>
                                        <TouchableOpacity onPress={() => removeFromCart(item.id)}>
                                            <FontAwesome5 name="trash" size={18} color="#b91c1c"/>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            )}
                        />
                    )}
                </View>

                {/* ORDER SUMMARY */}
                <View style={{backgroundColor: "#fff", marginTop: 12, padding: 12, borderRadius: 12}}>
                    <Text style={{fontWeight: "700"}}>Order Summary</Text>

                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                        <Text>Subtotal</Text>
                        <Text>₹{totals.subtotal.toFixed(2)}</Text>
                    </View>

                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                        <Text>Discount (%)</Text>
                        <TextInput
                            style={{width: 80, borderWidth: 1, padding: 6, textAlign: "right", borderRadius: 8}}
                            keyboardType="numeric"
                            value={saleData.discount}
                            onChangeText={(v) =>
                                setSaleData({...saleData, discount: v.replace(/[^0-9.]/g, "")})
                            }
                        />
                    </View>

                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                        <Text>VAT (10%)</Text>
                        <Text>₹{totals.vatAmount.toFixed(2)}</Text>
                    </View>

                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                        <Text>Deposit</Text>
                        <TextInput
                            style={{width: 80, borderWidth: 1, padding: 6, textAlign: "right", borderRadius: 8}}
                            keyboardType="numeric"
                            value={saleData.deposit}
                            onChangeText={(v) =>
                                setSaleData({...saleData, deposit: v.replace(/[^0-9.]/g, "")})
                            }
                        />
                    </View>

                    {/* CREDIT DAYS */}
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                        <Text>Credit Days</Text>
                        <TextInput
                            style={{width: 80, borderWidth: 1, padding: 6, textAlign: "right", borderRadius: 8}}
                            keyboardType="numeric"
                            value={saleData.creditDays}
                            onChangeText={(v) =>
                                setSaleData({...saleData, creditDays: v.replace(/[^0-9]/g, "")})
                            }
                            placeholder="0"
                        />
                    </View>

                    {/* REMARK */}
                    <View style={{marginTop: 10}}>
                        <Text>Remark</Text>
                        <TextInput
                            style={{
                                borderWidth: 1,
                                padding: 8,
                                borderRadius: 8,
                                marginTop: 6,
                                minHeight: 60,
                                textAlignVertical: 'top'
                            }}
                            multiline
                            numberOfLines={3}
                            value={saleData.remark}
                            onChangeText={(v) => setSaleData({...saleData, remark: v})}
                            placeholder="Add any notes or remarks..."
                        />
                    </View>

                    {/* PAYMENT TYPE */}
                    <View style={{marginTop: 10, flexDirection: "row", justifyContent: "space-between"}}>
                        <Text>Payment Type</Text>
                        <View style={{flexDirection: "row", gap: 10}}>
                            {["Cash", "Credit"].map((type) => (
                                <TouchableOpacity
                                    key={type}
                                    onPress={() => setSaleData({...saleData, paymentType: type})}
                                    style={{
                                        paddingHorizontal: 10,
                                        paddingVertical: 6,
                                        borderRadius: 6,
                                        borderWidth: 1,
                                        borderColor: saleData.paymentType === type ? "#059669" : "#ddd",
                                        backgroundColor: saleData.paymentType === type ? "#d1fae5" : "#fff",
                                    }}
                                >
                                    <Text>{type}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* PAID AMOUNT */}
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                        <Text>Paid Amount</Text>
                        <TextInput
                            style={{width: 100, borderWidth: 1, padding: 6, textAlign: "right", borderRadius: 8}}
                            value={saleData.paidAmount}
                            keyboardType="numeric"
                            onChangeText={(v) =>
                                setSaleData({...saleData, paidAmount: v.replace(/[^0-9.]/g, "")})
                            }
                        />
                    </View>

                    {/* BALANCE */}
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                        <Text>Balance</Text>
                        <Text style={{fontWeight: "700", color: "#b91c1c"}}>
                            ₹{totals.balance.toFixed(2)}
                        </Text>
                    </View>

                    {/* GREEN TOTAL */}
                    <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 10}}>
                        <Text style={{fontWeight: "700"}}>Grand Total</Text>
                        <Text style={{fontWeight: "700", color: "#059669", fontSize: 18}}>
                            ₹{totals.grandTotal.toFixed(2)}
                        </Text>
                    </View>

                    <TouchableOpacity
                        onPress={completeSale}
                        style={{
                            marginTop: 12,
                            backgroundColor: "#059669",
                            padding: 14,
                            borderRadius: 12,
                            alignItems: "center",
                        }}
                    >
                        <Text style={{color: "#fff", fontWeight: "700"}}>Complete Sale</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>

            {/* CUSTOMER PICKER */}
            <CustomerPicker
                visible={customerPickerVisible}
                onClose={() => setCustomerPickerVisible(false)}
                customers={customers}
                onSelect={handleSelectCustomer}
            />

            {/* PRODUCT PICKER */}
            <ProductPicker
                visible={productPickerVisible}
                onClose={() => setProductPickerVisible(false)}
                products={products}
                onAddProduct={(product) => addProductToCart(product, 1)}
            />

            {/* EDIT QUANTITY MODAL */}
            <Modal visible={editingModalVisible} transparent animationType="slide">
                <View style={{flex: 1, justifyContent: "flex-end", backgroundColor: "rgba(0,0,0,0.4)"}}>
                    <View
                        style={{
                            backgroundColor: "#fff",
                            padding: 16,
                            borderTopLeftRadius: 12,
                            borderTopRightRadius: 12,
                        }}
                    >
                        <Text style={{fontWeight: "700"}}>Edit Quantity – {editingItem?.productName}</Text>

                        <View style={{flexDirection: "row", justifyContent: "center", marginTop: 20}}>
                            <TouchableOpacity
                                onPress={() =>
                                    setEditingQty(String(Math.max(1, Number(editingQty) - 1)))
                                }
                                style={{padding: 12, backgroundColor: "#eee", borderRadius: 8}}
                            >
                                <Text style={{fontSize: 20}}>−</Text>
                            </TouchableOpacity>

                            <TextInput
                                style={{
                                    width: 80,
                                    marginHorizontal: 12,
                                    borderWidth: 1,
                                    textAlign: "center",
                                    padding: 8,
                                    borderRadius: 8,
                                }}
                                value={editingQty}
                                keyboardType="numeric"
                                onChangeText={(v) => setEditingQty(v.replace(/[^0-9]/g, ""))}
                            />

                            <TouchableOpacity
                                onPress={() => setEditingQty(String(Number(editingQty) + 1))}
                                style={{padding: 12, backgroundColor: "#eee", borderRadius: 8}}
                            >
                                <Text style={{fontSize: 20}}>+</Text>
                            </TouchableOpacity>
                        </View>

                        <View style={{flexDirection: "row", justifyContent: "space-between", marginTop: 20}}>
                            <TouchableOpacity
                                onPress={() => {
                                    setEditingModalVisible(false);
                                    setEditingItem(null);
                                }}
                                style={{
                                    width: "48%",
                                    padding: 12,
                                    backgroundColor: "#e5e7eb",
                                    borderRadius: 8,
                                    alignItems: "center",
                                }}
                            >
                                <Text>Cancel</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                onPress={saveEditQty}
                                style={{
                                    width: "48%",
                                    padding: 12,
                                    backgroundColor: "#059669",
                                    borderRadius: 8,
                                    alignItems: "center",
                                }}
                            >
                                <Text style={{color: "#fff"}}>Save</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
