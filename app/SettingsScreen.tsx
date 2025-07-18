import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useBluetooth } from './BluetoothProvider'; // <-- updated import

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  // Use shared BLE context instead of local hook
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
  } = useBluetooth();

  const isConnected = !!connectedDevice;
  const [isScanning, setIsScanning] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [authCode, setAuthCode] = useState('');
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    if (isConnected) setIsScanning(false);
  }, [isConnected]);

  const handleScanPress = async () => {
    setIsScanning(true);
    await requestPermissions();
    await scanForPeripherals();
  };

  const handleSaveSMSInfo = () => {
    alert(`Saved:\nPhone: ${phoneNumber}\nAuth Code: ${authCode}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Bluetooth Settings</Text>
        <View style={styles.statusRow}>
          <Text style={isConnected ? styles.connected : styles.notConnected}>
            {isConnected ? `Paired Device: ${connectedDevice?.name || connectedDevice?.id}` : 'No device paired'}
          </Text>
          {!isConnected && !isScanning && (
            <TouchableOpacity style={styles.pairButton} onPress={handleScanPress}>
              <MaterialCommunityIcons
                name="bluetooth"
                size={20}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.whiteButtonText}>Pair Device</Text>
            </TouchableOpacity>
          )}
          {!isConnected && isScanning && (
            <View style={{ width: '100%', marginTop: 12 }}>
              {allDevices.length > 0 ? (
                allDevices.map(device => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.deviceBtn}
                    onPress={() => connectToDevice(device)}
                  >
                    <Text style={styles.deviceBtnText}>
                      {device.name || device.id}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDeviceText}>Scanning for devices...</Text>
              )}
            </View>
          )}
          {isConnected && (
            <TouchableOpacity
              style={styles.unpairButton}
              onPress={() => disconnectFromDevice()}
            >
              <MaterialCommunityIcons
                name="bluetooth-off"
                size={20}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.whiteButtonText}>Unpair Device</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>SMS Settings</Text>
        <Text style={styles.label}>Phone Number</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder="Enter phone number"
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>Authentication Code</Text>
        <TextInput
          style={styles.input}
          value={authCode}
          onChangeText={setAuthCode}
          placeholder="Enter auth code"
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSMSInfo}>
          <MaterialCommunityIcons
            name="content-save"
            size={20}
            color="#333"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.subtleButtonText}>Save SMS Info</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.instructionsButton} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={20}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.whiteButtonText}>View Instructions Manual</Text>
      </TouchableOpacity>

      {/* ----------- CHANGE LANGUAGE BUTTON ----------- */}
      <TouchableOpacity
        style={styles.instructionsButton}
        onPress={() => navigation.navigate('Home',{screen:'ChooseLanguage'})}
      >
        <MaterialCommunityIcons
          name="translate"
          size={20}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.whiteButtonText}>Change Language</Text>
      </TouchableOpacity>
      {/* ----------- END CHANGE LANGUAGE BUTTON ----------- */}

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Instructions Manual</Text>
            <ScrollView style={{ maxHeight: 250, marginVertical: 10 }}>
              <Text style={styles.modalText}>
                The healthcare provider should enter the patient's info first.{"\n\n"}
                The user will then see previous data and proceed to weighing after pairing the scale.{"\n\n"}
                As they weigh, they can save data using their phone and plot it to view analytics.{"\n\n"}
                The data will automatically upload and be saved for later cases.
              </Text>
            </ScrollView>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <MaterialCommunityIcons
                name="close-circle"
                size={24}
                color="#2563eb"
              />
              <Text style={[styles.buttonText, { marginLeft: 8, color: '#2563eb' }]}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f6fa',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 20,
    textAlign: 'left',
  },
  sectionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
    marginTop: 10,
  },
  input: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#000',
  },
  statusRow: {
    width: '100%',
  },
  pairButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  unpairButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    marginTop: 12,
  },
  saveButton: {
    flexDirection: 'row',
    backgroundColor: '#ddd',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 16,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
  },
  instructionsButton: {
    flexDirection: 'row',
    backgroundColor: '#2563eb',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingHorizontal: 16,
    marginBottom: 20, // Updated for spacing
  },
  whiteButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#fff',
  },
  subtleButtonText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  deviceBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: 'center',
    marginVertical: 4,
    width: '100%',
  },
  deviceBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '500',
  },
  noDeviceText: {
    color: '#888',
    textAlign: 'center',
    marginTop: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 10,
  },
  modalText: {
    fontSize: 16,
    color: '#111',
    lineHeight: 24,
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
  },
  buttonText: {
    fontSize: 17,
    fontWeight: '600',
  },
  connected: {
    color: '#2ecc71',
    fontWeight: 'bold',
    fontSize: 17,
  },
  notConnected: {
    color: '#e74c3c',
    fontWeight: 'bold',
    fontSize: 17,
  },
});