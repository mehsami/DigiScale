import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getRecentPatients, RecentPatient } from '../recPatients';

type Props = {
  navigation: any;
};

const RecentPatientsScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [patients, setPatients] = useState<RecentPatient[]>([]);

  useEffect(() => {
    const fetchPatients = async () => {
      setPatients(await getRecentPatients());
    };
    const unsub = navigation.addListener('focus', fetchPatients);
    fetchPatients();
    return unsub;
  }, [navigation]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('recentPatientsScreen.title')}</Text>
      {patients.length === 0 ? (
        <Text style={styles.empty}>{t('recentPatientsScreen.empty')}</Text>
      ) : (
        patients.map((p) => (
          <TouchableOpacity
            key={p.patientId}
            style={styles.patientCard}
            onPress={() =>
              navigation.navigate('Home', {
                screen: 'Fetching',
                params: { patientId: p.patientId }
              })
            }
            activeOpacity={0.8}
          >
            <View>
              <Text style={styles.name}>{p.name}</Text>
              <Text style={styles.row}>DOB: {p.dob}</Text>
              <Text style={styles.row}>Gender: {p.gender || '-'}</Text>
              <Text style={styles.row}>Village: {p.village || '-'}</Text>
              <Text style={styles.date}>Saved: {p.date ? p.date.slice(0, 10) : '-'}</Text>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={24} color="#bbb" />
          </TouchableOpacity>
        ))
      )}
      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>{t('recentPatientsScreen.back')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 18, backgroundColor: '#f5f6fa', minHeight: '100%' },
  title: { fontSize: 21, fontWeight: 'bold', marginBottom: 15, color: '#1a2342' },
  patientCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  name: { fontWeight: 'bold', fontSize: 17, marginBottom: 4 },
  row: { fontSize: 14, color: '#444' },
  date: { fontSize: 13, color: '#888', marginTop: 3 },
  empty: { color: '#7a808a', fontStyle: 'italic', marginVertical: 16 },
  button: { backgroundColor: '#2563eb', borderRadius: 8, paddingVertical: 14, alignItems: 'center', marginTop: 16 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 17 },
});

export default RecentPatientsScreen;
