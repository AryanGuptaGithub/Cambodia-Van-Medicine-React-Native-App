// src/screens/ProductsScreen.js
import React, {useContext, useMemo, useState} from 'react';
import {FlatList, Text, TextInput, TouchableOpacity, View,} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';

export default function ProductsScreen({navigation}) {
    const {products} = useContext(_AppContext);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all | tablet | capsule | syrup | injection | cream

    const LOW_STOCK_THRESHOLD = 50;

    const filteredProducts = useMemo(() => {
        const q = search.trim().toLowerCase();

        return products
            .slice()
            .filter((p) => {
                // type filter
                if (typeFilter !== 'all') {
                    const t = (p.type || '').toLowerCase();
                    if (!t.includes(typeFilter)) return false;
                }

                if (!q) return true;

                const haystack = [
                    p.name,
                    p.type,
                    String(p.sellingPrice),
                    String(p.purchasingPrice),
                    p.drugLicense,
                ]
                    .filter(Boolean)
                    .join(' ')
                    .toLowerCase();

                return haystack.includes(q);
            })
            .sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }, [products, search, typeFilter]);

    const renderItem = ({item}) => {
        const stock = typeof item.stock === 'number' ? item.stock : 0;
        const lowStock = stock <= LOW_STOCK_THRESHOLD;

        return (
            <TouchableOpacity
                onPress={() =>
                    navigation.navigate('ProductDetails', {productId: item.id})
                }
                style={{
                    backgroundColor: '#fff',
                    padding: 12,
                    borderRadius: 10,
                    marginBottom: 10,
                    borderWidth: 1,
                    borderColor: '#e5e7eb',
                }}
            >
                <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                    <View style={{flex: 1, paddingRight: 8}}>
                        <Text
                            style={{
                                fontWeight: '700',
                                fontSize: 16,
                                marginBottom: 4,
                            }}
                            numberOfLines={2}
                        >
                            {item.name}
                        </Text>

                        <Text style={{fontSize: 12, color: '#6b7280'}}>
                            Type: {item.type || 'N/A'}
                        </Text>

                        {item.drugLicense ? (
                            <Text style={{fontSize: 11, color: '#9ca3af'}}>
                                License: {item.drugLicense}
                            </Text>
                        ) : null}

                        {item.validity ? (
                            <Text style={{fontSize: 11, color: '#4b5563'}}>
                                Valid till: {item.validity}
                            </Text>
                        ) : null}
                    </View>

                    <View style={{alignItems: 'flex-end'}}>
                        <Text style={{fontSize: 12, color: '#6b7280'}}>Selling</Text>
                        <Text style={{fontWeight: '700'}}>${item.sellingPrice}</Text>
                    </View>
                </View>

                <View
                    style={{
                        marginTop: 8,
                        flexDirection: 'row',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                    }}
                >
                    <View
                        style={{
                            paddingHorizontal: 10,
                            paddingVertical: 4,
                            borderRadius: 999,
                            backgroundColor: lowStock ? '#fee2e2' : '#dcfce7',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 12,
                                fontWeight: '600',
                                color: lowStock ? '#b91c1c' : '#166534',
                            }}
                        >
                            Stock: {stock} {lowStock ? '(Low)' : ''}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header
                title="Products"
                onBack={() => navigation.goBack()}
                // onAdd={() => navigation.navigate('AddProduct')}
                backgroundColor="#6d28d9"
            />

            {/* Search & Filters */}
            <View style={{paddingHorizontal: 12, paddingTop: 8}}>
                {/* Search box */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 10,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        paddingHorizontal: 10,
                        paddingVertical: 6,
                        marginBottom: 8,
                    }}
                >
                    <Text
                        style={{fontSize: 12, color: '#6b7280', marginBottom: 2}}
                    >
                        Search
                    </Text>
                    <View style={{flexDirection: 'row', alignItems: 'center'}}>
                        <Text
                            style={{
                                fontSize: 18,
                                marginRight: 6,
                                color: '#9ca3af',
                            }}
                        >
                            🔍
                        </Text>
                        <TextInput
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Name, type, license..."
                            placeholderTextColor="#9ca3af"
                            style={{
                                flex: 1,
                                paddingVertical: 4,
                                fontSize: 14,
                            }}
                        />
                    </View>
                </View>

                {/* Type filter chips */}
                <View
                    style={{
                        flexDirection: 'row',
                        flexWrap: 'wrap',
                        marginBottom: 8,
                    }}
                >
                    {[
                        {key: 'all', label: 'All'},
                        {key: 'tablet', label: 'Tablet'},
                        {key: 'capsule', label: 'Capsule'},
                        {key: 'syrup', label: 'Syrup'},
                        {key: 'injection', label: 'Injection'},
                        {key: 'cream', label: 'Cream'},
                    ].map((opt) => {
                        const active = typeFilter === opt.key;
                        return (
                            <TouchableOpacity
                                key={opt.key}
                                onPress={() => setTypeFilter(opt.key)}
                                style={{
                                    paddingHorizontal: 10,
                                    paddingVertical: 6,
                                    borderRadius: 999,
                                    marginRight: 8,
                                    marginBottom: 6,
                                    backgroundColor: active ? '#6d28d9' : '#e5e7eb',
                                }}
                            >
                                <Text
                                    style={{
                                        fontSize: 12,
                                        color: active ? '#fff' : '#111827',
                                        fontWeight: active ? '700' : '500',
                                    }}
                                >
                                    {opt.label}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* Products list */}
            <FlatList
                data={filteredProducts}
                keyExtractor={(i) => String(i.id)}
                contentContainerStyle={{
                    paddingHorizontal: 12,
                    paddingTop: 4,
                    paddingBottom: 20,
                }}
                renderItem={renderItem}

                ListEmptyComponent={
                    <Text style={{padding: 12, color: '#6b7280'}}>
                        {products.length === 0
                            ? 'No products yet. Add your first product.'
                            : 'No products match the filter/search.'}
                    </Text>
                }
            />
        </SafeAreaView>
    );
}
