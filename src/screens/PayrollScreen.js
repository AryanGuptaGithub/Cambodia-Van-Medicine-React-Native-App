// src/screens/PayrollScreen.js
import React, {useContext, useMemo} from 'react';
import {FlatList, SafeAreaView, StyleSheet, Text, View} from 'react-native';
import {_AppContext} from '../context/_AppContext';
import Header from '../../components/jsfiles/Header';

export default function PayrollScreen() {
    const {salesHistory} = useContext(_AppContext);
    const BASE_SALARY = 500;

    const payroll = useMemo(() => {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const monthRecords = (salesHistory || []).filter(s => {
            const d = s.createdAt ? new Date(s.createdAt) : null;
            return d && d >= monthStart && s.type !== 'return';
        });

        const monthSales = monthRecords.reduce((sum, r) => sum + (Number(r.total) || 0), 0);
        const commission = +(monthSales * 0.02).toFixed(2);
        const bonus = monthSales >= 8000 ? 100 : 0;
        const deductions = 20;
        const expected = +(BASE_SALARY + commission + bonus - deductions).toFixed(2);

        return {monthSales, commission, bonus, deductions, expected};
    }, [salesHistory]);

    const paymentHistory = (salesHistory || []).slice(0, 5).map(s => ({
        id: s.id || String(Math.random()),
        date: s.createdAt ? new Date(s.createdAt).toLocaleString() : '—',
        amount: Number(s.total) || 0
    }));

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Payroll & Incentives"/>
            <View style={styles.boxContainer}>
                <Box label="Base Salary" value={`$${BASE_SALARY.toFixed(2)}`} bg="#FEF3C7"/>
                <Box label="Commission" value={`+$${payroll.commission}`} bg="#DCFCE7" color="#059669"/>
                <Box label="Bonus" value={`+$${payroll.bonus}`} bg="#FCE7F3" color="#059669"/>
                <Box label="Deductions" value={`-$${payroll.deductions}`} bg="#FEE2E2" color="#B91C1C"/>
            </View>

            <View style={styles.summaryCard}>
                <Text style={styles.summaryLabel}>Monthly Sales</Text>
                <Text style={styles.summaryValue}>${payroll.monthSales.toFixed(2)}</Text>

                <View style={styles.totalRow}>
                    <Text style={{fontWeight: '700'}}>Total Expected</Text>
                    <Text style={{fontWeight: '700', fontSize: 20}}>${payroll.expected}</Text>
                </View>
            </View>

            <View style={{paddingHorizontal: 12, marginTop: 8}}>
                <Text style={{fontWeight: '700', marginBottom: 8}}>Recent Records</Text>
                <FlatList
                    data={paymentHistory}
                    keyExtractor={i => i.id}
                    renderItem={({item}) => (
                        <View style={styles.payRow}>
                            <View>
                                <Text style={{fontWeight: '700'}}>{item.date}</Text>
                                <Text style={{color: '#6b7280', fontSize: 12}}>Sales Record</Text>
                            </View>
                            <Text style={{fontWeight: '700', color: '#059669'}}>${item.amount.toFixed(2)}</Text>
                        </View>
                    )}
                    ListEmptyComponent={<Text>No payroll records yet</Text>}
                />
            </View>
        </SafeAreaView>
    );
}

function Box({label, value, bg, color = '#111'}) {
    return (
        <View style={[styles.box, {backgroundColor: bg}]}>
            <Text style={styles.boxLabel}>{label}</Text>
            <Text style={[styles.boxValue, {color}]}>{value}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f8fafc'},
    boxContainer: {flexDirection: 'row', flexWrap: 'wrap', padding: 12, justifyContent: 'space-between'},
    box: {width: '48%', padding: 12, borderRadius: 10, marginBottom: 10},
    boxLabel: {fontSize: 12, color: '#6b7280'},
    boxValue: {fontSize: 18, fontWeight: '700', marginTop: 6},
    summaryCard: {backgroundColor: '#fff', margin: 12, borderRadius: 10, padding: 12},
    summaryLabel: {color: '#6b7280', marginBottom: 6},
    summaryValue: {fontSize: 20, fontWeight: '700', marginBottom: 8},
    totalRow: {flexDirection: 'row', justifyContent: 'space-between', marginTop: 8},
    payRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb'
    }
});
