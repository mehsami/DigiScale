import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useBluetooth } from "./BluetoothProvider";

type Props = {
  route: {
    params: {
      patientId: string;
      patientRecord: any;
    };
  };
  navigation: any;
};

function BleScreen({ route, navigation }: Props) {
  const { t } = useTranslation();
  const { patientId, patientRecord } = route.params;

  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    disconnectFromDevice,
    value,
  } = useBluetooth();

  const isConnected = !!connectedDevice;
  const [manualMode, setManualMode] = useState(false);
  const [manualWeight, setManualWeight] = useState("");
  const [confirmedWeight, setConfirmedWeight] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  let displayWeight: string = "--.--";
  if (manualMode) {
    displayWeight = manualWeight || "--.--";
  } else if (isConnected && value !== undefined && value !== null) {
    displayWeight = Number(value).toFixed(2);
  }

  const handleConnectPress = async () => {
    setIsScanning(true);
    await requestPermissions();
    await scanForPeripherals();
  };

  useEffect(() => {
    if (isConnected) setIsScanning(false);
  }, [isConnected]);

  useEffect(() => {
    setConfirmedWeight(null);
  }, [manualMode, isConnected]);

  const proceedToGraphing = () => {
    if (!confirmedWeight) return;

    const today = new Date();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    const yyyy = today.getFullYear();
    const dateStr = `${mm}${dd}${yyyy}`;

    const updatedRecord = {
      ...patientRecord,
      Weight: {
        ...(patientRecord.Weight || {}),
        [dateStr]: parseFloat(confirmedWeight),
      },
    };

    navigation.navigate("PatientInfoAfter", {
      patientId,
      patientRecord: updatedRecord,
      highlightWeightDate: dateStr,
    });
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.select({ ios: "padding", android: undefined })}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View
          style={[
            styles.statusRow,
            isConnected
              ? styles.connectedBackground
              : styles.notConnectedBackground,
          ]}
        >
          <Text style={isConnected ? styles.connected : styles.notConnected}>
            {isConnected ? t("ble.connected") : t("ble.notConnected")}
          </Text>
          {!isConnected && !isScanning && (
            <TouchableOpacity
              style={styles.connectBtnRed}
              onPress={handleConnectPress}
            >
              <Text style={styles.connectBtnTextRed}>{t("ble.connectScale")}</Text>
            </TouchableOpacity>
          )}
          {!isConnected && isScanning && (
            <View style={{ width: "100%", marginTop: 12 }}>
              {allDevices.length > 0 ? (
                allDevices.map((device) => (
                  <TouchableOpacity
                    key={device.id}
                    style={styles.deviceBtnRed}
                    onPress={() => connectToDevice(device)}
                  >
                    <Text style={styles.deviceBtnTextRed}>
                      {device.name || device.id}
                    </Text>
                  </TouchableOpacity>
                ))
              ) : (
                <Text style={styles.noDeviceText}>{t("ble.scanning")}</Text>
              )}
            </View>
          )}
        </View>

        <View style={styles.valueContainer}>
          <Text style={styles.valueText}>{displayWeight}</Text>
          <Text style={styles.kgText}>{t("ble.kg")}</Text>
        </View>

        {manualMode && (
          <>
            <Text style={styles.sectionLabel}>{t("ble.manualWeightEntry")}</Text>
            <TextInput
              style={styles.input}
              value={manualWeight}
              onChangeText={setManualWeight}
              placeholder={t("ble.weightPlaceholder")}
              placeholderTextColor="#ccc"
              keyboardType="numeric"
              maxLength={6}
            />
          </>
        )}

        {(isConnected || manualMode) && !confirmedWeight && (
          <TouchableOpacity
            style={[styles.actionBtn, { marginTop: 12 }]}
            onPress={() => setConfirmedWeight(String(displayWeight))}
            disabled={displayWeight === "--.--"}
          >
            <Text style={styles.actionBtnText}>{t("ble.acceptMeasurement")}</Text>
          </TouchableOpacity>
        )}

        {!manualMode && !confirmedWeight && (
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => setManualMode(true)}
          >
            <Text style={styles.actionBtnText}>{t("ble.enterWeightManually")}</Text>
          </TouchableOpacity>
        )}

        {manualMode && !confirmedWeight && (
          <TouchableOpacity
            style={styles.secondaryBtn}
            onPress={() => {
              setManualMode(false);
              setManualWeight("");
            }}
          >
            <Text style={styles.secondaryBtnText}>{t("ble.useScaleInstead")}</Text>
          </TouchableOpacity>
        )}

        {confirmedWeight && (
          <View style={styles.confirmedBox}>
            <Text style={styles.confirmedText}>
              {t("ble.measurementAccepted", { weight: confirmedWeight })}
            </Text>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={proceedToGraphing}
            >
              <Text style={styles.secondaryBtnText}>{t("ble.proceedToGraphing")}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() => {
                setConfirmedWeight(null);
                setManualMode(false);
                setManualWeight("");
              }}
            >
              <Text style={styles.secondaryBtnText}>{t("ble.redoMeasurement")}</Text>
            </TouchableOpacity>
          </View>
        )}

        {isConnected && (
          <TouchableOpacity
            style={styles.repairBtn}
            onPress={() => {
              disconnectFromDevice();
              setManualMode(false);
              setManualWeight("");
              setConfirmedWeight(null);
            }}
          >
            <Text style={styles.repairBtnText}>{t("ble.restartPairing")}</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    backgroundColor: "#F7FBFD",
  },
  statusRow: {
    flexDirection: "column",
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    padding: 12,
    marginBottom: 18,
    borderWidth: 1,
    fontWeight: "bold",
  },
  notConnectedBackground: {
    backgroundColor: "#ffeaea",
    borderColor: "#ffd6d6",
  },
  connectedBackground: {
    backgroundColor: "#eafeea",
    borderColor: "#d6ffd6",
  },
  notConnected: {
    color: "#e74c3c",
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 10,
  },
  connected: {
    color: "#2ecc71",
    fontWeight: "bold",
    fontSize: 17,
  },
  connectBtnRed: {
    backgroundColor: "#e74c3c",
    borderRadius: 6,
    paddingHorizontal: 18,
    paddingVertical: 12,
    marginBottom: 8,
    marginTop: 6,
    width: "80%",
    alignItems: "center",
  },
  connectBtnTextRed: {
    color: "white",
    fontWeight: "bold",
    fontSize: 17,
  },
  deviceBtnRed: {
    backgroundColor: "#e74c3c",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 8,
    alignItems: "center",
    marginVertical: 4,
    width: "100%",
  },
  deviceBtnTextRed: {
    color: "white",
    fontSize: 15,
    fontWeight: "500",
  },
  valueContainer: {
    width: "100%",
    minHeight: 140,
    backgroundColor: "#000",
    borderRadius: 12,
    borderWidth: 5,
    borderColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
    marginTop: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.23,
    shadowRadius: 6,
    elevation: 8,
  },
  valueText: {
    color: "white",
    fontSize: 78,
    fontWeight: "bold",
    letterSpacing: 3,
    fontFamily: Platform.OS === "ios" ? "Menlo" : "monospace",
  },
  kgText: {
    color: "white",
    fontSize: 28,
    marginTop: 2,
  },
  sectionLabel: {
    fontWeight: "bold",
    marginTop: 18,
    fontSize: 16,
    marginBottom: 5,
    alignSelf: "flex-start",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    fontSize: 22,
    width: "100%",
    backgroundColor: "#fff",
    letterSpacing: 1,
  },
  actionBtn: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: "center",
    marginVertical: 6,
    width: "100%",
  },
  actionBtnText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  secondaryBtn: {
    backgroundColor: "#fff",
    borderColor: "#181c2f",
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    marginVertical: 6,
    width: "100%",
  },
  secondaryBtnText: {
    color: "#181c2f",
    fontWeight: "bold",
    fontSize: 16,
  },
  noDeviceText: {
    color: "#888",
    textAlign: "center",
    marginTop: 6,
  },
  confirmedBox: {
    backgroundColor: "#2ecc71",
    borderRadius: 8,
    padding: 18,
    marginTop: 28,
    width: "100%",
    alignItems: "center",
  },
  confirmedText: {
    color: "#fff",
    fontSize: 20,
    textAlign: "center",
    fontWeight: "bold",
    marginBottom: 12,
  },
  repairBtn: {
    backgroundColor: "#fff",
    borderColor: "#e67e22",
    borderWidth: 2,
    borderRadius: 8,
    paddingVertical: 13,
    alignItems: "center",
    marginVertical: 24,
    width: "100%",
  },
  repairBtnText: {
    color: "#e67e22",
    fontWeight: "bold",
    fontSize: 16,
  },
});

export default BleScreen;
