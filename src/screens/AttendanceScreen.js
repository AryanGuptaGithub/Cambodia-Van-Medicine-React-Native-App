// src/screens/AttendanceScreen.js
import React, {useState} from 'react';
import {Text, TouchableOpacity, View} from 'react-native';
import {SafeAreaView} from 'react-native-safe-area-context';
import Header from '../../components/jsfiles/Header';

export default function AttendanceScreen({navigation}) {
    const [checkedInTime, setCheckedInTime] = useState(null);

    const onCheckIn = () => {
        const now = new Date();
        setCheckedInTime(now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'}));
    };

    const todayStr = new Date().toDateString();

    // Demo data
    const summary = {
        present: 18,
        absent: 1,
        leave: 2,
    };

    const recentAttendance = [
        {date: 'Nov 16, 2025', status: 'Present', time: '08:25 AM', checkout: '05:30 PM'},
        {date: 'Nov 15, 2025', status: 'Present', time: '08:30 AM', checkout: '05:40 PM'},
        {date: 'Nov 14, 2025', status: 'Leave', time: '-', checkout: '-'},
        {date: 'Nov 13, 2025', status: 'Present', time: '08:20 AM', checkout: '05:25 PM'},
    ];

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: '#eff6ff'}}>
            <Header
                title="Attendance & Leaves"
                onBack={() => navigation.goBack()}
                backgroundColor="#2563eb"
            />

            <View style={{flex: 1, padding: 12}}>
                {/* Today Check-in Card */}
                {/*<View*/}
                {/*    style={{*/}
                {/*        backgroundColor: '#e0f2fe',*/}
                {/*        borderRadius: 12,*/}
                {/*        padding: 16,*/}
                {/*        marginBottom: 12,*/}
                {/*    }}*/}
                {/*>*/}
                {/*    <Text*/}
                {/*        style={{*/}
                {/*            textAlign: 'center',*/}
                {/*            fontWeight: '700',*/}
                {/*            color: '#0f172a',*/}
                {/*            marginBottom: 6,*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        Today's Check-in*/}
                {/*    </Text>*/}
                {/*    <Text*/}
                {/*        style={{*/}
                {/*            textAlign: 'center',*/}
                {/*            color: '#64748b',*/}
                {/*            marginBottom: 10,*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        {todayStr}*/}
                {/*    </Text>*/}
                {/*    <Text*/}
                {/*        style={{*/}
                {/*            textAlign: 'center',*/}
                {/*            fontSize: 32,*/}
                {/*            fontWeight: '700',*/}
                {/*            color: '#1d4ed8',*/}
                {/*            marginBottom: 12,*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        {checkedInTime || '-- : --'}*/}
                {/*    </Text>*/}
                {/*    <TouchableOpacity*/}
                {/*        onPress={onCheckIn}*/}
                {/*        style={{*/}
                {/*            alignSelf: 'center',*/}
                {/*            backgroundColor: '#16a34a',*/}
                {/*            paddingVertical: 10,*/}
                {/*            paddingHorizontal: 24,*/}
                {/*            borderRadius: 999,*/}
                {/*        }}*/}
                {/*    >*/}
                {/*        <Text style={{color: '#fff', fontWeight: '700'}}>*/}
                {/*            {checkedInTime ? 'Checked In' : 'Check In Now'}*/}
                {/*        </Text>*/}
                {/*    </TouchableOpacity>*/}
                {/*</View>*/}

                {/* Summary */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 12,
                    }}
                >
                    <Text style={{fontWeight: '700', marginBottom: 8}}>
                        This Month Summary (Demo)
                    </Text>
                    <View
                        style={{
                            flexDirection: 'row',
                            justifyContent: 'space-between',
                            gap: 8,
                        }}
                    >
                        <SummaryBox label="Present" value={summary.present} color="#16a34a" bg="#dcfce7"/>
                        <SummaryBox label="Absent" value={summary.absent} color="#b91c1c" bg="#fee2e2"/>
                        <SummaryBox label="Leave" value={summary.leave} color="#1d4ed8" bg="#dbeafe"/>
                    </View>
                </View>

                {/* Button (placeholder) */}
                <TouchableOpacity
                    style={{
                        backgroundColor: '#2563eb',
                        padding: 12,
                        borderRadius: 12,
                        alignItems: 'center',
                        marginBottom: 12,
                    }}
                >
                    <Text style={{color: '#fff', fontWeight: '700'}}>
                        Request Leave / Holiday (Demo)
                    </Text>
                </TouchableOpacity>

                {/* Recent Attendance */}
                <View
                    style={{
                        backgroundColor: '#fff',
                        borderRadius: 12,
                        padding: 12,
                    }}
                >
                    <Text style={{fontWeight: '700', marginBottom: 8}}>
                        Recent Attendance (Demo)
                    </Text>

                    {recentAttendance.map((rec, idx) => (
                        <View
                            key={idx}
                            style={{
                                flexDirection: 'row',
                                justifyContent: 'space-between',
                                paddingVertical: 8,
                                paddingHorizontal: 6,
                                borderRadius: 8,
                                backgroundColor: '#f9fafb',
                                marginBottom: 6,
                            }}
                        >
                            <View style={{flex: 1, paddingRight: 8}}>
                                <Text style={{fontWeight: '600', color: '#111827'}}>{rec.date}</Text>
                                <Text style={{fontSize: 12, color: '#6b7280'}}>
                                    {rec.time !== '-'
                                        ? `${rec.time} - ${rec.checkout}`
                                        : 'No attendance'}
                                </Text>
                            </View>
                            <StatusChip status={rec.status}/>
                        </View>
                    ))}
                </View>
            </View>
        </SafeAreaView>
    );
}

function SummaryBox({label, value, color, bg}) {
    return (
        <View
            style={{
                flex: 1,
                backgroundColor: bg,
                borderRadius: 10,
                paddingVertical: 10,
                paddingHorizontal: 6,
                alignItems: 'center',
            }}
        >
            <Text style={{fontSize: 22, fontWeight: '700', color}}>{value}</Text>
            <Text style={{fontSize: 11, color: '#4b5563', marginTop: 2}}>
                {label}
            </Text>
        </View>
    );
}

function StatusChip({status}) {
    let bg = '#e5e7eb';
    let color = '#374151';

    if (status === 'Present') {
        bg = '#dcfce7';
        color = '#166534';
    } else if (status === 'Leave') {
        bg = '#dbeafe';
        color = '#1d4ed8';
    } else if (status === 'Absent') {
        bg = '#fee2e2';
        color = '#b91c1c';
    }

    return (
        <View
            style={{
                alignSelf: 'center',
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 999,
                backgroundColor: bg,
            }}
        >
            <Text style={{fontSize: 11, fontWeight: '600', color}}>{status}</Text>
        </View>
    );
}
