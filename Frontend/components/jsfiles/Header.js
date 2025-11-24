// components/Header.js
import React from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {StatusBar} from 'expo-status-bar';

export default function Header({
                                   title,
                                   onBack,
                                   onAdd,
                                   backLabel = 'Back',
                                   addLabel = 'Add',
                                   backgroundColor = '#2563eb'
                               }) {
    const insets = useSafeAreaInsets();

    return (
        <>
            <StatusBar style="light"/>
            <View
                style={{
                    paddingTop: insets.top + 12,
                    paddingBottom: 12,
                    paddingHorizontal: 16,
                    backgroundColor,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                }}
            >
                <TouchableOpacity onPress={onBack}>
                    <Text style={{
                        textAlign: 'center',

                        borderRadius: 10,
                        padding: 6,
                        width: 60,
                        color: 'blue',
                        backgroundColor: 'white'
                    }}>
                        {backLabel}
                    </Text>
                </TouchableOpacity>

                <Text style={{color: '#fff', fontWeight: '700', fontSize: 18}}>{title}</Text>

                {onAdd ? (
                    <TouchableOpacity onPress={onAdd}>
                        <Text style={{
                            textAlign: 'center',
                          
                            borderRadius: 10,
                            padding: 6,
                            width: 60,
                            color: 'blue',
                            backgroundColor: 'white'
                        }}>
                            {addLabel}
                        </Text>
                    </TouchableOpacity>
                ) : (
                    <View style={{width: 60}}/>
                )}
            </View>
        </>
    );
}
