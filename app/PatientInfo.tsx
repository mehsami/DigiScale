import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Alert,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { TextInputMask } from 'react-native-masked-text';
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

const formatDateForInput = (key: string) => {
  if (key.length !== 8) return key;
  return `${key.slice(2,4)}/${key.slice(0,2)}/${key.slice(4)}`;
};

const formatDateForStorage = (val: string) => {
  const [dd, mm, yyyy] = val.split('/');
  return `${mm}${dd}${yyyy}`;
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
      return ageMonths >= 0 ? { ageMonths, weight } : null;
    })
    .filter((v): v is { ageMonths: number; weight: number } => v !== null)
    .sort((a, b) => a.ageMonths - b.ageMonths);
};

const PatientInfo: React.FC<Props> = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { patientId, patientRecord } = route.params;
  const [editMode, setEditMode] = useState(false);

  // State for each field
  const [firstName, setFirstName] = useState(patientRecord.First_Name);
  const [lastName, setLastName] = useState(patientRecord.Last_Name);
  const [village, setVillage] = useState(patientRecord.Village || '');
  const [dob, setDob] = useState(() => {
    const d = patientRecord.Date_of_Birth;
    if (d.length === 8) return `${d.slice(2,4)}/${d.slice(0,2)}/${d.slice(4)}`;
    return '';
  });
  const [gender, setGender] = useState(patientRecord.Gender || '');
  const [weights, setWeights] = useState(() => {
    if (!patientRecord.Weight) return [];
    return Object.entries(patientRecord.Weight)
      .map(([date, weight]) => ({
        date: formatDateForInput(date),
        value: weight.toString(),
      }));
  });

  // For new weight entry
  const [newWeightDate, setNewWeightDate] = useState('');
  const [newWeightValue, setNewWeightValue] = useState('');

  // For graph
  const [patientWeights, setPatientWeights] = useState<{ ageMonths: number; weight: number }[]>([]);
  useEffect(() => {
    const dobForGraph = parseDOB(formatDateForStorage(dob));
    let weightsForGraph: WeightData = {};
    weights.forEach(w => {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(w.date) && w.value && !isNaN(Number(w.value))) {
        weightsForGraph[formatDateForStorage(w.date)] = Number(w.value);
      }
    });
    setPatientWeights(parseWeightData(weightsForGraph, dobForGraph));
  }, [weights, dob]);

  // Graph dimensions
  const windowWidth = Dimensions.get('window').width;
  const CARD_HORIZONTAL_PADDING = 22;
  const SCREEN_HORIZONTAL_PADDING = 16;
  const GRAPH_WIDTH = windowWidth - 2 * SCREEN_HORIZONTAL_PADDING - 2 * CARD_HORIZONTAL_PADDING + 60;
  const GRAPH_HEIGHT = 450;
  const genderForGraph = gender === 'M' ? 'M' : 'F';

  // Weight editing handlers
  const updateWeight = (idx: number, field: 'date' | 'value', val: string) => {
    setWeights(w =>
      w.map((entry, i) =>
        i === idx ? { ...entry, [field]: val } : entry
      )
    );
  };

  const removeWeight = (idx: number) => {
    setWeights(w => w.filter((_, i) => i !== idx));
  };

  const addWeight = () => {
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(newWeightDate) || !newWeightValue || isNaN(Number(newWeightValue))) {
      Alert.alert(t('patientInfo.weightErrorTitle'), t('patientInfo.weightErrorMessage'));
      return;
    }
    if (weights.some(w => w.date === newWeightDate)) {
      Alert.alert(t('patientInfo.duplicateWeightTitle'), t('patientInfo.duplicateWeightMessage'));
      return;
    }
    setWeights(w => [...w, { date: newWeightDate, value: newWeightValue }]);
    setNewWeightDate('');
    setNewWeightValue('');
  };

  // Validation: All fields except weight must be filled and valid
  const isPatientInfoValid = () =>
    firstName.trim().length > 0 &&
    lastName.trim().length > 0 &&
    village.trim().length > 0 &&
    gender.trim().length > 0 &&
    /^\d{2}\/\d{2}\/\d{4}$/.test(dob);

  // Save and continue handler (updates AsyncStorage too!)
  const handleSave = async () => {
    if (!isPatientInfoValid()) {
      Alert.alert(t('patientInfo.errorTitle'), t('patientInfo.errorMessage'));
      return;
    }

    let newWeights: WeightData = {};
    weights.forEach(w => {
      if (/^\d{2}\/\d{2}\/\d{4}$/.test(w.date) && w.value && !isNaN(Number(w.value))) {
        newWeights[formatDateForStorage(w.date)] = Number(w.value);
      }
    });

    const updatedRecord: PatientRecord = {
      ...patientRecord,
      First_Name: firstName,
      Last_Name: lastName,
      Village: village,
      Date_of_Birth: formatDateForStorage(dob),
      Gender: gender,
      Weight: newWeights,
    };

    // Save to AsyncStorage (so recentPatients works)
    try {
      const stored = await AsyncStorage.getItem('patients');
      let patients = stored ? JSON.parse(stored) : [];
      const idx = patients.findIndex((p: any) => p.patientId === patientId);
      if (idx >= 0) {
        patients[idx] = { ...patients[idx], ...updatedRecord };
      } else {
        patients.unshift({ patientId, ...updatedRecord });
      }
      await AsyncStorage.setItem('patients', JSON.stringify(patients));
    } catch (e) {
      Alert.alert('Storage Error', 'Could not update patient record!');
      return;
    }

    navigation.replace('Weighing', { patientId, patientRecord: updatedRecord });
  };

  const handleContinue = () => {
    navigation.replace('Weighing', { patientId, patientRecord });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('patientInfo.title')}</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('patientInfo.patientId')}</Text>
          {editMode ? (
            <Text style={styles.detailValue}>{patientId}</Text>
          ) : (
            <Text style={styles.detailValue}>{patientId}</Text>
          )}
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('patientInfo.firstName')}</Text>
          {editMode ?
            <TextInput
              value={firstName}
              onChangeText={setFirstName}
              style={styles.input}
              placeholder={t('patientInfo.firstNamePlaceholder')}
            /> :
            <Text style={styles.detailValue}>{firstName}</Text>
          }
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('patientInfo.lastName')}</Text>
          {editMode ?
            <TextInput
              value={lastName}
              onChangeText={setLastName}
              style={styles.input}
              placeholder={t('patientInfo.lastNamePlaceholder')}
            /> :
            <Text style={styles.detailValue}>{lastName}</Text>
          }
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('patientInfo.dateOfBirth')}</Text>
          {editMode ?
            <TextInputMask
              type={'datetime'}
              options={{ format: 'DD/MM/YYYY' }}
              value={dob}
              onChangeText={setDob}
              style={styles.input}
              placeholder={t('patientInfo.dobPlaceholder')}
              maxLength={10}
            /> :
            <Text style={styles.detailValue}>{dob}</Text>
          }
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('patientInfo.village')}</Text>
          {editMode ?
            <TextInput
              value={village}
              onChangeText={setVillage}
              style={styles.input}
              placeholder={t('patientInfo.villagePlaceholder')}
            /> :
            <Text style={styles.detailValue}>{village}</Text>
          }
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailLabel}>{t('patientInfo.gender')}</Text>
          {editMode ?
            <TextInput
              value={gender}
              onChangeText={setGender}
              style={styles.input}
              maxLength={1}
              placeholder={t('patientInfo.genderPlaceholder')}
            /> :
            <Text style={styles.detailValue}>{gender}</Text>
          }
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={{ width: '100%', alignItems: 'center' }}>
          <Text style={styles.sectionTitle}>{t('patientInfo.growthChart')}</Text>
        </View>
        <Graph
          patientWeights={patientWeights}
          gender={genderForGraph}
          boysPercentiles={boysPercentiles}
          girlsPercentiles={girlsPercentiles}
          width={GRAPH_WIDTH}
          height={GRAPH_HEIGHT}
        />
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('patientInfo.previousWeights')}</Text>
        {editMode ? (
          <>
            {weights.map((entry, idx) => (
              <View key={idx} style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <TextInputMask
                  type={'datetime'}
                  options={{ format: 'DD/MM/YYYY' }}
                  value={entry.date}
                  onChangeText={val => updateWeight(idx, 'date', val)}
                  style={[styles.input, { flex: 1 }]}
                  placeholder={t('patientInfo.weightDatePlaceholder')}
                  maxLength={10}
                />
                <TextInput
                  keyboardType="numeric"
                  value={entry.value}
                  onChangeText={val => updateWeight(idx, 'value', val)}
                  style={[styles.input, { flex: 1 }]}
                  placeholder={t('patientInfo.weightPlaceholder')}
                />
                <TouchableOpacity onPress={() => removeWeight(idx)} style={{ marginLeft: 6 }}>
                  <Text style={{ color: '#e11d48', fontWeight: 'bold' }}>{t('patientInfo.delete')}</Text>
                </TouchableOpacity>
              </View>
            ))}
            {/* Add new weight */}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 20 }}>
              <TextInputMask
                type={'datetime'}
                options={{ format: 'DD/MM/YYYY' }}
                value={newWeightDate}
                onChangeText={setNewWeightDate}
                style={[styles.input, { flex: 1 }]}
                placeholder={t('patientInfo.weightDatePlaceholder')}
                maxLength={10}
              />
              <TextInput
                keyboardType="numeric"
                value={newWeightValue}
                onChangeText={setNewWeightValue}
                style={[styles.input, { flex: 1 }]}
                placeholder={t('patientInfo.weightPlaceholder')}
              />
              <TouchableOpacity onPress={addWeight} style={{ marginLeft: 6 }}>
                <Text style={{ color: '#10b981', fontWeight: 'bold' }}>{t('patientInfo.add')}</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          weights.length === 0 ? (
            <Text style={styles.empty}>{t('patientInfo.noWeights')}</Text>
          ) : (
            weights.map((entry, idx) => (
              <View key={idx} style={styles.weightRow}>
                <Text style={styles.weightDate}>{entry.date}</Text>
                <Text style={styles.weightValue}>{entry.value} kg</Text>
              </View>
            ))
          )
        )}
      </View>

      {/* BUTTONS */}
      {editMode ? (
        <TouchableOpacity
          style={[
            styles.button,
            { opacity: isPatientInfoValid() ? 1 : 0.5 },
          ]}
          onPress={handleSave}
          disabled={!isPatientInfoValid()}
        >
          <Text style={styles.buttonText}>{t('patientInfo.saveAndContinue')}</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ flexDirection: 'row', gap: 14, marginTop: 8 }}>
          <TouchableOpacity
            style={[styles.button, { flex: 1 }]}
            onPress={handleContinue}
          >
            <Text style={styles.buttonText}>{t('patientInfo.continueToWeighing')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.secondaryButton, { flex: 1 }]}
            onPress={() => setEditMode(true)}
          >
            <Text style={styles.buttonText}>{t('patientInfo.editInfo')}</Text>
          </TouchableOpacity>
        </View>
      )}
    </ScrollView>
  );
};

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
    alignItems: 'center',
    marginBottom: 9,
    gap: 8,
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
    flex: 2,
    textAlign: 'right',
  },
  input: {
    backgroundColor: '#fff',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: "#000",
    flex: 2,
  },
  weightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    paddingVertical: 7,
  },
  weightDate: {
    color: '#2563eb',
    fontSize: 15,
  },
  weightValue: {
    color: '#444',
    fontSize: 15,
    fontWeight: '600',
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
    marginBottom: 0,
    marginTop: 0,
  },
  secondaryButton: {
    backgroundColor: '#868d96',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});

export default PatientInfo;
