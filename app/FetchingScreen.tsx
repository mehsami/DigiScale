  import { get, ref, set } from 'firebase/database';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
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

  type Props = {
    navigation: any;
    route: {
      params: {
        patientId: string;
        patientRecord?: PatientRecord;
        highlightWeightDate?: string;
      };
    };
  };

  const FetchingScreen: React.FC<Props> = ({ route, navigation }) => {
    const { t } = useTranslation();
    const { patientId, patientRecord, highlightWeightDate } = route.params;

    useEffect(() => {
      const run = async () => {
        try {
          const patientRef = ref(db, `patientId/${patientId}`);
          const snap = await get(patientRef);
          let freshRecord: PatientRecord;

          if (!snap.exists()) {
            if (patientRecord) {
              await set(patientRef, patientRecord);
              freshRecord = patientRecord;
            } else {
              throw new Error(t('fetching.patientNotFound'));
            }
          } else {
            freshRecord = snap.val() as PatientRecord;
          }

          if (patientRecord) {
            navigation.replace('PatientInfo', {
              patientId,
              patientRecord: freshRecord,
            });
          } else {
            navigation.replace('PatientInfoAfter', {
              patientId,
              patientRecord: freshRecord,
              highlightWeightDate: highlightWeightDate ?? undefined,
            });
          }
        } catch (err: any) {
          Alert.alert(t('fetching.errorTitle'), err.message || t('fetching.errorFallback'));
          navigation.goBack();
        }
      };
      run();
    }, [patientId, patientRecord, highlightWeightDate, navigation, t]);

    return (
      <View style={styles.outer}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color="#4f46e5" style={styles.spinner} />
          <Text style={styles.bigText}>{t('fetching.title')}</Text>
          <Text style={styles.subText}>
            {t('fetching.subText')}
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
