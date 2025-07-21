import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Graph, { boysPercentiles, girlsPercentiles } from './Graph';

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
  route: {
    params: {
      patientId: string;
      patientRecord: PatientRecord;
    };
  };
  navigation: any;
};

const parseDOB = (dobStr: string): Date | null => {
  if (dobStr.length !== 8) return null;
  const mm = parseInt(dobStr.slice(0, 2), 10);
  const dd = parseInt(dobStr.slice(2, 4), 10);
  const yyyy = parseInt(dobStr.slice(4), 10);
  if (!mm || !dd || !yyyy) return null;
  return new Date(yyyy, mm - 1, dd);
};
const calculateAgeMonths = (dob: Date, weightDate: Date): number => {
  let months = (weightDate.getFullYear() - dob.getFullYear()) * 12;
  months += weightDate.getMonth() - dob.getMonth();
  if (weightDate.getDate() < dob.getDate()) months -= 1;
  return months >= 0 ? months : 0;
};
const parseWeightData = (weightData: WeightData, dob: Date | null) => {
  if (!dob) return [];
  return Object.entries(weightData)
    .map(([dateStr, weight]) => {
      if (dateStr.length !== 8) return null;
      const mm = parseInt(dateStr.slice(0, 2), 10);
      const dd = parseInt(dateStr.slice(2, 4), 10);
      const yyyy = parseInt(dateStr.slice(4), 10);
      if (!mm || !dd || !yyyy) return null;
      const weightDate = new Date(yyyy, mm - 1, dd);
      const ageMonths = calculateAgeMonths(dob, weightDate);
      return ageMonths >= 0 ? { ageMonths, weight, date: dateStr } : null;
    })
    .filter((v): v is { ageMonths: number; weight: number; date: string } => v !== null)
    .sort((a, b) => a.ageMonths - b.ageMonths);
};
const formatDateKey = (key: string): string => {
  if (key.length !== 8) return key;
  const mm = key.slice(0, 2);
  const dd = key.slice(2, 4);
  const yyyy = key.slice(4);
  return `${mm}/${dd}/${yyyy}`;
};

const PatientInfoAfter: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { patientId, patientRecord } = route.params;
  const [weightEntries, setWeightEntries] = useState<{ date: string; weight: number; ageMonths: number }[]>([]);
  const [patientWeights, setPatientWeights] = useState<{ ageMonths: number; weight: number }[]>([]);

  useEffect(() => {
    const dob = parseDOB(patientRecord.Date_of_Birth);
    if (patientRecord.Weight && dob) {
      const parsed = parseWeightData(patientRecord.Weight, dob);
      setWeightEntries(
        parsed.map(({ date, weight, ageMonths }) => ({
          date: formatDateKey(date),
          weight,
          ageMonths,
        })).sort((a, b) => a.ageMonths - b.ageMonths)
      );
      setPatientWeights(parsed.map(({ ageMonths, weight }) => ({ ageMonths, weight })));
    } else {
      setWeightEntries([]);
      setPatientWeights([]);
    }
  }, [patientRecord.Weight, patientRecord.Date_of_Birth]);

  const gender = patientRecord.Gender === 'M' ? 'M' : 'F';
  const percentiles = gender === 'M' ? boysPercentiles : girlsPercentiles;

  const windowWidth = Dimensions.get('window').width;
  const CARD_HORIZONTAL_PADDING = 22;
  const SCREEN_HORIZONTAL_PADDING = 16;
  const GRAPH_WIDTH = windowWidth - 2 * SCREEN_HORIZONTAL_PADDING - 2 * CARD_HORIZONTAL_PADDING + 60;
  const GRAPH_HEIGHT = 450;

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('patientInfoAfter.title')}</Text>
        <DetailRow label={t('patientInfoAfter.patientId')} value={patientId} />
        <DetailRow label={t('patientInfoAfter.firstName')} value={patientRecord.First_Name} />
        <DetailRow label={t('patientInfoAfter.lastName')} value={patientRecord.Last_Name} />
        <DetailRow label={t('patientInfoAfter.dateOfBirth')} value={patientRecord.Date_of_Birth} />
        <DetailRow label={t('patientInfoAfter.village')} value={patientRecord.Village || '-'} />
        <DetailRow label={t('patientInfoAfter.gender')} value={patientRecord.Gender || '-'} />
        <DetailRow label={t('patientInfoAfter.phoneNumber')} value={patientRecord.Phone_Number?.toString() || '-'} />
      </View>

      <View style={styles.chartCard}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>{t('patientInfoAfter.growthChart')}</Text>
        </View>
        <Graph
          patientWeights={patientWeights}
          gender={gender}
          boysPercentiles={boysPercentiles}
          girlsPercentiles={girlsPercentiles}
          width={GRAPH_WIDTH}
          height={GRAPH_HEIGHT}
        />
      </View>

      {/* If you want analytics and recent weights, include similar sections as in your old screen, but use: */}
      {/* t('patientInfoAfter.analytics') and t('patientInfoAfter.recentWeightRecords') */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('patientInfoAfter.recentWeightRecords')}</Text>
        {weightEntries.length === 0 ? (
          <Text style={styles.empty}>{t('patientInfoAfter.noWeightData')}</Text>
        ) : (
          weightEntries.slice(-4).map(({ date, weight }, idx) => (
            <View key={idx} style={styles.weightRow}>
              <Text style={styles.weightDate}>{date}</Text>
              <Text style={styles.weightValue}>{weight} kg</Text>
              {/* Quartile and analytics could be added here if needed, use same nested keys */}
            </View>
          ))
        )}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={() => navigation.navigate('Home')}>
        <Text style={styles.buttonText}>{t('patientInfoAfter.saveAndFinish')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <View style={styles.detailRow}>
    <Text style={styles.detailLabel}>{label}</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#f5f6fa',
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 22,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  chartCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 2,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  sectionTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 18,
    color: '#222',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 9,
  },
  detailLabel: {
    fontWeight: '500',
    color: '#555',
    fontSize: 15,
    flex: 1,
  },
  detailValue: {
    color: '#232323',
    fontWeight: '600',
    fontSize: 15,
    flex: 1,
    textAlign: 'right',
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingVertical: 7,
    gap: 8,
  },
  weightDate: {
    color: '#2563eb',
    fontSize: 15,
    flex: 1,
  },
  weightValue: {
    color: '#444',
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  empty: {
    color: '#868d96',
    fontStyle: 'italic',
    marginVertical: 10,
  },
  button: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});

export default PatientInfoAfter;
