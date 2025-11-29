// src/screens/PayrollScreen.js
import React, {useContext, useMemo} from 'react';
import {ScrollView, Text, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/jsfiles/Header';
import {_AppContext} from "../context/_AppContext";

export default function PayrollScreen({navigation}) {
    const {user, salesHistory, customers} = useContext(_AppContext);

    // Example static configuration (can be dynamic from backend/user profile)
    const baseSalary = 500;
    const deductions = 20;
    const salesTarget = 8000; // Example monthly target
    const commissionRate = 0.02; // 2% commission
    const bonusThreshold = 5000; // Sales required to get bonus
    const bonusAmount = 50; // Bonus value

    // Compute dynamic payroll data
    const {totalSales, commission, bonus, totalExpected, customerVisits} = useMemo(() => {
        const userSales = salesHistory.filter(sale => String(sale.mrId) === String(user?.id));
        const totalSalesAmount = userSales.reduce((acc, s) => acc + (s.totalAmount || 0), 0);
        const commissionCalc = totalSalesAmount * commissionRate;
        const bonusCalc = totalSalesAmount >= bonusThreshold ? bonusAmount : 0;

        // Count unique customer visits this month
        const uniqueCustomerVisits = new Set(
            userSales.map(sale => String(sale.customerId))
        ).size;

        const total = baseSalary + commissionCalc + bonusCalc - deductions;

        return {
            totalSales: totalSalesAmount,
            commission: commissionCalc,
            bonus: bonusCalc,
            totalExpected: total,
            customerVisits: uniqueCustomerVisits,
        };
    }, [salesHistory, user]);

    // Prepare recent payments (sales)
    const recentSales = useMemo(() => {
        return salesHistory
            .filter(sale => String(sale.mrId) === String(user?.id))
            .sort((a, b) => new Date(b.invoiceDate) - new Date(a.invoiceDate))
            .slice(0, 5);
    }, [salesHistory, user]);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#fffbeb'}}>
            <Header
                title="Payroll & Incentives"
                onBack={() => navigation.goBack()}
                backgroundColor="#f59e0b"
            />
            <ScrollView style={{flex: 1, padding: 12}}>
                {/* Payroll Summary */}
                <View style={{
                    backgroundColor: '#fef3c7',
                    borderRadius: 12,
                    padding: 12,
                    marginBottom: 12,
                    borderWidth: 1,
                    borderColor: '#facc15'
                }}>
                    <Text style={{fontWeight: '700', marginBottom: 8}}>This Month</Text>
                    <Row label="Base Salary" value={`$${baseSalary.toFixed(2)}`}/>
                    <Row label="Sales Commission" value={`$${commission.toFixed(2)}`} valueColor="#16a34a"/>
                    <Row label="Bonuses" value={`$${bonus.toFixed(2)}`} valueColor="#16a34a"/>
                    <Row label="Deductions" value={`-$${deductions.toFixed(2)}`} valueColor="#b91c1c"/>

                    <View style={{
                        marginTop: 10,
                        paddingVertical: 10,
                        paddingHorizontal: 12,
                        borderRadius: 10,
                        backgroundColor: '#16a34a',
                        flexDirection: 'row',
                        justifyContent: 'space-between'
                    }}>
                        <Text style={{color: '#fff', fontWeight: '700'}}>Total Expected</Text>
                        <Text style={{color: '#fff', fontWeight: '700', fontSize: 18}}>
                            ${totalExpected.toFixed(2)}
                        </Text>
                    </View>
                </View>

                {/* Performance Metrics */}
                <View style={{backgroundColor: '#fff', borderRadius: 12, padding: 12, marginBottom: 12}}>
                    <Text style={{fontWeight: '700', marginBottom: 8}}>Performance Metrics</Text>

                    <Metric
                        label="Sales Achieved"
                        valueText={`$${totalSales.toFixed(2)} / $${salesTarget}`}
                        percent={Math.min(100, (totalSales / salesTarget) * 100)}
                        barColor="#16a34a"
                    />

                    <Metric
                        label="Customer Visits"
                        valueText={`${customerVisits} / ${customers.length}`}
                        percent={customers.length ? Math.min(100, (customerVisits / customers.length) * 100) : 0}
                        barColor="#2563eb"
                    />

                    <Metric
                        label="Commission Earned"
                        valueText={`$${commission.toFixed(2)}`}
                        percent={Math.min(100, (commission / (salesTarget * commissionRate)) * 100)}
                        barColor="#f59e0b"
                    />
                </View>

                {/* Recent Sales / Payments */}
                <View style={{backgroundColor: '#fff', borderRadius: 12, padding: 12}}>
                    <Text style={{fontWeight: '700', marginBottom: 8}}>Recent Sales</Text>

                    {recentSales.map((sale, idx) => (
                        <View key={idx} style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            paddingVertical: 8,
                            borderBottomWidth: idx === recentSales.length - 1 ? 0 : 1,
                            borderColor: '#e5e7eb'
                        }}>
                            <View>
                                <Text style={{fontWeight: '600'}}>{sale.customerName}</Text>
                                <Text style={{fontSize: 12, color: '#6b7280'}}>
                                    {new Date(sale.invoiceDate).toLocaleDateString()}
                                </Text>
                            </View>
                            <Text style={{fontWeight: '700', color: '#16a34a', fontSize: 16}}>
                                ${sale.totalAmount.toFixed(2)}
                            </Text>
                        </View>
                    ))}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

// Row component for payroll items
function Row({label, value, valueColor = '#111827'}) {
    return (
        <View style={{flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4}}>
            <Text style={{color: '#4b5563'}}>{label}</Text>
            <Text style={{fontWeight: '600', color: valueColor}}>{value}</Text>
        </View>
    );
}

// Metric component for progress bars
function Metric({label, valueText, percent, barColor}) {
    return (
        <View style={{marginBottom: 10}}>
            <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4}}>
                <Text style={{color: '#374151', fontSize: 13}}>{label}</Text>
                <Text style={{fontWeight: '600', fontSize: 13}}>{valueText}</Text>
            </View>
            <View style={{height: 8, borderRadius: 999, backgroundColor: '#e5e7eb', overflow: 'hidden'}}>
                <View style={{width: `${percent.toFixed(0)}%`, height: '100%', backgroundColor: barColor}}/>
            </View>
            <Text style={{fontSize: 11, color: '#6b7280', marginTop: 2}}>{percent.toFixed(0)}% completed</Text>
        </View>
    );
}
