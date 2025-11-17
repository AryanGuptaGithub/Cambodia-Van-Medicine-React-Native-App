// src/screens/PayrollScreen.js
import React from 'react';
import {Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/jsfiles/Header';

export default function PayrollScreen({navigation}) {
    const baseSalary = 500;
    const commission = 124;
    const bonuses = 50;
    const deductions = 20;
    const total = baseSalary + commission + bonuses - deductions;

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fffbeb'}}>
            <Header
                title="Payroll & Incentives"
                onBack={() => navigation.goBack()}
                backgroundColor="#f59e0b"
            />

            <View style={{flex: 1, padding: 12}}>
                {/* This month summary */}
                <View
                    style={{
                        backgroundColor: '#fef3c7',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                        borderWidth: 1,
                        borderColor: '#facc15',
                    }}
                >
                    <Text style={{fontWeight: '700', marginBottom: 8}}>
                        This Month (Demo)
                    </Text>

                    <Row label="Base Salary" value={`$${baseSalary.toFixed(2)}`}/>
                    <Row
                        label="Sales Commission"
                        value={`+$${commission.toFixed(2)}`}
                        valueColor="#16a34a"
                    />
                    <Row
                        label="Bonuses"
                        value={`+$${bonuses.toFixed(2)}`}
                        valueColor="#16a34a"
                    />
                    <Row
                        label="Deductions"
                        value={`-$${deductions.toFixed(2)}`}
                        valueColor="#b91c1c"
                    />

                    <View
                        style={{
                            marginTop: 10,
                            paddingVertical: 10,
                            paddingHorizontal: 12,
                            borderRadius: 10,
                            backgroundColor: '#16a34a',
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                        }}
                    >
                        <Text style={{color: '#fff', fontWeight: '700'}}>
                            Total Expected
                        </Text>
                        <Text style={{color: '#fff', fontWeight: '700', fontSize: 18}}>
                            ${total.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Performance metrics */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <Text style={{fontWeight: '700', marginBottom: 8}}>
                        Performance Metrics
                    </Text>

                    <Metric
                        label="Sales Target"
                        valueText="$5,240 / $8,000"
                        percent={65}
                        barColor="#16a34a"
                    />
                    <Metric
                        label="Customer Visits"
                        valueText="42 / 60"
                        percent={70}
                        barColor="#2563eb"
                    />
                </View>

                {/* Payment history */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                    }}
                >
                    <Text style={{fontWeight: '700', marginBottom: 8}}>
                        Recent Payments (Demo)
                    </Text>

                    {[
                        {month: 'October 2025', date: 'Oct 31, 2025', amount: 620},
                        {month: 'September 2025', date: 'Sep 30, 2025', amount: 585},
                        {month: 'August 2025', date: 'Aug 31, 2025', amount: 610},
                    ].map((p, idx) => (
                        <View
                            key={idx}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingVertical: 8,
                                borderBottomWidth: idx === 2 ? 0 : 1,
                                borderColor: '#e5e7eb',
                            }}
                        >
                            <View>
                                <Text style={{fontWeight: '600'}}>{p.month}</Text>
                                <Text style={{fontSize: 12, color: '#6b7280'}}>
                                    Paid on {p.date}
                                </Text>
                            </View>
                            <Text
                                style={{fontWeight: '700', color: '#16a34a', fontSize: 16}}
                            >
                                ${p.amount}
                            </Text>
                        </View>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

function Row({label, value, valueColor = '#111827'}) {
    return (
        <View
            style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 4,
            }}
        >
            <Text style={{color: '#4b5563'}}>{label}</Text>
            <Text style={{fontWeight: '600', color: valueColor}}>{value}</Text>
        </View>
    );
}

function Metric({label, valueText, percent, barColor}) {
    return (
        <View style={{marginBottom: 10}}>
            <View
                style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginBottom: 4,
                }}
            >
                <Text style={{color: '#374151', fontSize: 13}}>{label}</Text>
                <Text style={{fontWeight: '600', fontSize: 13}}>{valueText}</Text>
            </View>
            <View
                style={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: '#e5e7eb',
                    overflow: 'hidden',
                }}
            >
                <View
                    style={{
                        width: `${percent}%`,
                        height: '100%',
                        backgroundColor: barColor,
                    }}
                />
            </View>
            <Text style={{fontSize: 11, color: '#6b7280', marginTop: 2}}>
                {percent}% completed
            </Text>
        </View>
    );
}
