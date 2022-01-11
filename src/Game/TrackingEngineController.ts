import { Camera } from "@mediapipe/camera_utils";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";
import { Pose } from "@mediapipe/pose";

export interface TrackingEngineState {
  outputCanvas?: HTMLCanvasElement;
  trackingEngine?: Pose;
}

export enum TrackingEngineActionType {}

export interface TrackingEngineAction {
  type: TrackingEngineActionType;
}

export const inititalGameState: TrackingEngineState = {};

export class TrackingEngineController {
  state: TrackingEngineState;

  constructor() {
    this.state = inititalGameState;
  }

  setup(outputCanvas: HTMLCanvasElement) {
    this.state.outputCanvas = outputCanvas;
  }

  loadTrackingEngine(onResults: (results: any) => void) {
    this.state.trackingEngine = new Pose({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
      },
    });
    this.state.trackingEngine.setOptions({
      modelComplexity: 1,
      smoothLandmarks: true,
      minDetectionConfidence: 0.2,
      minTrackingConfidence: 0.2,
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

  async setupTrackingCamera(inputVideo: HTMLVideoElement) {
    console.debug("Loading Holistic Camera...");
    const camera = new Camera(inputVideo, {
      onFrame: async () => {
        if (!this.state.trackingEngine) {
          this.throwTrackingEngineNotLoaded();
          return;
        }
        await this.state.trackingEngine.send({ image: inputVideo });
      },
    });
    await camera.start();
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
