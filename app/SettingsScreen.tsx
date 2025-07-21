import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useBluetooth } from './BluetoothProvider';

type Props = {
  navigation: any;
};

export default function SettingsScreen({ navigation }: Props) {
  const { t } = useTranslation();
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
    alert(
      t('settings.savedSMSInfoAlert', {
        phone: phoneNumber,
        authCode: authCode
      })
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{t('settings.title')}</Text>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('settings.bluetoothSettings')}</Text>
        <View style={styles.statusRow}>
          <Text style={isConnected ? styles.connected : styles.notConnected}>
            {isConnected
              ? t('settings.pairedDevice', {
                  name: connectedDevice?.name || connectedDevice?.id
                })
              : t('settings.noDevicePaired')}
          </Text>
          {!isConnected && !isScanning && (
            <TouchableOpacity style={styles.pairButton} onPress={handleScanPress}>
              <MaterialCommunityIcons
                name="bluetooth"
                size={20}
                color="#fff"
                style={{ marginRight: 10 }}
              />
              <Text style={styles.whiteButtonText}>{t('settings.pairDevice')}</Text>
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
                <Text style={styles.noDeviceText}>{t('settings.scanningForDevices')}</Text>
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
              <Text style={styles.whiteButtonText}>{t('settings.unpairDevice')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>{t('settings.smsSettings')}</Text>
        <Text style={styles.label}>{t('settings.phoneNumber')}</Text>
        <TextInput
          style={styles.input}
          value={phoneNumber}
          onChangeText={setPhoneNumber}
          keyboardType="phone-pad"
          placeholder={t('settings.phoneNumberPlaceholder')}
          placeholderTextColor="#888"
        />
        <Text style={styles.label}>{t('settings.authCode')}</Text>
        <TextInput
          style={styles.input}
          value={authCode}
          onChangeText={setAuthCode}
          placeholder={t('settings.authCodePlaceholder')}
          placeholderTextColor="#888"
        />
        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSMSInfo}>
          <MaterialCommunityIcons
            name="content-save"
            size={20}
            color="#333"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.subtleButtonText}>{t('settings.saveSMSInfo')}</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.instructionsButton} onPress={() => setModalVisible(true)}>
        <MaterialCommunityIcons
          name="file-document-outline"
          size={20}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.whiteButtonText}>{t('settings.viewInstructions')}</Text>
      </TouchableOpacity>

      {/* ----------- CHANGE LANGUAGE BUTTON ----------- */}
      <TouchableOpacity
        style={styles.instructionsButton}
        onPress={() => navigation.navigate('Home', { screen: 'ChooseLanguage' })}
      >
        <MaterialCommunityIcons
          name="translate"
          size={20}
          color="#fff"
          style={{ marginRight: 10 }}
        />
        <Text style={styles.whiteButtonText}>{t('settings.changeLanguage')}</Text>
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
            <Text style={styles.modalTitle}>{t('settings.instructionsManual')}</Text>
            <ScrollView style={{ maxHeight: 250, marginVertical: 10 }}>
              <Text style={styles.modalText}>
                {t('settings.instructionsManualText')}
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
              <Text style={[styles.buttonText, { marginLeft: 8, color: '#2563eb' }]}>
                {t('settings.close')}
              </Text>
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