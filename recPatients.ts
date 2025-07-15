import AsyncStorage from '@react-native-async-storage/async-storage';

export type RecentPatient = {
  patientId: string;
  name: string;
  dob: string;
  gender?: string;
  date: string; // ISO string when record was saved
  village?: string;
};

const RECENT_PATIENTS_KEY = 'RECENT_PATIENTS_V2';

export async function addRecentPatient(patient: RecentPatient) {
  try {
    const stored = await AsyncStorage.getItem(RECENT_PATIENTS_KEY);
    let arr: RecentPatient[] = stored ? JSON.parse(stored) : [];
    arr = arr.filter(p => p.patientId !== patient.patientId); // Remove duplicates
    arr.unshift(patient); // Add new at top
    arr = arr.slice(0, 7); // Keep only 7
    await AsyncStorage.setItem(RECENT_PATIENTS_KEY, JSON.stringify(arr));
  } catch (e) {
    // Optionally handle error
  }
}

export async function getRecentPatients(): Promise<RecentPatient[]> {
  try {
    const stored = await AsyncStorage.getItem(RECENT_PATIENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
