import { get, ref, set } from 'firebase/database';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { addRecentPatient } from '../recPatients';
import { db } from './firebaseConfig';
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
  return Object.entries(weightData || {})
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

function getWeightQuartile(
  ageMonths: number,
  weight: number,
  percentiles: typeof boysPercentiles,
  t: any
): string {
  function getPercVal(p: keyof typeof percentiles) {
    const arr = percentiles[p];
    const pt = arr.find(pt => pt.ageMonths === ageMonths);
    return pt ? pt.weight : null;
  }
  const p3 = getPercVal('p3');
  const p15 = getPercVal('p15');
  const p50 = getPercVal('p50');
  const p85 = getPercVal('p85');
  const p97 = getPercVal('p97');

  if (p3 == null || p15 == null || p50 == null || p85 == null || p97 == null)
    return t('patientInfoAfter.quartile.NA');
  if (weight < p3) return t('patientInfoAfter.quartile.below3');
  if (weight < p15) return t('patientInfoAfter.quartile.3to15');
  if (weight < p50) return t('patientInfoAfter.quartile.15to50');
  if (weight < p85) return t('patientInfoAfter.quartile.50to85');
  if (weight < p97) return t('patientInfoAfter.quartile.85to97');
  return t('patientInfoAfter.quartile.above97');
}

function getGrowthAnalytics(weights: { weight: number; ageMonths: number }[], t: any) {
  const sorted = [...weights].sort((a, b) => a.ageMonths - b.ageMonths);
  const lastFour = sorted.slice(-4);
  if (lastFour.length < 2) {
    return {
      status: t('patientInfoAfter.analyticsMessages.notEnoughDataStatus'),
      description: t('patientInfoAfter.analyticsMessages.notEnoughDataDesc'),
    };
  }
  const w1 = lastFour[0].weight;
  const avg = lastFour.reduce((sum, w) => sum + w.weight, 0) / lastFour.length;
  const growthScore = avg - w1;

  if (growthScore < 0.5) {
    return {
      status: t('patientInfoAfter.analyticsMessages.veryDangerousStatus'),
      description: t('patientInfoAfter.analyticsMessages.veryDangerousDesc', { w1: w1.toFixed(2), growth: growthScore.toFixed(2) }),
    };
  } else if (growthScore >= 0.5 && growthScore < 1) {
    return {
      status: t('patientInfoAfter.analyticsMessages.dangerousStatus'),
      description: t('patientInfoAfter.analyticsMessages.dangerousDesc', { w1: w1.toFixed(2), growth: growthScore.toFixed(2) }),
    };
  } else {
    return {
      status: t('patientInfoAfter.analyticsMessages.healthyStatus'),
      description: t('patientInfoAfter.analyticsMessages.healthyDesc', { w1: w1.toFixed(2), growth: growthScore.toFixed(2) }),
    };
  }
}

const PatientInfoAfter: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { patientId, patientRecord } = route.params;
  const [weightEntries, setWeightEntries] = useState<{ date: string; weight: number; ageMonths: number }[]>([]);
  const [patientWeights, setPatientWeights] = useState<{ ageMonths: number; weight: number }[]>([]);
  const [analytics, setAnalytics] = useState<{ status: string; description: string }>({ status: '', description: '' });

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
      setAnalytics(getGrowthAnalytics(parsed, t));
    } else {
      setWeightEntries([]);
      setPatientWeights([]);
      setAnalytics({ status: '', description: '' });
    }
  }, [patientRecord.Weight, patientRecord.Date_of_Birth, t]);

  const gender = patientRecord.Gender === 'M' ? 'M' : 'F';
  const percentiles = gender === 'M' ? boysPercentiles : girlsPercentiles;

  const handleSaveAndFinish = async () => {
    try {
      const patientRef = ref(db, `patientId/${patientId}`);
      const snap = await get(patientRef);
      let dbPatient: PatientRecord = snap.exists() ? snap.val() : {};

      const mergedWeights = {
        ...(dbPatient.Weight || {}),
        ...(patientRecord.Weight || {})
      };

      const mergedPatient: PatientRecord = {
        ...dbPatient,
        ...patientRecord,
        Weight: mergedWeights
      };

      console.log("Saving patientRecord:", mergedPatient);

      await set(patientRef, mergedPatient);

      await addRecentPatient({
        patientId,
        name: `${mergedPatient.First_Name} ${mergedPatient.Last_Name}`,
        dob: mergedPatient.Date_of_Birth,
        gender: mergedPatient.Gender,
        date: new Date().toISOString(),
        village: mergedPatient.Village,
      });

      navigation.navigate('Home');
    } catch (err: any) {
      Alert.alert(
        t('patientInfoAfter.alerts.saveFailedTitle'),
        err?.message || t('patientInfoAfter.alerts.saveFailedBody')
      );
    }
  };

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

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('patientInfoAfter.analytics')}</Text>
        <Text style={[
          styles.analyticsStatus,
          analytics.status === t('patientInfoAfter.analyticsMessages.healthyStatus')
            ? { color: '#16a34a' }
            : analytics.status === t('patientInfoAfter.analyticsMessages.veryDangerousStatus')
              ? { color: '#dc2626' }
              : { color: '#f59e42' }
        ]}>
          {analytics.status}
        </Text>
        <Text style={styles.analyticsDescription}>{analytics.description}</Text>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('patientInfoAfter.recentWeightRecords')}</Text>
        {weightEntries.length === 0 ? (
          <Text style={styles.empty}>{t('patientInfoAfter.noWeightData')}</Text>
        ) : (
          weightEntries.slice(-4).map(({ date, weight, ageMonths }, idx) => (
            <View key={idx} style={styles.weightRow}>
              <Text style={styles.weightDate}>{date}</Text>
              <Text style={styles.weightValue}>{t('patientInfoAfter.weightValueKg', { weight })}</Text>
              <Text style={styles.quartileText}>
                {getWeightQuartile(ageMonths, weight, percentiles, t)}
              </Text>
            </View>
          ))
        )}
      </View>
      <TouchableOpacity
        style={styles.button}
        onPress={handleSaveAndFinish}>
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
  analyticsStatus: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 7,
    marginTop: 4,
  },
  analyticsDescription: {
    color: '#555',
    fontSize: 15,
    marginBottom: 10,
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
  quartileText: {
    color: '#888',
    fontSize: 13,
    flex: 1,
    textAlign: 'right',
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