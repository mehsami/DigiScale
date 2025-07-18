import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Button, StyleSheet, Text, View } from "react-native";

const LANGUAGE_KEY = "user-language";

// Accept either navigation or onGetStarted (one will be provided)
type Props = {
  navigation?: any;
  onGetStarted?: () => void;
};

export default function AppEntryScreen({ navigation, onGetStarted }: Props) {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    (async () => {
      const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (lang && navigation) {
        navigation.replace("MainTabs");
      } else if (lang && onGetStarted) {
        // Immediately continue if using prop-style navigation
        onGetStarted();
      } else {
        setChecking(false); // Show onboarding UI
      }
    })();
    // Only check on mount, do NOT depend on navigation/onGetStarted
    // eslint-disable-next-line
  }, []);

  if (checking) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  // Handles both navigation and prop-based start
  const handleStart = () => {
    if (navigation) {
      navigation.replace("ChooseLanguageOnboarding");
    } else if (onGetStarted) {
      onGetStarted();
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome to DigiScale</Text>
      <Text style={styles.subtitle}>Child Growth Monitoring</Text>
      <View style={styles.buttonContainer}>
        <Button title="Get Started" onPress={handleStart} color="#2563eb" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f8fbfc" },
  title: { fontSize: 28, fontWeight: "bold", color: "#2563eb", marginBottom: 16 },
  subtitle: { fontSize: 16, color: "#888", marginBottom: 36 },
  buttonContainer: { width: 200 },
});
