// src/screens/CustomersScreen.js
import React, {useContext, useMemo, useState} from 'react';
// A very lightweight "input" using Text as you were using plain React Native.
// If you already use TextInput somewhere common, you can swap it.
import {FlatList, Text, TextInput, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';

export default function CustomersScreen({navigation}) {
    const {customers} = useContext(_AppContext);

    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('all'); // all | pharmacy | hospital | clinic | distributor | agent

    const filteredCustomers = useMemo(() => {
        const q = search.trim().toLowerCase();

        return customers.filter((c) => {
            // type filter
            if (typeFilter !== 'all') {
                const agent = (c.agent || '').toLowerCase();
                if (!agent.includes(typeFilter)) return false;
            }

            if (!q) return true;

            const haystack = [
                c.name,
                c.agent,
                c.medRep,
                c.phone,
                c.zone,
                c.province,
            ]
                .filter(Boolean)
                .join(' ')
                .toLowerCase();

            return haystack.includes(q);
        });
    }, [customers, search, typeFilter]);

    const renderItem = ({item}) => (
        <View
            style={{
                backgroundColor: '#fff',
                padding: 12,
                borderRadius: 10,
                marginBottom: 10,
                borderWidth: 1,
                borderColor: '#e5e7eb',
            }}
        >
            <Text style={{fontWeight: '700', fontSize: 16}}>{item.name}</Text>

            <Text style={{color: '#6b7280', marginTop: 4}}>
                {(item.agent || 'Unknown type') +
                    (item.zone ? ` • ${item.zone}` : '') +
                    (item.province ? ` • ${item.province}` : '')}
            </Text>

            {item.medRep ? (
                <Text style={{marginTop: 4, fontSize: 12, color: '#4b5563'}}>
                    Med Rep: <Text style={{fontWeight: '600'}}>{item.medRep}</Text>
                </Text>
            ) : null}

            {item.phone ? (
                <Text style={{fontSize: 12, color: '#4b5563'}}>
                    Phone: <Text style={{fontWeight: '600'}}>{item.phone}</Text>
                </Text>
            ) : null}

            {typeof item.outstanding === 'number' ? (
                <Text
                    style={{
                        marginTop: 8,
                        fontWeight: '700',
                        color: '#b91c1c',
                    }}
                >
                    Outstanding: ${item.outstanding}
                </Text>
            ) : null}
        </View>
    );

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header
                title="Customers"
                onBack={() => navigation.goBack()}
                onAdd={() => navigation.navigate('AddCustomer')}
                backgroundColor="#2563eb"
            />

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
                    <View
                        style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                        }}
                    >
                        <Text
                            style={{
                                fontSize: 18,
                                marginRight: 6,
                                color: '#9ca3af',
                            }}
                        >
                            🔍
                        </Text>
                        <InputLikeText
                            value={search}
                            onChangeText={setSearch}
                            placeholder="Name, type, province, phone..."
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
                        {key: 'pharmacy', label: 'Pharmacy'},
                        {key: 'hospital', label: 'Hospital'},
                        {key: 'clinic', label: 'Clinic'},
                        {key: 'distributor', label: 'Distributor'},
                        {key: 'agent', label: 'Agent'},
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
                                    backgroundColor: active ? '#2563eb' : '#e5e7eb',
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

            <FlatList
                data={filteredCustomers}
                keyExtractor={(i) => String(i.id)}
                contentContainerStyle={{padding: 12, paddingTop: 4, paddingBottom: 20}}
                renderItem={renderItem}
                ListEmptyComponent={
                    <Text style={{padding: 12, color: '#6b7280'}}>
                        {customers.length === 0
                            ? 'No customers yet. Add your first customer.'
                            : 'No customers match the filter/search.'}
                    </Text>
                }
            />
        </SafeAreaView>
    );
}

function InputLikeText({value, onChangeText, placeholder}) {
    return (
        <TextInput
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            style={{
                flex: 1,
                paddingVertical: 4,
                fontSize: 14,
            }}
            placeholderTextColor="#9ca3af"
        />
    );
}
