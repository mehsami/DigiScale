import { Stack } from "expo-router";
import Home from "./Home";

export default function Index() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <Home />
    </>
  );
}