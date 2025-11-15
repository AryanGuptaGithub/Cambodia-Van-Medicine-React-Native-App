// components/ProductPicker.js
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {FlatList, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function ProductPicker({
                                          visible,
                                          onClose,
                                          onAddProduct,
                                          onUpdateProduct,
                                          products = []
                                      }) {
    const insets = useSafeAreaInsets();
    const lastProductsRef = useRef(JSON.stringify(products || []));
    const [query, setQuery] = useState('');
    const [qtyMap, setQtyMap] = useState({});
    const [list, setList] = useState(products || []);
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [activeType, setActiveType] = useState('All');
    const [sortBy, setSortBy] = useState('relevance');

    const types = useMemo(() => {
        const set = new Set();
        (products || []).forEach(p => {
            if (p && p.type) set.add(String(p.type));
        });
        return ['All', ...Array.from(set)];
    }, [products]);

    useEffect(() => {
        if (!visible) return;
        try {
            const incoming = JSON.stringify(products || []);
            if (incoming !== lastProductsRef.current) {
                lastProductsRef.current = incoming;
                setList(products || []);
            } else {
                if ((!list || list.length === 0) && (products || []).length > 0) {
                    setList(products || []);
                }
            }
        } catch {
            setList(products || []);
        }
        setQuery('');
        setQtyMap({});
        setActiveType('All');
        setSortBy('relevance');
        setEditing(null);
        setEditForm({});
    }, [visible, products]);

    useEffect(() => {
        if (!visible) return;
        const q = (query || '').trim().toLowerCase();
        let out = (products || []).slice();

        if (activeType && activeType !== 'All') {
            out = out.filter(p => String(p.type || '') === String(activeType));
        }

        if (q) {
            out = out.filter(p => {
                const name = String(p.name || '').toLowerCase();
                const type = String(p.type || '').toLowerCase();
                const license = String(p.drugLicense || '').toLowerCase();
                return name.includes(q) || type.includes(q) || license.includes(q);
            });
        }

        switch (sortBy) {
            case 'az':
                out.sort((a, b) => String(a.name || '').localeCompare(String(b.name || '')));
                break;
            case 'price_asc':
                out.sort((a, b) => (Number(a.sellingPrice) || 0) - (Number(b.sellingPrice) || 0));
                break;
            case 'price_desc':
                out.sort((a, b) => (Number(b.sellingPrice) || 0) - (Number(a.sellingPrice) || 0));
                break;
            case 'stock_asc':
                out.sort((a, b) => (Number(a.stock) || 0) - (Number(b.stock) || 0));
                break;
            case 'stock_desc':
                out.sort((a, b) => (Number(b.stock) || 0) - (Number(a.stock) || 0));
                break;
            default:
                break;
        }

        const outJson = JSON.stringify(out.map(p => p.id));
        const listJson = JSON.stringify((list || []).map(p => p.id));
        if (outJson !== listJson) {
            setList(out);
        }
    }, [query, activeType, sortBy, products, visible]);

    const startEdit = (product) => {
        setEditing(product);
        setEditForm({
            name: product.name ?? '',
            type: product.type ?? '',
            stock: String(product.stock ?? 0),
            sellingPrice: String(product.sellingPrice ?? 0),
            purchasingPrice: String(product.purchasingPrice ?? 0),
            drugLicense: product.drugLicense ?? '',
            validity: product.validity ?? ''
        });
    };

    const saveEdit = () => {
        if (!editing) return;
        if (!editForm.name) return alert('Provide product name');
        const updates = {
            name: editForm.name,
            type: editForm.type,
            stock: Number(editForm.stock) || 0,
            sellingPrice: Number(editForm.sellingPrice) || 0,
            purchasingPrice: Number(editForm.purchasingPrice) || 0,
            drugLicense: editForm.drugLicense,
            validity: editForm.validity
        };
        onUpdateProduct && onUpdateProduct(String(editing.id), updates);
        setList(prev => prev.map(p => (String(p.id) === String(editing.id) ? {...p, ...updates} : p)));
        setEditing(null);
        setEditForm({});
    };

    return (
        <Modal visible={visible} transparent animationType="slide">
            <View style={styles.backdrop}>
                <View style={[styles.container, {paddingTop: insets.top + 12}]}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Select Product</Text>
                        <TouchableOpacity onPress={onClose}><Text style={styles.close}>Close</Text></TouchableOpacity>
                    </View>

                    <View style={styles.controlsRow}>
                        <TextInput
                            placeholder="Search product, type, license..."
                            value={query}
                            onChangeText={setQuery}
                            style={styles.searchInput}
                        />
                    </View>

                    <View style={{paddingHorizontal: 12}}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{paddingVertical: 8}}>
                            {types.map(t => {
                                const active = String(t) === String(activeType);
                                return (
                                    <TouchableOpacity
                                        key={t}
                                        onPress={() => setActiveType(t)}
                                        style={[styles.chip, active ? styles.chipActive : undefined]}
                                    >
                                        <Text style={active ? styles.chipTextActive : styles.chipText}>{t}</Text>
                                    </TouchableOpacity>
                                );
                            })}
                        </ScrollView>
                    </View>

                    <View style={styles.sortRow}>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}
                                    contentContainerStyle={{paddingHorizontal: 12}}>
                            <SortBtn label="Relevance" id="relevance" active={sortBy === 'relevance'}
                                     onPress={() => setSortBy('relevance')}/>
                            <SortBtn label="A → Z" id="az" active={sortBy === 'az'} onPress={() => setSortBy('az')}/>
                            <SortBtn label="Price ↑" id="price_asc" active={sortBy === 'price_asc'}
                                     onPress={() => setSortBy('price_asc')}/>
                            <SortBtn label="Price ↓" id="price_desc" active={sortBy === 'price_desc'}
                                     onPress={() => setSortBy('price_desc')}/>
                            <SortBtn label="Stock ↑" id="stock_desc" active={sortBy === 'stock_desc'}
                                     onPress={() => setSortBy('stock_desc')}/>
                            <SortBtn label="Stock ↓" id="stock_asc" active={sortBy === 'stock_asc'}
                                     onPress={() => setSortBy('stock_asc')}/>
                        </ScrollView>
                    </View>

                    <FlatList
                        data={list}
                        keyExtractor={p => String(p.id)}
                        contentContainerStyle={{paddingBottom: 40}}
                        renderItem={({item}) => (
                            <View style={styles.row}>
                                <View style={{flex: 1}}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text style={styles.meta}>${item.sellingPrice} •
                                        Stock: {item.stock} • {item.type}</Text>
                                    {item.stock <= 5 && <Text style={styles.lowStock}>⚠ Low stock</Text>}
                                </View>

                                <TextInput
                                    keyboardType="numeric"
                                    value={qtyMap[String(item.id)] ?? '1'}
                                    onChangeText={v => setQtyMap(prev => ({
                                        ...prev,
                                        [String(item.id)]: v.replace(/[^0-9]/g, '')
                                    }))}
                                    style={styles.qtyBox}
                                />

                                <TouchableOpacity
                                    onPress={() => {
                                        const qty = Math.max(1, parseInt(qtyMap[String(item.id)] || '1', 10) || 1);
                                        if (typeof item.stock === 'number' && item.stock >= 0 && qty > item.stock) {
                                            alert(`Cannot add ${qty}. Only ${item.stock} in stock.`);
                                            return;
                                        }
                                        onAddProduct && onAddProduct(item, qty);
                                        setQtyMap(prev => ({...prev, [String(item.id)]: '1'}));
                                    }}
                                    style={styles.addBtn}
                                >
                                    <Text style={{color: '#fff'}}>Add</Text>
                                </TouchableOpacity>

                                <TouchableOpacity onPress={() => startEdit(item)} style={styles.editBtn}>
                                    <Text style={{color: '#064e3b'}}>Edit</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                        ListEmptyComponent={<Text style={{padding: 12, color: '#6b7280'}}>No products found</Text>}
                    />

                    {editing && (
                        <View style={styles.editOverlay}>
                            <ScrollView contentContainerStyle={{padding: 12}}>
                                <Text style={{fontWeight: '700', marginBottom: 8}}>Edit Product</Text>

                                <Labeled label="Name">
                                    <TextInput value={editForm.name}
                                               onChangeText={v => setEditForm(prev => ({...prev, name: v}))}
                                               style={styles.input}/>
                                </Labeled>

                                <Labeled label="Type">
                                    <TextInput value={editForm.type}
                                               onChangeText={v => setEditForm(prev => ({...prev, type: v}))}
                                               style={styles.input}/>
                                </Labeled>

                                <Labeled label="Stock">
                                    <TextInput keyboardType="numeric" value={editForm.stock}
                                               onChangeText={v => setEditForm(prev => ({
                                                   ...prev,
                                                   stock: v.replace(/[^0-9]/g, '')
                                               }))} style={styles.input}/>
                                </Labeled>

                                <Labeled label="Selling Price">
                                    <TextInput keyboardType="numeric" value={editForm.sellingPrice}
                                               onChangeText={v => setEditForm(prev => ({...prev, sellingPrice: v}))}
                                               style={styles.input}/>
                                </Labeled>

                                <Labeled label="Purchasing Price">
                                    <TextInput keyboardType="numeric" value={editForm.purchasingPrice}
                                               onChangeText={v => setEditForm(prev => ({...prev, purchasingPrice: v}))}
                                               style={styles.input}/>
                                </Labeled>

                                <Labeled label="Drug License">
                                    <TextInput value={editForm.drugLicense}
                                               onChangeText={v => setEditForm(prev => ({...prev, drugLicense: v}))}
                                               style={styles.input}/>
                                </Labeled>

                                <Labeled label="Validity (YYYY-MM-DD)">
                                    <TextInput value={editForm.validity}
                                               onChangeText={v => setEditForm(prev => ({...prev, validity: v}))}
                                               style={styles.input}/>
                                </Labeled>

                                <View style={{flexDirection: 'row', justifyContent: 'space-between', marginTop: 12}}>
                                    <TouchableOpacity onPress={() => {
                                        setEditing(null);
                                        setEditForm({});
                                    }} style={[styles.actionBtn, {backgroundColor: '#e5e7eb'}]}>
                                        <Text>Cancel</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity onPress={saveEdit}
                                                      style={[styles.actionBtn, {backgroundColor: '#059669'}]}>
                                        <Text style={{color: '#fff'}}>Save</Text>
                                    </TouchableOpacity>
                                </View>
                            </ScrollView>
                        </View>
                    )}
                </View>
            </View>
        </Modal>
    );
}

function SortBtn({label, id, active, onPress}) {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.sortBtn, active ? styles.sortBtnActive : undefined]}>
            <Text style={active ? styles.sortBtnTextActive : styles.sortBtnText}>{label}</Text>
        </TouchableOpacity>
    );
}

const Labeled = ({label, children}) => (
    <View style={{marginBottom: 8}}>
        <Text style={{fontWeight: '700', marginBottom: 6}}>{label}</Text>
        <View style={{backgroundColor: '#fff'}}>{children}</View>
    </View>
);

const styles = StyleSheet.create({
    backdrop: {flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end'},
    container: {backgroundColor: '#fff', borderTopLeftRadius: 12, borderTopRightRadius: 12, maxHeight: '85%'},
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingBottom: 8
    },
    title: {fontWeight: '700', fontSize: 16},
    close: {color: '#ef4444', fontWeight: '700'},

    controlsRow: {paddingHorizontal: 12, paddingBottom: 8},
    searchInput: {backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb'},

    sortRow: {paddingVertical: 8},
    sortBtn: {
        paddingVertical: 6,
        paddingHorizontal: 10,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#e6e6e6',
        marginRight: 8
    },
    sortBtnActive: {backgroundColor: '#eef2ff', borderColor: '#c7d2fe'},
    sortBtnText: {color: '#374151'},
    sortBtnTextActive: {color: '#3730a3', fontWeight: '700'},

    chip: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 999,
        borderWidth: 1,
        borderColor: '#e6e6e6',
        marginRight: 8
    },
    chipActive: {backgroundColor: '#0ea5a4', borderColor: '#059669'},
    chipText: {color: '#374151'},
    chipTextActive: {color: '#fff', fontWeight: '700'},

    row: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        alignItems: 'center'
    },
    name: {fontWeight: '700'},
    meta: {fontSize: 12, color: '#6b7280', marginTop: 4},
    lowStock: {color: '#ef4444', fontSize: 12, marginTop: 4},

    qtyBox: {
        width: 60,
        borderWidth: 1,
        borderColor: '#ddd',
        padding: 6,
        borderRadius: 8,
        textAlign: 'center',
        marginRight: 8
    },
    addBtn: {backgroundColor: '#059669', padding: 10, borderRadius: 8, marginLeft: 6},
    editBtn: {padding: 8, marginLeft: 8},

    editOverlay: {
        position: 'absolute',
        left: 12,
        right: 12,
        top: 70,
        bottom: 20,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 8,
        elevation: 6
    },
    input: {backgroundColor: '#fff', padding: 10, borderWidth: 1, borderColor: '#e5e7eb', borderRadius: 8},

    actionBtn: {padding: 12, borderRadius: 8, width: '48%', alignItems: 'center'}
});
