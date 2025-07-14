// firebaseConfig.ts
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

// Your web Firebase config from the console
const firebaseConfig = {
  apiKey: "AIzaSyAa2boiWMkQMUiKONAlQQHLjEyeFC0SIXk",
  authDomain: "esp32-digiscale.firebaseapp.com",
  databaseURL: "https://esp32-digiscale-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "esp32-digiscale",
  storageBucket: "esp32-digiscale.appspot.com",
  messagingSenderId: "146532325356",
  appId: "1:146532325356:web:0cd197e7a0197fd78012c9",
  measurementId: "G-C6G2EKMRF1"
};

// Initialize
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export { db };
