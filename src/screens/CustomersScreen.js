// src/screens/CustomersScreen.js
import React, {useContext} from 'react';
import {FlatList, Text, View} from 'react-native';
import {_AppContext} from '../context/_AppContext';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/jsfiles/Header';

export default function CustomersScreen({navigation}) {
    const {customers} = useContext(_AppContext);

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#f8fafc'}}>
            <Header
                title="Customers"
                onBack={() => navigation.goBack()}
                onAdd={() => navigation.navigate('AddCustomer')}
            />

            <FlatList
                data={customers}
                keyExtractor={i => String(i.id)}
                contentContainerStyle={{padding: 12}}
                renderItem={({item}) => (
                    <View style={{backgroundColor: '#fff', padding: 12, borderRadius: 10, marginBottom: 10}}>
                        <Text style={{fontWeight: '700'}}>{item.name}</Text>
                        <Text style={{color: '#6b7280'}}>{item.agent} • {item.zone} • {item.province}</Text>
                        <Text style={{marginTop: 8, fontWeight: '700', color: '#b91c1c'}}>
                            Outstanding: ${item.outstanding}
                        </Text>
                    </View>
                )}
                ListEmptyComponent={<Text style={{padding: 12}}>No customers yet</Text>}
            />
        </SafeAreaView>
    );
}
