export interface AppGlobalState {
  selectedDeviceId?: string;
  availableDevices: Array<MediaDeviceInfo>;
  showCamera: boolean;
  showTrackingLandmakrs: boolean;
  enableTracking: boolean;
  loading: boolean;
}

export const initialAppGlobalState: AppGlobalState = {
  showCamera: false,
  showTrackingLandmakrs: false,
  enableTracking: false,
  loading: false,
  availableDevices: [],
  selectedDeviceId: "",
};

export class AppController {
  state: AppGlobalState;

  constructor() {
    this.state = initialAppGlobalState;
  }

  toggleCamera() {
    this.state.showCamera = !this.state.showCamera;
  }

  toggleTrackingLandmarks() {
    this.state.showTrackingLandmakrs = !this.state.showTrackingLandmakrs;
  }

  toggleTracking() {
    this.state.enableTracking = !this.state.enableTracking;
  }

  toggleLoading() {
    this.state.loading = !this.state.loading;
  }

  setDeviceId(deviceId: string) {
    this.state.selectedDeviceId = deviceId;
  }

  setAvailableMediaDevices(devices: Array<MediaDeviceInfo>) {
    this.state.availableDevices = devices;
  }
}
