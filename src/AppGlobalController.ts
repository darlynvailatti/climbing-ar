export interface AppGlobalState {
  selectedDeviceId?: string;
  availableDevices: Array<MediaDeviceInfo>;
  showCamera: boolean;
  showTrackingLandmakrs: boolean;
  enableTracking: boolean;
  loading: boolean;
}

export enum AppGlobalActionType {
  TOGGLE_CAMERA = "toggleCamera",
  TOGGLE_TRACKING_LANDMARKS = "toggleTrackingLandmakrs",
  TOGGLE_TRACKING = "toggleTracking",
  TOGGLE_LOADING = "toggleLoading",
}

export interface AppGlobalAction {
  type: AppGlobalActionType;
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

  dispatch(action: AppGlobalAction) {
    switch (action.type) {
      case AppGlobalActionType.TOGGLE_CAMERA:
        return this.toggleCamera();
      case AppGlobalActionType.TOGGLE_TRACKING_LANDMARKS:
        return this.toggleTrackingLandmarks();
      case AppGlobalActionType.TOGGLE_TRACKING:
        return this.toggleTracking();
      case AppGlobalActionType.TOGGLE_LOADING:
        return this.toggleLoading();
      default:
        throw new Error(`There is mapped action ${action.type}`);
    }
  }
}
