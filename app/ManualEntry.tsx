import { NativeStackScreenProps } from '@react-navigation/native-stack';
import React, { useState } from 'react';
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
  const [patientId, setPatientId] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [village, setVillage] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('');

  const handleNext = () => {
    if (!patientId || !firstName || !lastName) {
      Alert.alert('Error', 'Patient ID, First Name, and Last Name are required.');
      return;
    }
    const convertedDOB = convertDOB(dob);

    const patientRecord = {
      Date_of_Birth: convertedDOB,
      First_Name: firstName,
      Last_Name: lastName,
      Gender: gender,
      Village: village,
      Phone_Number: 96789009, // placeholder example
      Weight: {
        "03032006": 3.3,   // Birth
        "04032006": 4.5,   // 1 mo
        "05032006": 5.6,   // 2 mo
        "06032006": 6.4,   // 3 mo
        "07032006": 7.0,   // 4 mo
        "08032006": 7.5,   // 5 mo
        "09032006": 7.9,   // 6 mo
        "10032006": 8.3,   // 7 mo
        "11032006": 8.6,   // 8 mo
        "12032006": 8.9,   // 9 mo
        "01032007": 9.2,   // 10 mo
        "02032007": 9.4,   // 11 mo
        "03032007": 9.6,   // 12 mo (1 yr)
        "04032007": 9.9,   // 13 mo
        "05032007": 10.1,  // 14 mo
        "06032007": 10.3,  // 15 mo
        "07032007": 10.5,  // 16 mo
        "08032007": 10.7,  // 17 mo
        "09032007": 10.9,  // 18 mo
        "10032007": 11.1,  // 19 mo
        "11032007": 11.3,  // 20 mo
        "12032007": 11.5,  // 21 mo
        "01032008": 11.8,  // 22 mo
        "02032008": 12.0,  // 23 mo
        "03032008": 12.2,  // 24 mo (2 yr)
        "04032008": 12.4,  // 25 mo
        "05032008": 12.5,  // 26 mo
        "06032008": 12.7,  // 27 mo
        "07032008": 12.9,  // 28 mo
        "08032008": 13.1,  // 29 mo
        "09032008": 13.3,  // 30 mo
        "10032008": 13.5,  // 31 mo
        "11032008": 13.7,  // 32 mo
        "12032008": 13.8,  // 33 mo
        "01032009": 14.0,  // 34 mo
        "02032009": 14.2,  // 35 mo
        "03032009": 14.3,  // 36 mo (3 yrs)
      },
    };

    navigation.navigate('Fetching', { patientId, patientRecord });
  };

  return (
    <View style={styles.outerContainer}>
      <View style={styles.formCard}>
        <Text style={styles.title}>Patient Identification</Text>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Patient Name</Text>
          <View style={styles.row}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputSubLabel}>First Name</Text>
              <TextInput
                style={styles.input}
                placeholder="(e.g. Peter)"
                placeholderTextColor="#888"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputSubLabel}>Last Name</Text>
              <TextInput
                style={styles.input}
                placeholder="(e.g. Banda)"
                placeholderTextColor="#888"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Patient ID</Text>
          <TextInput
            style={styles.input}
            placeholder="(e.g. P001)"
            placeholderTextColor="#888"
            value={patientId}
            onChangeText={setPatientId}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Date of Birth</Text>
          <TextInputMask
            type={'datetime'}
            options={{
              format: 'DD/MM/YYYY',
            }}
            value={dob}
            onChangeText={setDob}
            style={styles.input}
            placeholder="(e.g. 04/07/2025)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            maxLength={10}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Village</Text>
          <TextInput
            style={styles.input}
            placeholder="(e.g. Chikwawa)"
            placeholderTextColor="#888"
            value={village}
            onChangeText={setVillage}
          />
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Gender</Text>
          <TextInput
            style={styles.input}
            placeholder="(e.g. M or F)"
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
          <Text style={styles.buttonText}>Proceed to Data Retrieval</Text>
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