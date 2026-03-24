export type PodStatus = 'disconnected' | 'connecting' | 'connected';

let _podStatus: PodStatus = 'disconnected';
let _batteryLevel = 82;
const listeners: Array<(status: PodStatus) => void> = [];

function notify(status: PodStatus) {
  _podStatus = status;
  listeners.forEach((l) => l(status));
}

export const BluetoothMock = {
  get podStatus(): PodStatus {
    return _podStatus;
  },
  get batteryLevel(): number {
    return _batteryLevel;
  },
  get isConnected(): boolean {
    return _podStatus === 'connected';
  },
  connect(): Promise<void> {
    if (_podStatus === 'connected') return Promise.resolve();
    notify('connecting');
    return new Promise((resolve) => {
      setTimeout(() => {
        notify('connected');
        resolve();
      }, 1500);
    });
  },
  disconnect(): void {
    notify('disconnected');
  },
  onStatusChange(listener: (status: PodStatus) => void): () => void {
    listeners.push(listener);
    return () => {
      const idx = listeners.indexOf(listener);
      if (idx >= 0) listeners.splice(idx, 1);
    };
  },
};
