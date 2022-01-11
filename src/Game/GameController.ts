import Konva from "konva";
import { Circle, CircleGame } from "./Model/game";

const CONSTANTS = {
  defaultCircleReadyColor: "#ffea00",
  defaultCircleTouchedColor: "#00e676",
};
export interface GameControllerState {
  gameModel: CircleGame;
  mainLayer?: Konva.Layer;
}

const initialGameState = {
  gameModel: new CircleGame(),
};

export class GameController {
  state: GameControllerState;

  constructor(state?: GameControllerState) {
    console.log("Creating new instance of gamecontroller");
    this.state = state ?? initialGameState;
  }

  setup(gameLayer: Konva.Layer) {
    this.state.mainLayer = gameLayer;
  }

  getLayer() {
    if (!this.state.mainLayer) throw new Error("Main Layer is not yet setup");
    return this.state.mainLayer;
  }

  addNewCircle() {
    const circle: Circle = new Circle({
      renderizationMetadata: {
        x: window.innerWidth / 2,
        y: window.innerHeight / 2,
        radius: 30,
        strokeWidth: 10,
      },
    });
    this.state.gameModel.addCircle(circle);
    this.renderCircle(circle);
  }

  resetLayer() {
    this.getLayer().destroyChildren();
  }

  resetGame() {
    this.state.gameModel.resetGame();
    this.renderAllCircles();
  }

  resetCirclesState() {
    this.state.gameModel.resetCirclesState();
    this.renderAllCircles();
  }

  doColisionEffect(shape: Konva.Group, circle: Circle) {
    shape.to({
      scaleY: 1.5,
      scaleX: 1.5,
      duration: 0.3,
      onFinish: () => {
        shape.to({
          scaleY: 1.0,
          scaleX: 1.0,
          duration: 0,
        });
      },
    });

    const circleShape: any = shape
      .getChildren()
      .find((s) => s.getClassName() === Konva.Circle.name);

    const originalStrokeWidth = circleShape.attrs.strokeWidth;
    circleShape.to({
      fill: CONSTANTS.defaultCircleTouchedColor,
      strokeWidth: 0,
      duration: 0.1,
      onFinish: () => {
        circleShape.to({
          strokeWidth: originalStrokeWidth,
        });
      },
    });
  }

  renderAllCircles() {
    this.resetLayer();
    this.state.gameModel.circles.map((circle) => this.renderCircle(circle));
  }

  renderCircle(circle: Circle) {
    const groupShape: Konva.Group = new Konva.Group({
      key: `circle_group_${circle.number}`,
      id: `${circle.number}`,
      x: circle.renderizationMetadata.x,
      y: circle.renderizationMetadata.y,
      draggable: true,
      rotation: circle.renderizationMetadata.rotation,
      scaleX: circle.renderizationMetadata.scaleX,
      scaleY: circle.renderizationMetadata.scaleY,
    });

    const circleText: Konva.Text = new Konva.Text({
      x:
        circle.renderizationMetadata.x / window.innerWidth -
        circle.renderizationMetadata.radius * 0.2,
      y:
        circle.renderizationMetadata.y / window.innerHeight -
        circle.renderizationMetadata.radius * 0.3,
      text: String(circle.number),
      fontSize: circle.renderizationMetadata.radius * 0.8,
      fontStyle: "bold",
      fill: "white",
      verticalAlign: "middle",
      align: "center",
    });

    const circleShape: Konva.Circle = new Konva.Circle({
      key: `circle_${circle.number}`,
      id: `${String(circle.number)}`,
      x: circle.renderizationMetadata.x / window.innerWidth,
      y: circle.renderizationMetadata.y / window.innerHeight,
      radius: circle.renderizationMetadata.radius,
      fill: CONSTANTS.defaultCircleReadyColor,
      strokeWidth: circle.renderizationMetadata.strokeWidth,
      stroke: "white",
    });

    groupShape.add(circleShape);
    groupShape.add(circleText);

    // Events
    groupShape.on("dragend", (event: any) => {
      const x: any = event.target.attrs.x;
      const y: any = event.target.attrs.y;
      circle.updateRenderizationMetadata({
        ...circle.renderizationMetadata,
        x,
        y,
      });
    });

    groupShape.on("click", (e) => {
      const newRadius = Number(circleShape.attrs.radius) * 1.1;
      const newStrokeWidth = circleShape.attrs.strokeWidth * 1.1;
      circle.updateRenderizationMetadata({
        x: circle.renderizationMetadata.x,
        y: circle.renderizationMetadata.y,
        radius: newRadius,
        strokeWidth: newStrokeWidth,
      });
      circleShape.setAttrs({
        radius: newRadius,
        strokeWidth: newStrokeWidth,
      });
      circleText.setAttrs({
        fontSize: circleText.attrs.fontSize * 1.1,
        x: circleText.attrs.x * 1.1,
        y: circleText.attrs.y * 1.1,
      });
    });
    this.getLayer().add(groupShape);
  }

  checkColisions(results: any, onColision?: () => void) {
    const layer = this.getLayer();
    const allNonTouchedCircles = this.state.gameModel.circles.filter(
      (c) => !c.touched
    );

    for (const circle of allNonTouchedCircles) {
      const renderedGroup: any = layer
        .getChildren()
        .find((group) => Number(group.attrs.id) === circle.number);
      if (!renderedGroup) {
        continue;
      }

      if (
        results.poseLandmarks ||
        results.rightHandLandmarks ||
        results.leftHandLandmarks
      ) {
        const defaultPointRadius = 5;
        const poseLandmarks = results.poseLandmarks || [];
        for (let posePoint of [...poseLandmarks]) {
          const x = posePoint.x * window.innerWidth;
          const y = posePoint.y * window.innerHeight;

          if (circle.didColide(x, y, defaultPointRadius) && !circle.touched) {
            circle.touch();
            this.doColisionEffect(renderedGroup, circle);
            if (onColision) onColision();
            break;
          }
        }
      }
    }
  }
}
