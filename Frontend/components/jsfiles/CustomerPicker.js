// components/jsfiles/CustomerPicker.js
import React, {useEffect, useMemo, useRef, useState} from 'react';
import {Modal, SectionList, StyleSheet, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';

export default function CustomerPicker({visible, onClose, onSelect, customers = []}) {
    const insets = useSafeAreaInsets();
    const [query, setQuery] = useState('');
    const [activeLetter, setActiveLetter] = useState(null);
    const sectionListRef = useRef(null);

    useEffect(() => {
        if (!visible) {
            setQuery('');
            setActiveLetter(null);
        }
    }, [visible]);

    const filtered = useMemo(() => {
        const q = (query || '').trim().toLowerCase();
        if (!q) return customers || [];
        return (customers || []).filter(c => {
            return (
                String(c.name || '').toLowerCase().includes(q) ||
                String(c.agent || '').toLowerCase().includes(q) ||
                String(c.zone || '').toLowerCase().includes(q) ||
                String(c.province || '').toLowerCase().includes(q)
            );
        });
    }, [customers, query]);

    const sections = useMemo(() => {
        const map = new Map();
        (filtered || []).forEach(c => {
            const name = String(c.name || '');
            const letter = name.trim() ? name.trim().charAt(0).toUpperCase() : '#';
            if (!map.has(letter)) map.set(letter, []);
            map.get(letter).push(c);
        });

        const sorted = Array.from(map.entries())
            .sort((a, b) => {
                if (a[0] === '#') return 1;
                if (b[0] === '#') return -1;
                return a[0].localeCompare(b[0]);
            })
            .map(([title, data]) => ({title, data}));

        return sorted;
    }, [filtered]);

    const letters = useMemo(() => sections.map(s => s.title), [sections]);

    const jumpToLetter = (letter) => {
        setActiveLetter(letter);
        const idx = sections.findIndex(s => s.title === letter);
        if (idx >= 0 && sectionListRef.current && sectionListRef.current.scrollToLocation) {
            sectionListRef.current.scrollToLocation({sectionIndex: idx, itemIndex: 0, animated: true});
        }
    };

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.backdrop}>
                <View style={[styles.container, {paddingTop: insets.top + 12}]}>
                    <View style={styles.headerRow}>
                        <Text style={styles.title}>Select Customer</Text>
                        <TouchableOpacity onPress={onClose}><Text style={styles.close}>Close</Text></TouchableOpacity>
                    </View>

                    <View style={styles.searchRow}>
                        <TextInput
                            placeholder="Search name / agent / zone / province..."
                            value={query}
                            onChangeText={setQuery}
                            style={styles.searchInput}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.chipsRow}>
                        <SectionLetters letters={letters} active={activeLetter} onPress={jumpToLetter}/>
                    </View>

                    <SectionList
                        ref={sectionListRef}
                        sections={sections}
                        keyExtractor={(item) => String(item._id ?? item.id ?? Math.random())}
                        renderItem={({item}) => (
                            <TouchableOpacity
                                style={styles.row}
                                onPress={() => onSelect && onSelect(item)}
                            >
                                <View style={{flex: 1}}>
                                    <Text style={styles.name}>{item.name}</Text>
                                    <Text
                                        style={styles.meta}>{item.agent || ''} • {item.zone || ''} • {item.province || ''}</Text>
                                </View>
                                <Text style={styles.idText}>{item._id ?? item.id}</Text>

                            </TouchableOpacity>
                        )}
                        renderSectionHeader={({section: {title}}) => (
                            <View style={styles.sectionHeader}><Text
                                style={styles.sectionHeaderText}>{title}</Text></View>
                        )}
                        ListEmptyComponent={<Text style={{padding: 12, color: '#6b7280'}}>No customers found</Text>}
                        stickySectionHeadersEnabled
                        contentContainerStyle={{paddingBottom: 40}}
                        showsVerticalScrollIndicator={false}
                    />
                </View>
            </View>
        </Modal>
    );
}

function SectionLetters({letters = [], active, onPress}) {
    const all = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    return (
        <View style={{flexDirection: 'row', paddingHorizontal: 12}}>
            {all.map(l => {
                const enabled = letters.includes(l);
                const isActive = active === l;
                return (
                    <TouchableOpacity
                        key={l}
                        onPress={() => enabled && onPress(l)}
                        style={[styles.letterChip, isActive ? styles.letterChipActive : undefined, !enabled ? styles.letterChipDisabled : undefined]}
                        disabled={!enabled}
                    >
                        <Text
                            style={isActive ? styles.letterTextActive : (enabled ? styles.letterText : styles.letterTextDisabled)}>{l}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>
    );
}

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
    searchRow: {paddingHorizontal: 12, paddingBottom: 8},
    searchInput: {backgroundColor: '#f3f4f6', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#e5e7eb'},
    chipsRow: {paddingHorizontal: 12, paddingBottom: 8},
    letterChip: {
        padding: 8,
        marginRight: 6,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: '#e6e6e6',
        backgroundColor: '#fff'
    },
    letterChipActive: {backgroundColor: '#2563eb', borderColor: '#1e40af'},
    letterChipDisabled: {opacity: 0.35},
    letterText: {color: '#374151', fontWeight: '700'},
    letterTextActive: {color: '#fff', fontWeight: '700'},
    letterTextDisabled: {color: '#9ca3af'},
    row: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        flexDirection: 'row',
        alignItems: 'center'
    },
    name: {fontWeight: '700'},
    meta: {fontSize: 12, color: '#6b7280', marginTop: 4},
    idText: {color: '#6b7280', fontSize: 12, marginLeft: 8},
    sectionHeader: {paddingHorizontal: 12, paddingVertical: 6, backgroundColor: '#f8fafc'},
    sectionHeaderText: {fontWeight: '700', color: '#374151'}
});
