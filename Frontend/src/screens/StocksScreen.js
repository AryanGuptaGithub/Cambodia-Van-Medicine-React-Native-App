// src/screens/StocksScreen.js
import React, {useContext, useEffect, useMemo, useState} from 'react';
import {FlatList, Image, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/jsfiles/Header';
import {_AppContext} from '../context/_AppContext';
import * as api from '../api/_api';


const SAMPLE_IMAGE = 'https://cdn-icons-png.flaticon.com/512/9098/9098442.png';

export default function StocksScreen({navigation}) {
    const {products, persistProducts} = useContext(_AppContext);

    const [query, setQuery] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [sortBy, setSortBy] = useState('name');

    // fetch latest stocks from backend on mount
    useEffect(() => {
        (async () => {
            try {
                const remoteStocks = await api.fetchStocks();
                if (Array.isArray(remoteStocks) && remoteStocks.length > 0) {
                    persistProducts(remoteStocks);  // update context + AsyncStorage
                }
            } catch (err) {
                console.log('Failed to fetch backend stocks:', err.message);
            }
        })();
    }, []);

    // derive types for chips
    const types = useMemo(() => {
        const s = new Set();
        (products || []).forEach(p => {
            if (p?.type) s.add(String(p.type));
        });
        return ['all', ...Array.from(s)];
    }, [products]);

    const LOW_STOCK_THRESHOLD = 50;

    const filtered = useMemo(() => {
        const q = (query || '').trim().toLowerCase();
        let out = (products || []).slice();

        if (typeFilter !== 'all') {
            out = out.filter(p => String(p.type || '').toLowerCase() === String(typeFilter).toLowerCase());
        }

        if (q) {
            out = out.filter(p => {
                const hay = [p.name, p.type, p.drugLicense, String(p.sellingPrice), String(p.purchasingPrice)]
                    .filter(Boolean).join(' ').toLowerCase();
                return hay.includes(q);
            });
        }

        switch (sortBy) {
            case 'stock_desc':
                out.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));
                break;
            case 'stock_asc':
                out.sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));
                break;
            case 'price_desc':
                out.sort((a, b) => (Number(b.sellingPrice) || 0) - (Number(a.sellingPrice) || 0));
                break;
            case 'price_asc':
                out.sort((a, b) => (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0));
                break;
            default:
                out.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
                break;
        }

        return out;
    }, [products, query, typeFilter, sortBy]);

    const totals = useMemo(() => {
        const totalSkus = (products || []).length;
        const totalQty = (products || []).reduce((s, p) => s + (Number(p.stock) || 0), 0);
        const lowCount = (products || []).filter(p => (Number(p.stock) || 0) <= LOW_STOCK_THRESHOLD).length;
        return {totalSkus, totalQty, lowCount};
    }, [products]);

    const renderItem = ({item}) => {

        console.log('Product item:', item);


        const stock = Number(item.stock) || 0;
        const low = stock <= LOW_STOCK_THRESHOLD;

        return (
            <View style={[styles.row, low ? styles.lowRow : null]}>
                <Image
                    source={item.image ? {uri: item.image} : {uri: SAMPLE_IMAGE}}
                    style={styles.thumb}
                />
                <View style={{flex: 1, marginLeft: 10, maxWidth: '65%'}}>
                    <Text style={styles.name} numberOfLines={2}>{item.name || item.productName}</Text>
                    <Text style={styles.meta}>
                        {item.type ? `${item.type} • ` : ''}
                        License: {item.drugLicense || '—'}
                    </Text>
                    <Text style={styles.small}>
                        Valid: {item.licenseValidityDate ? new Date(item.licenseValidityDate).toLocaleDateString() : '—'}
                    </Text>
                </View>

                <View style={{alignItems: 'flex-end'}}>
                    <Text style={styles.price}>${(Number(item.sellingPrice) || 0).toFixed(2)}</Text>
                    <View style={[styles.badge, low ? styles.badgeLow : styles.badgeOk]}>
                        <Text style={styles.badgeText}>{stock} pcs{low ? ' • Low' : ''}</Text>
                    </View>
                </View>
            </View>
        );
    };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header title="Stocks" onBack={() => navigation.goBack()} backgroundColor="#6d28d9"/>

            <View style={{padding: 12}}>
                {/* Totals */}
                <View style={styles.totalsRow}>
                    <View style={styles.totalCard}>
                        <Text style={styles.totalNum}>{totals.totalSkus}</Text>
                        <Text style={styles.totalLabel}>SKUs</Text>
                    </View>

                    <View style={styles.totalCard}>
                        <Text style={styles.totalNum}>{totals.totalQty}</Text>
                        <Text style={styles.totalLabel}>Total units</Text>
                    </View>

                    <View style={styles.totalCard}>
                        <Text style={[styles.totalNum, {color: '#ef4444'}]}>{totals.lowCount}</Text>
                        <Text style={styles.totalLabel}>Low stock</Text>
                    </View>
                </View>

                {/* Search + sort */}
                <View style={{marginTop: 12}}>
                    <TextInput
                        value={query}
                        onChangeText={setQuery}
                        placeholder="Search name, type, license..."
                        style={styles.search}
                        returnKeyType="search"
                    />

                    <View style={{flexDirection: 'row', marginTop: 8, alignItems: 'center'}}>
                        <ScrollChips
                            options={types}
                            active={typeFilter}
                            onPress={setTypeFilter}
                        />

                        <View style={{marginLeft: 8, flexDirection: 'row', alignItems: 'center'}}>
                            <TouchableOpacity
                                onPress={() => setSortBy('name')}
                                style={[styles.smallBtn, sortBy === 'name' ? styles.smallBtnActive : null]}
                            >
                                <Text
                                    style={sortBy === 'name' ? styles.smallBtnTextActive : styles.smallBtnText}>A→Z</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setSortBy('stock_desc')}
                                style={[styles.smallBtn, sortBy === 'stock_desc' ? styles.smallBtnActive : null]}
                            >
                                <Text style={sortBy === 'stock_desc' ? styles.smallBtnTextActive : styles.smallBtnText}>Stock
                                    ↓</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setSortBy('price_desc')}
                                style={[styles.smallBtn, sortBy === 'price_desc' ? styles.smallBtnActive : null]}
                            >
                                <Text style={sortBy === 'price_desc' ? styles.smallBtnTextActive : styles.smallBtnText}>Price
                                    ↓</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(i) => String(i._id)}
                renderItem={renderItem}
                contentContainerStyle={{padding: 12, paddingBottom: 90}}
                ListEmptyComponent={<Text style={{padding: 20, color: '#6b7280'}}>No products found</Text>}
            />
        </SafeAreaView>
    );
}

/* small helpers */
function ScrollChips({options = [], active, onPress}) {
    return (
        <View style={{flexDirection: 'row'}}>
            {options.map(opt => {
                const isActive = String(opt) === String(active);
                return (
                    <TouchableOpacity
                        key={opt}
                        onPress={() => onPress(opt)}
                        style={[styles.chip, isActive ? styles.chipActive : null]}>
                        <Text style={isActive ? styles.chipTextActive : styles.chipText}>
                            {opt === 'all' ? 'All' : opt}
                        </Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    totalsRow: {flexDirection: 'row', justifyContent: 'space-between', gap: 8},
    totalCard: {flex: 1, backgroundColor: '#fff', padding: 12, borderRadius: 10, alignItems: 'center'},
    totalNum: {fontSize: 20, fontWeight: '700'},
    totalLabel: {fontSize: 12, color: '#6b7280', marginTop: 4},

    search: {backgroundColor: '#fff', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb'},

    chip: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginRight: 8
    },
    chipActive: {backgroundColor: '#6d28d9', borderColor: '#5b21b6'},
    chipText: {color: '#374151'},
    chipTextActive: {color: '#fff', fontWeight: '700'},

    row: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 12,
        borderRadius: 10,
        marginBottom: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#e5e7eb'
    },
    lowRow: {borderColor: '#fecaca', backgroundColor: '#fff7f7'},
    thumb: {width: 56, height: 56, borderRadius: 8, backgroundColor: '#f1f5f9'},
    name: {fontWeight: '700'},
    meta: {color: '#6b7280', marginTop: 4, fontSize: 12},
    small: {fontSize: 12, color: '#9ca3af', marginTop: 4},

    price: {fontWeight: '700'},
    badge: {marginTop: 8, paddingVertical: 6, paddingHorizontal: 8, borderRadius: 999},
    badgeOk: {backgroundColor: '#dcfce7'},
    badgeLow: {backgroundColor: '#fee2e2'},
    badgeText: {fontSize: 12, fontWeight: '700', color: '#111827'},

    smallBtn: {
        paddingHorizontal: 8,
        paddingVertical: 6,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginLeft: 8
    },
    smallBtnActive: {backgroundColor: '#eef2ff', borderColor: '#c7d2fe'},
    smallBtnText: {color: '#374151'},
    smallBtnTextActive: {color: '#3730a3', fontWeight: '700'},
});
