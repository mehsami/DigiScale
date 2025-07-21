import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import logo from '../assets/images/DigiScaleLogo.png';
import { getRecentPatients, RecentPatient } from '../recPatients';
import BleScreen from './BleScreen';
import { BluetoothProvider } from './BluetoothProvider';
import ChooseLanguageScreen from './ChooseLanguageScreen';
import FetchingScreen from './FetchingScreen';
import ManualEntryScreen from './ManualEntry';
import PatientInfo from './PatientInfo';
import PatientInfoAfter from './PatientInfoAfter';
import RecentPatientsScreen from './RecentPatientsScreen';
import SettingsScreen from './SettingsScreen';

type HomeStackParamList = {
  Home: undefined;
  QRCode: undefined;
  PassportScanner: undefined;
  ManualEntry: undefined;
  PatientInfo: { patientId: string; patientRecord: any };
  Weighing: { patientId: string; patientRecord: any };
  PatientInfoAfter: { patientId: string; patientRecord: any; highlightWeightDate?: string };
  Fetching: { patientId: string };
  ChooseLanguage: undefined;
};

type TabParamList = {
  Home: undefined;
  'Recent Patients': undefined;
  Settings: undefined;
};

type HomeScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'Home'> & { navigate: any };
};

function HomeScreen({ navigation }: HomeScreenProps) {
  const { t } = useTranslation();
  const [recentPatients, setRecentPatients] = useState<RecentPatient[]>([]);

  useEffect(() => {
    const fetchRecents = async () => {
      const recents = await getRecentPatients();
      setRecentPatients(recents);
    };
    const unsubscribe = navigation.addListener('focus', fetchRecents);
    fetchRecents();
    return unsubscribe;
  }, [navigation]);

  const OptionButton = ({
    color,
    icon,
    label,
    onPress,
  }: {
    color: string;
    icon: any;
    label: string;
    onPress: () => void;
  }) => (
    <TouchableOpacity
      style={[styles.optionRow, { backgroundColor: color }]}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <MaterialCommunityIcons
        name={icon}
        size={22}
        color={color === "#fff" ? "#234" : "#fff"}
        style={{ marginRight: 12 }}
      />
      <Text style={[styles.optionLabel, { color: color === "#fff" ? "#234" : "#fff" }]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#f8fbfc' }} contentContainerStyle={{ flexGrow: 1 }}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>{t('home.appName')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>
        <Image source={logo} style={styles.logo} />
      </View>
      <View style={styles.mainOptions}>
        <OptionButton
          color="#2563eb"
          icon="barcode-scan"
          label={t('home.scanBarcode')}
          onPress={() => navigation.navigate('QRCode')}
        />
        <OptionButton
          color="#22c55e"
          icon="passport"
          label={t('home.scanPassport')}
          onPress={() => navigation.navigate('PassportScanner')}
        />
        <OptionButton
          color="#fff"
          icon="keyboard-outline"
          label={t('home.manualEntry')}
          onPress={() => navigation.navigate('ManualEntry')}
        />
        <OptionButton
          color="#fff"
          icon="microphone"
          label={t('home.voiceEntry')}
          onPress={() => {/* implement voice entry navigation if available */}}
        />
      </View>
      <View style={styles.recentPatientsCard}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <Text style={styles.recentPatientsTitle}>{t('home.recentPatients')}</Text>
          {recentPatients.length > 0 && (
            <TouchableOpacity onPress={() => navigation.navigate('Recent Patients' as never)}>
              <Text style={styles.seeAll}>{t('home.seeAll')}</Text>
            </TouchableOpacity>
          )}
        </View>
        {recentPatients.length === 0 ? (
          <Text style={styles.recentPatientsEmpty}>{t('home.noRecentPatients')}</Text>
        ) : (
          recentPatients.slice(0, 3).map((p) => (
            <TouchableOpacity
              key={p.patientId}
              style={styles.patientRow}
              onPress={() =>
                navigation.navigate('Fetching', { patientId: p.patientId })
              }
              activeOpacity={0.82}
            >
              <View>
                <Text style={styles.patientName}>{p.name}</Text>
                <Text style={styles.patientMeta}>
                  {t('home.dobGender', { dob: p.dob, gender: p.gender || '-' })}
                </Text>
                {p.village && (
                  <Text style={styles.patientMeta}>
                    {t('home.village', { village: p.village })}
                  </Text>
                )}
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color="#b4b8c2" />
            </TouchableOpacity>
          ))
        )}
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

// Placeholders for QR and Passport screens (can translate if needed)
function QRCodeScreen() {
  const { t } = useTranslation();
  return <View style={styles.centered}><Text>{t('home.qrCodeScreen', 'QR Code Screen')}</Text></View>;
}

function PassportScannerScreen() {
  const { t } = useTranslation();
  return <View style={styles.centered}><Text>{t('home.passportScannerScreen', 'Passport Scanner Screen')}</Text></View>;
}

const HomeStack = createStackNavigator<HomeStackParamList>();

function HomeStackScreen() {
  return (
    <HomeStack.Navigator>
      <HomeStack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
      <HomeStack.Screen name="QRCode" component={QRCodeScreen} />
      <HomeStack.Screen name="PassportScanner" component={PassportScannerScreen} />
      <HomeStack.Screen name="ManualEntry" component={ManualEntryScreen} />
      <HomeStack.Screen name="Fetching" component={FetchingScreen} />
      <HomeStack.Screen name="PatientInfo" component={PatientInfo} />
      <HomeStack.Screen name="Weighing" component={BleScreen} />
      <HomeStack.Screen name="PatientInfoAfter" component={PatientInfoAfter} />
      <HomeStack.Screen name="ChooseLanguage" component={ChooseLanguageScreen} />
    </HomeStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<TabParamList>();

export default function Home() {
  const { t } = useTranslation();
  return (
    <BluetoothProvider>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          headerShown: false,
          tabBarIcon: ({ color, size }: { color: string; size: number }) => {
            let iconName: string = 'home';
            if (route.name === 'Home') iconName = 'home';
            else if (route.name === 'Recent Patients') iconName = 'account-group';
            else if (route.name === 'Settings') iconName = 'cog';
            return <MaterialCommunityIcons name={iconName as any} color={color} size={size} />;
          },
        })}
      >
        <Tab.Screen
          name="Home"
          component={HomeStackScreen}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{ color, fontWeight: focused ? 'bold' : 'normal' }}>
                {t('home.tabHome', 'Home')}
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="Recent Patients"
          component={RecentPatientsScreen}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{ color, fontWeight: focused ? 'bold' : 'normal' }}>
                {t('home.tabRecentPatients', 'Recent Patients')}
              </Text>
            ),
          }}
        />
        <Tab.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            tabBarLabel: ({ focused, color }) => (
              <Text style={{ color, fontWeight: focused ? 'bold' : 'normal' }}>
                {t('home.tabSettings', 'Settings')}
              </Text>
            ),
          }}
        />
      </Tab.Navigator>
    </BluetoothProvider>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "#f8fbfc",
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    paddingTop: 28,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
  },
  logo: {
    width: 56,
    height: 56,
    resizeMode: 'contain',
    marginLeft: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 2,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
  },
  mainOptions: {
    gap: 14,
    padding: 18,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    padding: 20,
    marginBottom: 0,
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 3,
    marginVertical: 2,
  },
  optionLabel: {
    fontSize: 18,
    fontWeight: '600',
  },
  recentPatientsCard: {
    backgroundColor: '#fff',
    margin: 18,
    marginTop: 8,
    borderRadius: 12,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
    minHeight: 85,
  },
  recentPatientsTitle: {
    fontWeight: 'bold',
    fontSize: 18,
    marginBottom: 6,
    color: '#1e293b',
  },
  seeAll: {
    color: '#2563eb',
    fontWeight: 'bold',
    fontSize: 15,
  },
  recentPatientsEmpty: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 8,
  },
  patientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f4f8',
    justifyContent: 'space-between',
  },
  patientName: {
    fontWeight: 'bold',
    fontSize: 16,
    color: '#222a34',
  },
  patientMeta: {
    color: '#7c8591',
    fontSize: 13,
    marginTop: 1,
  },
});
