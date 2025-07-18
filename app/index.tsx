import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack } from "expo-router";
import React, { useEffect, useState } from "react";
import AppEntryScreen from "./AppEntryScreen";
import ChooseLanguageOnboarding from "./ChooseLanguageOnboarding";
import Home from "./Home";

export default function Index() {
  const [screen, setScreen] = useState<"loading" | "appentry" | "chooseLang" | "home">("loading");

  useEffect(() => {
    (async () => {
      const lang = await AsyncStorage.getItem("user-language");
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
