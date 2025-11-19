import React, {useEffect, useState} from 'react';
import {
    FlatList,
    KeyboardAvoidingView,
    Modal,
    Platform,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    TouchableWithoutFeedback,
    View,
} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';

export function ProductPicker({visible, onClose, onAddProduct, onUpdateProduct, products = []}) {
    const [query, setQuery] = useState('');
    const [qtyMap, setQtyMap] = useState({});
    const [list, setList] = useState(products || []);
    const [editing, setEditing] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [selectedProducts, setSelectedProducts] = useState({});

    useEffect(() => {
        if (!visible) {
            setQuery('');
            setQtyMap({});
            setList(products || []);
            setEditing(null);
            setEditForm({});
            setSelectedProducts({});
        }
    }, [visible, products]);

    const handleDone = () => {
        if (onAddProduct) {
            Object.values(selectedProducts).forEach(prod => onAddProduct(prod));
        }
        onClose && onClose();
    };

    const renderProduct = ({item}) => (
        <View style={styles.row}>
            <View style={{flex: 1}}>
                <Text style={styles.name}>{item.name}</Text>
                <Text style={styles.meta}>${item.sellingPrice} • Stock: {item.stock}</Text>
            </View>
            <TextInput
                keyboardType="numeric"
                value={qtyMap[String(item.id)] ?? '1'}
                onChangeText={v => setQtyMap(prev => ({...prev, [String(item.id)]: v.replace(/[^0-9]/g, '')}))}
                style={styles.qtyBox}
            />
            <TouchableOpacity
                onPress={() => {
                    const qty = Math.max(1, parseInt(qtyMap[String(item.id)] || '1', 10));
                    setSelectedProducts(prev => ({...prev, [String(item.id)]: {...item, qty}}));
                }}
                style={styles.addBtn}
            >
                <Text style={{color: '#fff'}}>{selectedProducts[String(item.id)] ? 'Selected' : 'Add'}</Text>
            </TouchableOpacity>
        </View>
    );

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <TouchableWithoutFeedback onPress={onClose}>
                <View style={styles.backdrop}/>
            </TouchableWithoutFeedback>

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <SafeAreaView style={styles.panel}>
                    {/* Header */}
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Select Product</Text>
                        <TouchableOpacity onPress={onClose}>
                            <Text style={styles.close}>Close</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Search Input */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            placeholder="Search product..."
                            value={query}
                            onChangeText={setQuery}
                            style={styles.searchInput}
                        />
                    </View>

                    {/* Product List */}
                    <FlatList
                        data={list}
                        keyExtractor={item => String(item.id)}
                        renderItem={renderProduct}
                        contentContainerStyle={{paddingBottom: 12}}
                        keyboardShouldPersistTaps="handled"
                        style={styles.flex}
                    />

                    {/* Done Button */}
                    <View style={styles.doneContainer}>
                        <TouchableOpacity onPress={handleDone} style={styles.doneBtn}>
                            <Text style={styles.doneText}>Done</Text>
                        </TouchableOpacity>
                    </View>
                </SafeAreaView>
            </KeyboardAvoidingView>
        </Modal>
    );
}

const styles = StyleSheet.create({
    flex: {flex: 1},
    backdrop: {...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)'},
    panel: {flex: 1, backgroundColor: '#fff'},
    headerRow: {flexDirection: 'row', justifyContent: 'space-between', padding: 16},
    title: {fontSize: 16, fontWeight: '700'},
    close: {color: '#ef4444', fontWeight: '700'},
    searchContainer: {paddingHorizontal: 16, paddingBottom: 8},
    searchInput: {backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8},
    row: {flexDirection: 'row', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9', alignItems: 'center'},
    name: {fontWeight: '700'},
    meta: {fontSize: 12, color: '#6b7280'},
    qtyBox: {width: 50, borderWidth: 1, borderColor: '#ddd', padding: 6, textAlign: 'center', borderRadius: 8},
    addBtn: {backgroundColor: '#059669', padding: 10, borderRadius: 8, marginLeft: 8},
    doneContainer: {padding: 12},
    doneBtn: {backgroundColor: '#059669', padding: 12, borderRadius: 8, alignItems: 'center'},
    doneText: {color: '#fff', fontWeight: '700'},
});
