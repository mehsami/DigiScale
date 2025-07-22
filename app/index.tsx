import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import AppEntryScreen from "./AppEntryScreen";
import ChooseLanguageOnboarding from "./ChooseLanguageOnboarding";
import Home from "./Home";

const HAS_LAUNCHED_KEY = "has-launched";
const LANGUAGE_KEY = "user-language";

export default function Index() {
  const [screen, setScreen] = useState<"loading" | "appentry" | "chooseLang" | "home">("loading");

  useEffect(() => {
    (async () => {
      // Check for first launch (fresh install)
      const hasLaunched = await AsyncStorage.getItem(HAS_LAUNCHED_KEY);
      if (!hasLaunched) {
        await AsyncStorage.removeItem(LANGUAGE_KEY);
        await AsyncStorage.setItem(HAS_LAUNCHED_KEY, "1");
      }
      // Check user language key
      const lang = await AsyncStorage.getItem(LANGUAGE_KEY);
      if (!lang) {
        setScreen("appentry");
      } else {
        setScreen("home");
      }
    })();
  }, []);

  if (screen === "loading") return null;

  if (screen === "appentry") {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <AppEntryScreen onGetStarted={() => setScreen("chooseLang")} />
      </>
    );
  }

  if (screen === "chooseLang") {
    return (
      <>
        <Stack.Screen options={{ headerShown: false }} />
        <ChooseLanguageOnboarding onProceed={() => setScreen("home")} />
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Home />
    </>
  );
}
