import React, { createContext, useContext } from "react";
import useBLE from "./useBLE";

// 1. The type should match what useBLE returns:
type BluetoothContextType = ReturnType<typeof useBLE>;

// 2. Create the context:
const BluetoothContext = createContext<BluetoothContextType | null>(null);

// 3. Create the provider (no UI, just provides context)
export const BluetoothProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const ble = useBLE(); // This holds all your BLE state and methods

  return (
    <BluetoothContext.Provider value={ble}>
      {children}
    </BluetoothContext.Provider>
  );
};

// 4. Export a hook for easy use:
export function useBluetooth() {
  const context = useContext(BluetoothContext);
  if (!context) throw new Error("useBluetooth must be used within a BluetoothProvider");
  return context;
}
