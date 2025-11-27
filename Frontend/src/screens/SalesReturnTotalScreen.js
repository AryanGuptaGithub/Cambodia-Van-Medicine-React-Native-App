// src/screens/SalesReturnScreen.js
import React, {useEffect, useMemo, useState} from 'react';
import {FlatList, Text, TextInput, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/jsfiles/Header';
import {fetchCustomers, fetchMySales} from '../api/_api';

export default function SalesReturnTotalScreen({navigation}) {
    const [sales, setSales] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const getData = async () => {
            try {
                const [salesData, customersData] = await Promise.all([
                    fetchMySales(),
                    fetchCustomers(),
                ]);
                setSales(Array.isArray(salesData) ? salesData : []);
                setCustomers(Array.isArray(customersData) ? customersData : []);
            } catch (err) {
                console.error('Error fetching sales/customers:', err);
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, []);

    // Attach customer names to each sale
    const salesWithNames = useMemo(() => {
        return sales.map((sale) => {
            const customer = customers.find(
                (c) => String(c.id || c._id) === String(sale.customerId)
            );
            return {
                ...sale,
                customerName: customer ? customer.name : 'Unknown Customer',
            };
        });
    }, [sales, customers]);

    // Filtered sales
    const filteredSales = useMemo(() => {
        const q = search.trim().toLowerCase();
        return salesWithNames
            .filter((sale) => {
                const text = `${sale.invoiceNumber || sale.invoice} ${sale.customerName}`.toLowerCase();
                return q === '' || text.includes(q);
            })
            .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }, [salesWithNames, search]);

    // Totals
    const totals = useMemo(() => {
        let totalSales = 0;
        let totalReturns = 0;
        filteredSales.forEach((sale) => {
            totalSales += sale.greenTotal || 0;
            totalReturns += sale.returnsAmount || 0;
        });
        return {
            totalSales,
            totalReturns,
            netRevenue: totalSales - totalReturns,
        };
    }, [filteredSales]);

    const renderItem = ({item}) => (
        <View
            style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 14,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: '#e5e7eb',
                elevation: 1,
            }}
        >
            <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={{fontWeight: '700', fontSize: 16}}>
                    {item.invoiceNumber || item.invoice}
                </Text>
                <View
                    style={{
                        backgroundColor: '#eef2ff',
                        paddingHorizontal: 10,
                        paddingVertical: 4,
                        borderRadius: 20,
                    }}
                >
                    <Text style={{fontSize: 12, color: '#4338ca'}}>
                        {new Date(item.createdAt).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <Text style={{color: '#6b7280', marginTop: 4}}>
                Customer: <Text style={{fontWeight: '600'}}>{item.customerName}</Text>
            </Text>

            <View style={{marginTop: 10}}>
                <Text style={{fontSize: 14}}>
                    Total: <Text style={{fontWeight: '700'}}>${item.greenTotal?.toFixed(2)}</Text>
                </Text>
                <Text style={{fontSize: 14, color: '#b91c1c', marginTop: 4}}>
                    Returns: <Text style={{fontWeight: '700'}}>${item.returnsAmount?.toFixed(2) || '0.00'}</Text>
                </Text>
                <Text style={{fontSize: 15, fontWeight: '700', marginTop: 8, color: '#059669'}}>
                    Net: ${(item.greenTotal - (item.returnsAmount || 0)).toFixed(2)}
                </Text>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f1f5f9'}}>
            <Header
                title="Sales & Returns Summary"
                backgroundColor="#4f46e5"
                onBack={() => navigation.goBack()}
            />

            <View style={{flex: 1, padding: 14}}>
                {/* Search Box */}
                <TextInput
                    placeholder="🔍 Search invoice or customer"
                    placeholderTextColor="#9ca3af"
                    value={search}
                    onChangeText={setSearch}
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        paddingLeft: 16,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        marginBottom: 14,
                        fontSize: 14,
                    }}
                />

                {/* Summary Card */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        padding: 16,
                        borderRadius: 14,
                        marginBottom: 14,
                        borderWidth: 1,
                        borderColor: '#e5e7eb',
                        elevation: 1,
                    }}
                >
                    <Text style={{fontWeight: '700', fontSize: 16, marginBottom: 10}}>Summary</Text>
                    <Text style={{fontSize: 14}}>
                        Total Sales: <Text style={{fontWeight: '700'}}>${totals.totalSales.toFixed(2)}</Text>
                    </Text>
                    <Text style={{fontSize: 14, marginTop: 4, color: '#dc2626'}}>
                        Total Returns: <Text style={{fontWeight: '700'}}>${totals.totalReturns.toFixed(2)}</Text>
                    </Text>
                    <View style={{marginTop: 10, padding: 10, backgroundColor: '#d1fae5', borderRadius: 8}}>
                        <Text style={{fontSize: 16, fontWeight: '700', color: '#065f46'}}>
                            Net Revenue: ${totals.netRevenue.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Sales List */}
                {loading ? (
                    <Text style={{textAlign: 'center', marginTop: 40, color: '#6b7280', fontSize: 14}}>
                        Loading sales...
                    </Text>
                ) : (
                    <FlatList
                        data={filteredSales}
                        keyExtractor={(item, index) => String(item._id || item.id || index)}
                        renderItem={renderItem}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={{textAlign: 'center', marginTop: 40, color: '#6b7280', fontSize: 14}}>
                                No sales records found.
                            </Text>
                        }
                    />
                )}
            </View>
        </SafeAreaView>
    );
}
