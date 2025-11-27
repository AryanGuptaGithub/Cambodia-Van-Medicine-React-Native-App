import React, {useContext, useState} from 'react';
import {ScrollView, Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {LineChart} from 'react-native-chart-kit';
import {_AppContext} from '../context/_AppContext';
import {_NotificationContext} from '../context/_NotificationContext';

export default function HomeScreen({navigation}) {
    const {customers, products} = useContext(_AppContext);
    const [isSyncing, setIsSyncing] = useState(false);
    const {unreadCount} = useContext(_NotificationContext);

    // Example data for the sales chart
    const salesData = [100, 200, 300, 400, 500, 600, 700];

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f4f6f9'}}>

            {/* Header with Greeting and Profile */}
            <View style={{
                paddingHorizontal: 20,
                paddingVertical: 14,
                flexDirection: 'row',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <Text style={{fontSize: 22, fontWeight: '700', color: '#1f2937'}}>
                    Dashboard
                </Text>

                {/* Notifications and Profile */}
                <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <TouchableOpacity
                        style={{marginRight: 16}}
                        onPress={() => navigation.navigate('Notifications')}
                    >
                        <View style={{}}>
                            <Icon name="bell-outline" size={24} color="#4b5563"/>

                            {/* Red Badge */}
                            {unreadCount > 0 && (
                                <View
                                    style={{
                                        position: 'absolute',
                                        right: -2,
                                        top: -2,
                                        height: 10,
                                        width: 10,
                                        borderRadius: 10,
                                        backgroundColor: 'red',
                                    }}
                                />
                            )}
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity style={{marginRight: 16}} onPress={() => navigation.navigate('Profile')}>
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

            {/* Scrollable Content */}
            <ScrollView contentContainerStyle={{paddingBottom: 100}}>

                {/* Greeting Message */}
                <View style={{
                    paddingHorizontal: 20,
                    paddingVertical: 10,
                    backgroundColor: '#fff',
                    borderRadius: 10,
                    marginBottom: 20,
                    elevation: 2
                }}>
                    <Text style={{fontSize: 16, color: '#1f2937'}}>Good Morning, John 👋</Text>
                    <Text style={{fontSize: 14, color: '#6b7280', marginTop: 6}}>Here’s your overview for today.</Text>
                </View>

                {/* Stats Summary Bar */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginHorizontal: 20,
                    marginBottom: 20
                }}>
                    <TouchableOpacity
                        onPress={() => navigation.navigate('Customers')}
                        style={{flex: 1, marginRight: 10}}  // Adjust spacing as needed
                    >
                        <StatsCard label="Customers" value={customers.length} icon="account-group"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('Products')}
                        style={{flex: 1, marginHorizontal: 5}}
                    >
                        <StatsCard label="Products" value={products.length} icon="package-variant"/>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={() => navigation.navigate('SalesReturnTotal')}
                        style={{flex: 1, marginLeft: 10}}
                    >
                        <StatsCard label="Sales" value="1200" icon="cash-multiple"/>
                    </TouchableOpacity>
                </View>


                {/* Mini Sales Chart */}
                <View style={{marginHorizontal: 20, marginBottom: 20}}>
                    <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 12}}>Sales Overview (Last 7
                        Days)</Text>
                    <LineChart
                        data={{
                            labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
                            datasets: [{data: salesData}]
                        }}
                        width={350}
                        height={220}
                        chartConfig={{
                            backgroundColor: '#fff',
                            backgroundGradientFrom: '#f4f6f9',
                            backgroundGradientTo: '#f4f6f9',
                            decimalPlaces: 0,
                            color: (opacity = 1) => `rgba(38, 198, 218, ${opacity})`,
                            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                            style: {borderRadius: 16},
                            propsForDots: {r: '6', strokeWidth: '2', stroke: '#fff'}
                        }}
                        bezier
                    />
                </View>

                {/* Quick Navigation Buttons */}
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

                {/* Recent Activities */}
                <View style={{marginHorizontal: 20, marginBottom: 20}}>
                    <Text style={{fontSize: 18, fontWeight: '600', marginBottom: 12}}>Recent Activities</Text>
                    {['Sale Created', 'New Customer Added', 'Product Returned'].map((activity, index) => (
                        <View key={index} style={{
                            paddingVertical: 10,
                            borderBottomWidth: 1,
                            borderBottomColor: '#e5e7eb'
                        }}>
                            <Text style={{fontSize: 14, color: '#4b5563'}}>{activity}</Text>
                            <Text style={{fontSize: 12, color: '#6b7280'}}>Just now</Text>
                        </View>
                    ))}
                </View>

                {/* Sync Status Indicator */}
                <View style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginVertical: 12
                }}>
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
                onPress={() => navigation.navigate('Sales')}>
                <Icon name="plus" size={28} color="#fff"/>
            </TouchableOpacity>

        </SafeAreaView>
    );
}

// Stats Card Component
function StatsCard({label, value, icon}) {
    return (
        <View style={{
            flex: 1,
            backgroundColor: '#fff',
            marginRight: 10,
            paddingVertical: 18,
            borderRadius: 14,
            alignItems: 'center',
            elevation: 3
        }}>
            <Icon name={icon} size={26} color="#3b82f6"/>
            <Text style={{fontSize: 20, fontWeight: '700', marginTop: 6}}>
                {value}
            </Text>
            <Text style={{fontSize: 13, color: '#6b7280'}}>
                {label}
            </Text>
        </View>
    );
}

// Navigation Button Component
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


