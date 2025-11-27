// src/screens/ProductDetailsScreen.js
import React, {useContext, useMemo, useState} from 'react';
import {
    Alert,
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import Header from '../../components/jsfiles/Header';
import {_AppContext} from '../context/_AppContext';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

// dev sample image path (you uploaded)
const SAMPLE_IMAGE = '/mnt/data/16e1317b-3d59-4f8c-accf-97815479089d.jpg';

export default function ProductDetailsScreen({navigation, route}) {
    const {product: productParam, productId: paramId} = route.params || {};
    const {products = [], updateProduct, deleteProduct} = useContext(_AppContext);

    // find product either via passed object or id
    const product = useMemo(() => {
        if (productParam) return productParam;
        if (paramId) return products.find(p => String(p._id) === String(paramId)); // use _id here
        return null;
    }, [productParam, paramId, products]);


    const [localStock, setLocalStock] = useState(
        product ? String(product.stock ?? 0) : '0'
    );

    if (!product) {
        return (
            <SafeAreaView style={{flex: 1, backgroundColor: '#fff'}}>
                <Header title="Product" onBack={() => navigation.goBack()}/>
                <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20}}>
                    <Text style={{color: '#6b7280'}}>Product not found.</Text>
                </View>
            </SafeAreaView>
        );
    }

    const applyStockChange = async (newStock) => {
        const n = Math.max(0, Number(newStock) || 0);
        // optimistic UI
        setLocalStock(String(n));

        if (typeof updateProduct === 'function') {
            try {
                await updateProduct(String(product.id), {stock: n});
            } catch (err) {
                Alert.alert('Error', 'Failed to update stock');
            }
        } else {
            // fallback: inform user and keep UI change locally
            console.warn('updateProduct not available in _AppContext');
        }
    };

    const onIncrement = () => applyStockChange(Number(localStock || 0) + 1);
    const onDecrement = () => applyStockChange(Math.max(0, Number(localStock || 0) - 1));

    const onEdit = () => {
        // prefer navigating to your AddProduct screen in edit mode if you have it
        // e.g. navigation.navigate('AddProduct', { product })
        if (navigation && navigation.navigate) {
            navigation.navigate('AddProduct', {product});
        } else {
            Alert.alert('Edit', 'Navigation to edit screen is not available.');
        }
    };

    const onDelete = () => {
        Alert.alert('Delete product', 'Are you sure you want to delete this product?', [
            {text: 'Cancel', style: 'cancel'},
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    if (typeof deleteProduct === 'function') {
                        try {
                            await deleteProduct(String(product.id));
                            Alert.alert('Deleted', 'Product removed');
                            navigation.goBack();
                        } catch (err) {
                            Alert.alert('Error', 'Failed to delete product');
                        }
                    } else {
                        Alert.alert('Not supported', 'deleteProduct not implemented in context');
                    }
                },
            },
        ]);
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header title="Product Details" onBack={() => navigation.goBack()} backgroundColor="#6d28d9"/>

            <ScrollView contentContainerStyle={{padding: 12, paddingBottom: 40}}>
                <View style={styles.card}>
                    <Image
                        source={product.image ? {uri: product.image} : {uri: SAMPLE_IMAGE}}
                        style={styles.image}
                        resizeMode="cover"
                    />

                    <View style={{marginTop: 12}}>
                        <Text style={styles.title}>{product.name}</Text>
                        <Text style={styles.type}>{product.type || 'N/A'}</Text>

                        <View style={{
                            flexDirection: 'row',
                            marginTop: 12,
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            <View>
                                <Text style={styles.label}>Selling Price</Text>
                                <Text style={styles.value}>${(Number(product.sellingPrice) || 0).toFixed(2)}</Text>
                            </View>

                            {/*<View>*/}
                            {/*    <Text style={styles.label}>Purchasing Price</Text>*/}
                            {/*    <Text*/}
                            {/*        style={styles.valueSmall}>${(Number(product.purchasingPrice) || 0).toFixed(2)}</Text>*/}
                            {/*</View>*/}

                            <View style={{alignItems: 'flex-end'}}>
                                <Text style={styles.label}>License</Text>
                                <Text style={styles.valueSmall}>{product.drugLicense || '—'}</Text>
                            </View>
                        </View>

                        <View style={{marginTop: 12}}>
                            <Text style={styles.label}>Validity</Text>
                            <Text style={styles.valueSmall}>{product.validity || '—'}</Text>
                        </View>

                        <View style={{marginTop: 12}}>
                            <Text style={styles.label}>Description</Text>
                            <Text style={styles.valueSmall}>
                                {product.description || product.remark || 'No description available.'}
                            </Text>
                        </View>

                        {/* Stock controls */}
                        <View style={{marginTop: 16}}>
                            <Text style={styles.label}>Stock</Text>
                            <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 8}}>
                                <TouchableOpacity onPress={onDecrement} style={styles.smallAction}>
                                    <Icon name="minus" size={18} color="#111827"/>
                                </TouchableOpacity>

                                <TextInput
                                    value={String(localStock)}
                                    onChangeText={setLocalStock}
                                    keyboardType="numeric"
                                    style={styles.stockInput}
                                />

                                <TouchableOpacity onPress={onIncrement} style={styles.smallAction}>
                                    <Icon name="plus" size={18} color="#111827"/>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    onPress={() => applyStockChange(localStock)}
                                    style={[styles.saveBtn, {marginLeft: 12}]}
                                >
                                    <Text style={{color: '#fff', fontWeight: '700'}}>Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        {/* Actions */}
                        {/*<View style={{flexDirection: 'row', marginTop: 18, justifyContent: 'space-between'}}>*/}
                        {/*    <TouchableOpacity onPress={onEdit} style={[styles.action, {backgroundColor: '#2563eb'}]}>*/}
                        {/*        <Text style={{color: '#fff', fontWeight: '700'}}>Edit</Text>*/}
                        {/*    </TouchableOpacity>*/}

                        {/*    <TouchableOpacity onPress={onDelete} style={[styles.action, {backgroundColor: '#ef4444'}]}>*/}
                        {/*        <Text style={{color: '#fff', fontWeight: '700'}}>Delete</Text>*/}
                        {/*    </TouchableOpacity>*/}
                        {/*</View>*/}
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    image: {
        width: '100%',
        height: 200,
        borderRadius: 10,
        backgroundColor: '#f1f5f9',
    },
    title: {fontSize: 18, fontWeight: '700', marginTop: 4},
    type: {fontSize: 13, color: '#6b7280'},
    label: {fontSize: 12, color: '#374151'},
    value: {fontSize: 16, fontWeight: '700', marginTop: 2},
    valueSmall: {fontSize: 13, color: '#6b7280', marginTop: 2},

    smallAction: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
    },

    stockInput: {
        width: 80,
        marginLeft: 8,
        marginRight: 8,
        paddingVertical: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: '700',
    },

    saveBtn: {
        backgroundColor: '#059669',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },

    action: {
        flex: 1,
        paddingVertical: 12,
        borderRadius: 8,
        alignItems: 'center',
        marginHorizontal: 6,
    },
});
