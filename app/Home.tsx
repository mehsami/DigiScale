import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator, StackNavigationProp } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import logo from '../assets/images/DigiScaleLogo.png';
import BleScreen from './BleScreen';
import { BluetoothProvider } from './BluetoothProvider';
import FetchingScreen from './FetchingScreen';
import ManualEntryScreen from './ManualEntry';
import PatientInfo from './PatientInfo';
import PatientInfoAfter from './PatientInfoAfter';
import SettingsScreen from './SettingsScreen';


// Types for HomeStack navigation
type HomeStackParamList = {
  Home: undefined;
  QRCode: undefined;
  PassportScanner: undefined;
  ManualEntry: undefined;
  PatientInfo: { patientId: string; patientRecord: any };
  Weighing: { patientId: string; patientRecord: any };
  PatientInfoAfter: { patientId: string; patientRecord: any; highlightWeightDate: string };
  Fetching: { patientId: string; patientRecord: any }; // Add this
};

// Types for Bottom Tab navigation
type TabParamList = {
  Home: undefined;
  'Recent Patients': undefined;
  Settings: undefined;
};

// Home Screen Props
type HomeScreenProps = {
  navigation: StackNavigationProp<HomeStackParamList, 'Home'>;
};

function HomeScreen({ navigation }: HomeScreenProps) {
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
          <Text style={styles.title}>DigiScale</Text>
          <Text style={styles.subtitle}>Child Growth Monitoring</Text>
        </View>
        <Image source={logo} style={styles.logo} />
      </View>
      <View style={styles.mainOptions}>
        <OptionButton
          color="#2563eb"
          icon="barcode-scan"
          label="Scan Barcode"
          onPress={() => navigation.navigate('QRCode')}
        />
        <OptionButton
          color="#22c55e"
          icon="passport"
          label="Scan Passport"
          onPress={() => navigation.navigate('PassportScanner')}
        />
        <OptionButton
          color="#fff"
          icon="keyboard-outline"
          label="Manual Entry"
          onPress={() => navigation.navigate('ManualEntry')}
        />
        <OptionButton
          color="#fff"
          icon="microphone"
          label="Voice Entry"
          onPress={() => {/* implement voice entry navigation if available */}}
        />
      </View>
      <View style={styles.recentPatientsCard}>
        <Text style={styles.recentPatientsTitle}>Recent Patients</Text>
        <Text style={styles.recentPatientsEmpty}>No recent patients</Text>
      </View>
      <StatusBar style="auto" />
    </ScrollView>
  );
}

function QRCodeScreen() {
  return <View style={styles.centered}><Text>QR Code Screen</Text></View>;
}

function PassportScannerScreen() {
  return <View style={styles.centered}><Text>Passport Scanner Screen</Text></View>;
}

function RecentPatientsScreen() {
  return <View style={styles.centered}><Text>Recent Patients</Text></View>;
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
    </HomeStack.Navigator>
  );
}

const Tab = createBottomTabNavigator<TabParamList>();

// --- THIS IS WHERE YOU WRAP THE PROVIDER AROUND THE NAVIGATION ---
export default function Home() {
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
        <Tab.Screen name="Home" component={HomeStackScreen} />
        <Tab.Screen name="Recent Patients" component={RecentPatientsScreen} />
        <Tab.Screen name="Settings" component={SettingsScreen} />
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
  recentPatientsEmpty: {
    color: '#64748b',
    fontSize: 15,
    marginTop: 8,
  },
});
