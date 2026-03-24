import { create } from 'zustand';
import { BluetoothMock, PodStatus } from '../services/bluetooth.mock';

interface BluetoothState {
  podStatus: PodStatus;
  batteryLevel: number;
  isConnected: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

export const useBluetoothStore = create<BluetoothState>((set) => ({
  podStatus: BluetoothMock.podStatus,
  batteryLevel: BluetoothMock.batteryLevel,
  isConnected: BluetoothMock.isConnected,
  connect: async () => {
    await BluetoothMock.connect();
    set({
      podStatus: BluetoothMock.podStatus,
      isConnected: BluetoothMock.isConnected,
    });
  },
  disconnect: () => {
    BluetoothMock.disconnect();
    set({ podStatus: 'disconnected', isConnected: false });
  },
}));
