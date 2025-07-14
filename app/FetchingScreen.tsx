import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { get, ref, set } from 'firebase/database';
import React, { useEffect } from 'react';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { db } from './firebaseConfig';

type WeightData = Record<string, number>;

type PatientRecord = {
  Date_of_Birth: string;
  First_Name: string;
  Last_Name: string;
  Gender?: string;
  Village?: string;
  Phone_Number?: number;
  Weight?: WeightData;
};

type RootStackParamList = {
  Fetching: { patientId: string; patientRecord: PatientRecord };
  PatientInfo: { patientId: string; patientRecord: PatientRecord };
  Weighing: { patientId: string; patientRecord: PatientRecord };
};

type Props = NativeStackScreenProps<RootStackParamList, 'Fetching'>;

const FetchingScreen: React.FC<Props> = ({ route, navigation }) => {
  const { patientId, patientRecord } = route.params;

  useEffect(() => {
    const run = async () => {
      try {
        const patientRef = ref(db, `patientId/${patientId}`);
        const snap = await get(patientRef);
        let freshRecord: PatientRecord;

        if (!snap.exists()) {
          await set(patientRef, patientRecord);
          freshRecord = patientRecord;
        } else {
          freshRecord = snap.val() as PatientRecord;
        }

        navigation.replace('PatientInfo', { patientId, patientRecord: freshRecord });
      } catch (err: any) {
        Alert.alert('Error', err.message || 'Failed during fetch/create');
        navigation.goBack();
      }
    };
    run();
  }, [patientId, patientRecord, navigation]);

  return (
    <View style={styles.outer}>
      <View style={styles.card}>
        <ActivityIndicator size="large" color="#4f46e5" style={styles.spinner} />
        <Text style={styles.bigText}>Fetching Patient Data!!!…</Text>
        <Text style={styles.subText}>
          Please wait while we check records for
          <Text style={styles.boldText}> {patientId}</Text>
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    flex: 1,
    backgroundColor: '#eef2ff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    paddingVertical: 36,
    paddingHorizontal: 32,
    alignItems: 'center',
    shadowColor: '#1e40af',
    shadowOpacity: 0.09,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
    minWidth: 260,
    maxWidth: 340,
  },
  spinner: {
    marginBottom: 22,
  },
  bigText: {
    fontSize: 20,
    fontWeight: '700',
    color: '#3730a3',
    marginBottom: 8,
    letterSpacing: 0.2,
  },
  subText: {
    fontSize: 15,
    color: '#6366f1',
    textAlign: 'center',
    marginTop: 3,
  },
  boldText: {
    fontWeight: 'bold',
    color: '#312e81',
  },
});

export default FetchingScreen;
