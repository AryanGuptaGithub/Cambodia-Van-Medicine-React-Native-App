// src/screens/HomeScreen.js
import React, {useContext, useMemo, useState} from 'react';
import {Dimensions, ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LineChart} from 'react-native-chart-kit';
import {_AppContext} from '../context/_AppContext';
import {_NotificationContext} from '../context/_NotificationContext';

export default function HomeScreen({navigation}) {
    const {salesHistory, customers, products} = useContext(_AppContext);
    const {unreadCount} = useContext(_NotificationContext);

    const [isSyncing, setIsSyncing] = useState(false);

    const sales = Array.isArray(salesHistory) ? salesHistory : [];

    // Totals
    const totals = useMemo(() => {
        let totalSalesAmount = 0;
        let totalReturnsAmount = 0;
        let totalSalesCount = 0;
        let totalReturnsCount = 0;

        sales.forEach((sale) => {
            if (sale.greenTotal) {
                totalSalesAmount += sale.greenTotal;
                totalSalesCount += 1;
            }
            if (sale.returnsAmount) {
                totalReturnsAmount += sale.returnsAmount;
                totalReturnsCount += 1;
            }
        });

        return {
            totalSalesAmount,
            totalReturnsAmount,
            totalSalesCount,
            totalReturnsCount,
            netRevenue: totalSalesAmount - totalReturnsAmount,
        };
    }, [sales]);

    // Prepare dynamic graph data (last 7 days)
    const graphData = useMemo(() => {
        const today = new Date();
        const last7Days = Array.from({length: 7}, (_, i) => {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            return d;
        }).reverse();

        const dataPoints = last7Days.map(day => {
            const daySales = sales.filter(sale => {
                const saleDate = new Date(sale.createdAt);
                return saleDate.toDateString() === day.toDateString();
            });
            return daySales.reduce((sum, s) => sum + (s.greenTotal || 0), 0);
        });

        const labels = last7Days.map(d => d.toLocaleDateString('en-US', {weekday: 'short'}));

        return {labels, dataPoints};
    }, [sales]);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f4f6f9'}}>
            {/* Header */}
            <View style={{
                paddingHorizontal: 20,
                paddingVertical: 14,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Text style={{fontSize: 22, fontWeight: '700', color: '#1f2937'}}>Dashboard</Text>
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity
                        style={{marginRight: 16}}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <View>
                            <Icon name="bell-outline" size={24} color="#4b5563"/>
                            {unreadCount > 0 && (
                                <View style={{
                                    position: 'absolute',
                                    right: -2,
                                    top: -2,
                                    height: 10,
                                    width: 10,
                                    borderRadius: 10,
                                    backgroundColor: 'red',
                                }}/>
                            )}
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
                        <View style={{
                            height: 42,
                            width: 42,
                            borderRadius: 25,
                            backgroundColor: '#e5e7eb',
                            justifyContent: 'center',
                            alignItems: 'center'
                        }}>
                            <Icon name="account" size={24} color="#4b5563"/>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <ScrollView contentContainerStyle={{paddingBottom: 100}}>
                {/* Greeting */}
                <View style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    marginBottom: 20,
                    elevation: 2
                }}>
                    <Text style={{fontSize: 16, color: '#1f2937'}}>Good Morning, John 👋</Text>
                    <Text style={{fontSize: 14, color: '#6b7280', marginTop: 6}}>
                        Here’s your overview for today.
                    </Text>
                </View>

                {/* Stats Cards */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                    marginBottom: 20
                }}>
                    <StatsCard label="Customers" value={customers.length} icon="account-group"
                               onPress={() => navigation.navigate('Customers')}/>
                    <StatsCard label="Products" value={products.length} icon="package-variant"
                               onPress={() => navigation.navigate('Products')}/>
                    <StatsCard label="Sales" value={totals.totalSalesCount} icon="cash-multiple"
                               onPress={() => navigation.navigate('SalesReturnTotal')}/>
                    <StatsCard label="Returns" value={totals.totalReturnsCount} icon="undo"
                               onPress={() => navigation.navigate('SalesReturnTotal')}/>
                </View>

                {/* Sales Graph */}
                <View style={{marginHorizontal: 20, marginBottom: 20}}>
                    <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 12}}>Sales Overview (Last 7
                        Days)</Text>
                    <LineChart
                        data={{
                            labels: graphData.labels,
                            datasets: [{data: graphData.dataPoints}]
                        }}
                        width={Dimensions.get('window').width - 40}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#fff',
                            backgroundGradientFrom: '#f4f6f9',
                            backgroundGradientTo: '#f4f6f9',
                            decimalPlaces: 2,
                            color: (opacity = 1) => `rgba(38, 198, 218, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {borderRadius: 16},
                            propsForDots: {r: '6', strokeWidth: '2', stroke: '#fff'}
                        }}
                        bezier
                    />
                </View>

                {/* Quick Actions */}
                <View style={{marginHorizontal: 20, marginBottom: 20}}>
                    <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 12}}>Quick Actions</Text>
                    <View style={{flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between'}}>
                        <NavButton label="Customers" icon="account-group"
                                   onPress={() => navigation.navigate('Customers')}/>
                        <NavButton label="New Sale" icon="cash-multiple" onPress={() => navigation.navigate('Sales')}/>
                        <NavButton label="Products" icon="package-variant"
                                   onPress={() => navigation.navigate('Products')}/>
                        <NavButton label="Returns" icon="undo" onPress={() => navigation.navigate('Returns')}/>
                        <NavButton label="Payroll" icon="currency-usd" onPress={() => navigation.navigate('Payroll')}/>
                        <NavButton label="Attendance" icon="calendar-check"
                                   onPress={() => navigation.navigate('Attendance')}/>
                        <NavButton label="Stocks" icon="warehouse" onPress={() => navigation.navigate('Stocks')}/>
                    </View>
                </View>

                {/* Sync Status */}
                <View
                    style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 12}}>
                    <Text style={{fontSize: 14, color: '#6b7280', marginRight: 8}}>Sync Status:</Text>
                    <View style={{
                        height: 10,
                        width: 10,
                        borderRadius: 5,
                        backgroundColor: isSyncing ? '#ff9900' : '#4caf50'
                    }}/>
                    <Text style={{fontSize: 14, color: '#6b7280', marginLeft: 8}}>
                        {isSyncing ? 'Syncing...' : 'Synced'}
                    </Text>
                </View>
            </ScrollView>

            {/* Floating Action Button */}
            <TouchableOpacity
                style={{
                    position: 'absolute',
                    right: 20,
                    bottom: 20,
                    backgroundColor: '#2563eb',
                    borderRadius: 50,
                    padding: 16,
                    shadowColor: '#000',
                    shadowOffset: {width: 0, height: 4},
                    shadowOpacity: 0.1,
                    shadowRadius: 4
                }}
                onPress={() => navigation.navigate('Sales')}
            >
                <Icon name="plus" size={28} color="#fff"/>
            </TouchableOpacity>
        </SafeAreaView>
    );
}

// Stats Card
function StatsCard({label, value, icon, onPress}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                flex: 1,
                backgroundColor: '#fff',
                marginRight: 10,
                paddingVertical: 18,
                borderRadius: 14,
                alignItems: 'center',
                elevation: 3
            }}
        >
            <Icon name={icon} size={26} color="#3b82f6"/>
            <Text style={{fontSize: 20, fontWeight: '700', marginTop: 6}}>{value}</Text>
            <Text style={{fontSize: 13, color: '#6b7280'}}>{label}</Text>
        </TouchableOpacity>
    );
}

// Nav Button
function NavButton({label, icon, onPress}) {
    return (
        <TouchableOpacity
            onPress={onPress}
            style={{
                width: '48%',
                backgroundColor: '#fff',
                paddingVertical: 18,
                marginBottom: 12,
                borderRadius: 14,
                justifyContent: 'center',
                alignItems: 'center',
                elevation: 3
            }}
        >
            <Icon name={icon} size={28} color="#2563eb"/>
            <Text style={{fontSize: 14, fontWeight: '700', marginTop: 6}}>{label}</Text>
        </TouchableOpacity>
    );
}
