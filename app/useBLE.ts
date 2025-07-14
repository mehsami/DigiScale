import * as ExpoDevice from "expo-device";
import { useEffect, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import base64 from "react-native-base64";
import {
  BleError,
  BleManager,
  Characteristic,
  Device,
  State,
  Subscription,
} from "react-native-ble-plx";

const SERVICE_UUID = "6530099a-e4c4-41ef-a871-3b47a8c016dc";
const CHARACTERISTIC_UUID = "09771e9e-b398-4143-983f-1c5e93cc2742";

interface BluetoothLowEnergyApi {
  requestPermissions(): Promise<boolean>;
  scanForPeripherals(): Promise<void>;
  connectToDevice(device: Device): Promise<void>;
  disconnectFromDevice(): void;
  connectedDevice: Device | null;
  allDevices: Device[];
  value: number | null; // Holds the float value from BLE device
  isScanning: boolean;
  stopScanning(): void;
}

function useBLE(): BluetoothLowEnergyApi {
  const bleManager = useMemo(() => new BleManager(), []);
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [value, setValue] = useState<number | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  // --- Subscription ref ---
  const characteristicSubscription = useRef<Subscription | null>(null);

  // Permissions for Android 31+
  const requestAndroid31Permissions = async () => {
    console.log("Requesting Android 31+ permissions...");
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Scan Permission",
        message: "Bluetooth Low Energy requires scan permission",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permission",
        message: "Bluetooth Low Energy requires connect permission",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires location permission",
        buttonPositive: "OK",
      }
    );

    const granted =
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted";

    console.log("Android 31+ permissions granted:", granted);
    return granted;
  };

  // General permission request
  const requestPermissions = async (): Promise<boolean> => {
    console.log("Requesting permissions...");
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        console.log("Android <31 location permission granted:", granted === PermissionsAndroid.RESULTS.GRANTED);
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        return await requestAndroid31Permissions();
      }
    } else {
      console.log("Non-Android platform, permissions assumed granted");
      return true;
    }
  };

  const isDuplicateDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex((device) => nextDevice.id === device.id) > -1;

  // Stop any ongoing scan
  const stopScanning = () => {
    console.log("Stopping BLE scan...");
    bleManager.stopDeviceScan();
    setIsScanning(false);
  };

  // Start scanning with safety checks and debug logs
  const scanForPeripherals = async () => {
    try {
      console.log("Checking BLE adapter state before scan...");
      const state = await bleManager.state();

      console.log("Current BLE state:", state);
      if (state !== State.PoweredOn) {
        console.warn("Bluetooth adapter not powered on. Scan aborted.");
        setIsScanning(false);
        return;
      }

      // Stop previous scan before starting new
      if (isScanning) {
        console.log("Scan already in progress, stopping it first...");
        stopScanning();
        // Wait a bit before new scan
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setAllDevices([]); // Reset device list
      setIsScanning(true);
      console.log("Starting device scan...");

      bleManager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error("Scan error:", error);
          stopScanning();
          return;
        }
        if (device && device.name?.includes("ESP32")) {
          setAllDevices((prevState) => {
            if (!isDuplicateDevice(prevState, device)) {
              console.log("Discovered device:", device.name, device.id);
              return [...prevState, device];
            }
            return prevState;
          });
        }
      });
    } catch (err) {
      console.error("Exception during scanForPeripherals:", err);
      setIsScanning(false);
    }
  };

  const connectToDevice = async (device: Device) => {
    try {
      console.log("Connecting to device:", device.name || device.id);
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      stopScanning();

      // Remove any old subscription
      if (characteristicSubscription.current) {
        characteristicSubscription.current.remove();
        characteristicSubscription.current = null;
      }
      // Start streaming new data
      startStreamingData(deviceConnection);
    } catch (e) {
      console.error("FAILED TO CONNECT", e);
    }
  };

  const disconnectFromDevice = () => {
    if (connectedDevice) {
      console.log("Disconnecting device:", connectedDevice.name || connectedDevice.id);
      // Remove the characteristic subscription first
      if (characteristicSubscription.current) {
        characteristicSubscription.current.remove();
        characteristicSubscription.current = null;
      }
      bleManager.cancelDeviceConnection(connectedDevice.id);
      setConnectedDevice(null);
      setValue(null);
    }
  };
  
  const onValueUpdate = (
    error: BleError | null,
    characteristic: Characteristic | null
  ) => {
    if (error) {
      // Filter out expected "Operation was cancelled" errors
      if (
        error.message === "Operation was cancelled" ||
        error.errorCode === 201
      ) {
        // Silently ignore, or you can log at debug level if desired
        return;
      }
      // Log other errors
      console.error("Characteristic update error:", error);
      return;
    }
    if (!characteristic?.value) {
      console.warn("No data received from characteristic");
      return;
    }
    const raw = base64.decode(characteristic.value);
    const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
    if (bytes.length >= 4) {
      const dataView = new DataView(bytes.buffer);
      const floatVal = dataView.getFloat32(0, true);
      setValue(floatVal);
    } else {
      setValue(null);
    }
  };

  const startStreamingData = async (device: Device) => {
    if (!device) {
      console.warn("No device connected, cannot start streaming");
      return;
    }
    console.log("Starting to monitor characteristic for streaming data...");

    // Remove old subscription if any
    if (characteristicSubscription.current) {
      characteristicSubscription.current.remove();
      characteristicSubscription.current = null;
    }
    // Create new subscription and store ref
    characteristicSubscription.current = device.monitorCharacteristicForService(
      SERVICE_UUID,
      CHARACTERISTIC_UUID,
      onValueUpdate
    );
  };

  // Cleanup on unmount: stop scans, disconnect, remove characteristic subscription
  useEffect(() => {
    return () => {
      console.log("Cleanup on unmount: stopping scan, disconnecting, removing char subscription...");
      bleManager.stopDeviceScan();
      if (connectedDevice) {
        bleManager.cancelDeviceConnection(connectedDevice.id);
      }
      // Remove the characteristic subscription
      if (characteristicSubscription.current) {
        characteristicSubscription.current.remove();
        characteristicSubscription.current = null;
      }
    };
  }, [bleManager, connectedDevice]);

  return {
    requestPermissions,
    scanForPeripherals,
    connectToDevice,
    disconnectFromDevice,
    connectedDevice,
    allDevices,
    value,
    isScanning,
    stopScanning,
  };
}

export default useBLE;
