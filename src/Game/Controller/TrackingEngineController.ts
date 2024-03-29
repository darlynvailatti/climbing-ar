import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Holistic } from "@mediapipe/holistic";
import { Pose } from "@mediapipe/pose";

export interface TrackingEngineState {
  camera?: Camera
  outputCanvas?: HTMLCanvasElement;
  trackingEngine?: Holistic;
}

export enum TrackingEngineActionType { }

export interface TrackingEngineAction {
  type: TrackingEngineActionType;
}

export const inititalGameState: TrackingEngineState = {};

export const defaultPosePointRadius = 10;

export class TrackingEngineController {
  state: TrackingEngineState;

  constructor() {
    this.state = inititalGameState;
  }

  setup(outputCanvas: HTMLCanvasElement) {
    this.state.outputCanvas = outputCanvas;
  }

  loadTrackingEngine(onResults: (results: any) => void) {
    this.state.trackingEngine = new Holistic({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
      },
    });
    this.state.trackingEngine.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      enableSegmentation: false,
      smoothSegmentation: true,
      refineFaceLandmarks: false,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5
    });
    this.state.trackingEngine.onResults(onResults);
  }

  closeTracking() {
    if (!this.state.trackingEngine) {
      this.throwTrackingEngineNotLoaded();
      return;
    }
    this.state.trackingEngine.close();
  }

  refreshInputDevice() {
    if (this.state.trackingEngine) {
      this.state.trackingEngine.close();
    }
  }

  async setupTrackingCamera(inputVideo: HTMLVideoElement) {
    console.info("Loading Holistic Camera, input = ", inputVideo);
    this.state.camera = new Camera(inputVideo, {
      facingMode: 'environment',
      onFrame: async () => {
        if (!this.state.trackingEngine) {
          this.throwTrackingEngineNotLoaded();
          return;
        }
        await this.state.trackingEngine.send({ image: inputVideo });
      },
    });
    await this.state.camera.start();
  }

  renderMarks(
    canvasContext: CanvasRenderingContext2D,
    poses: any,
    options: any
  ) {
    drawLandmarks(canvasContext, poses, options);
  }

  renderConnectors(
    canvasContext: CanvasRenderingContext2D,
    poses: any,
    connections: any,
    options: any
  ) {
    drawConnectors(canvasContext, poses, connections, options);
  }

  throwTrackingEngineNotLoaded() {
    throw new Error("Tracking engine is not loaded yet");
  }
}
