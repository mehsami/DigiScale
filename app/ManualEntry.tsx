import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { TextInputMask } from 'react-native-masked-text';

type HomeStackParamList = {
  Home: undefined;
  QRCode: undefined;
  PassportScanner: undefined;
  ManualEntry: undefined;
  PatientInfo: { patientId: string; patientRecord: any };
  Weighing: { patientId: string; patientRecord: any };
  PatientInfoAfter: { patientId: string; patientRecord: any; highlightWeightDate: string };
  Fetching: { patientId: string; patientRecord: any };
};

type Props = NativeStackScreenProps<HomeStackParamList, 'ManualEntry'>;

const convertDOB = (dob: string) => {
  const parts = dob.split('/');
  if (parts.length !== 3) return dob.replace(/\D+/g, '');
  const [dd, mm, yyyy] = parts;
  return `${mm}${dd}${yyyy}`;
};

const ManualEntryScreen: React.FC<Props> = ({ navigation }) => {
  const { t } = useTranslation();
  const [patientId, setPatientId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [village, setVillage] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  const handleNext = () => {
    if (!patientId || !firstName || !lastName) {
      Alert.alert(
        t('manualEntry.errorTitle'), 
        t('manualEntry.errorMessage')
      );
      return;
    }
    const convertedDOB = convertDOB(dob);

    const patientRecord: any = {
      Date_of_Birth: convertedDOB,
      First_Name: firstName,
      Last_Name: lastName,
    };
    if (gender) patientRecord.Gender = gender;
    if (village) patientRecord.Village = village;
    patientRecord.Phone_Number = 96789009;
    patientRecord.Weight = {};

    navigation.navigate('Fetching', { patientId, patientRecord });
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.formCard}>
        <Text style={styles.title}>{t('manualEntry.title')}</Text>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('manualEntry.patientName')}</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputSubLabel}>{t('manualEntry.firstName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('manualEntry.firstNamePlaceholder')}
                placeholderTextColor="#888"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputSubLabel}>{t('manualEntry.lastName')}</Text>
              <TextInput
                style={styles.input}
                placeholder={t('manualEntry.lastNamePlaceholder')}
                placeholderTextColor="#888"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('manualEntry.patientId')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('manualEntry.patientIdPlaceholder')}
            placeholderTextColor="#888"
            value={patientId}
            onChangeText={setPatientId}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('manualEntry.dateOfBirth')}</Text>
          <TextInputMask
            type={'datetime'}
            options={{ format: 'DD/MM/YYYY' }}
            value={dob}
            onChangeText={setDob}
            style={styles.input}
            placeholder={t('manualEntry.dobPlaceholder')}
            placeholderTextColor="#888"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('manualEntry.village')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('manualEntry.villagePlaceholder')}
            placeholderTextColor="#888"
            value={village}
            onChangeText={setVillage}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>{t('manualEntry.gender')}</Text>
          <TextInput
            style={styles.input}
            placeholder={t('manualEntry.genderPlaceholder')}
            placeholderTextColor="#888"
            value={gender}
            onChangeText={setGender}
            maxLength={1}
          />
        </View>

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.85}
        >
          <Text style={styles.buttonText}>{t('manualEntry.proceed')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
    backgroundColor: '#f5f6fa',
    padding: 12,
    justifyContent: 'center',
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 28,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
    margin: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 28,
    color: '#222',
  },
  inputSection: {
    marginBottom: 18,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#1a202c',
  },
  inputSubLabel: {
    fontSize: 14,
    color: '#555',
    marginBottom: 6,
    marginLeft: 2,
  },
  input: {
    backgroundColor: '#f9fafb',
    borderColor: '#e5e7eb',
    borderWidth: 1,
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    color: "#000",
  },
  row: {
    flexDirection: 'row',
  },
  button: {
    backgroundColor: '#868d96',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: 18,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 17,
  },
});

export default ManualEntryScreen;
