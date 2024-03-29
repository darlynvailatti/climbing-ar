export interface AppGlobalState {
  detectColisions: boolean;
  selectedDeviceId?: string;
  availableDevices: Array<MediaDeviceInfo>;
  showCamera: boolean;
  showTrackingLandmakrs: boolean;
  trackingEnabled: boolean;
  loading: boolean;
}

export const initialAppGlobalState: AppGlobalState = {
  showCamera: false,
  showTrackingLandmakrs: true,
  trackingEnabled: false,
  loading: false,
  availableDevices: [],
  selectedDeviceId: "",
  detectColisions: true
};

export class AppController {

  state: AppGlobalState;

  constructor() {
    this.state = initialAppGlobalState;
  }

  toggleColisionDetection() {
    this.state.detectColisions = !this.state.detectColisions
  }

  toggleCamera() {
    this.state.showCamera = !this.state.showCamera;
  }

  toggleTrackingLandmarks() {
    this.state.showTrackingLandmakrs = !this.state.showTrackingLandmakrs;
  }

  toggleTracking() {
    this.state.trackingEnabled = !this.state.trackingEnabled;
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

  isTrakingEnable() {
    return this.state.trackingEnabled;
  }

  getShowCamera() {
    return this.state.showCamera;
  }

  getShowTrackingLandmakrs() {
    return this.state.showTrackingLandmakrs;
  }

  getDetectColision() {
    return this.state.detectColisions
  }

}
