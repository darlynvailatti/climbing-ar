import Konva from "konva";
import { IFrame } from "konva/lib/types";
import { Circle, CircleGame } from "./Model/game";

const CONSTANTS = {
  defaultCircleReadyColor: "#ffea00",
  defaultCircleTouchedColor: "#00e676",
};
export interface GameControllerState {
  gameModel: CircleGame;
  mainLayer?: Konva.Layer;
  defaultCircleAnimation?: Konva.Animation;
}

const initialGameState: GameControllerState = {
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
    this.renderScore();
  }

  resetLayer() {
    this.getLayer().destroyChildren();
  }

  refreshAllNodes() {
    this.resetLayer();
    this.renderAllCircles();
    this.renderScore();
  }

  renderScore() {
    const renderedScore = this.getLayer()
      .getChildren()
      .find((c) => c.attrs.key === "score");

    if (!renderedScore) {
      const scoreModel = this.state.gameModel.score;
      const scoreText = new Konva.Text({
        key: "score",
        text: `${this.state.gameModel.score.value}`,
        fill: "white",
        fontSize: 70,
        fontVariant: "bold",
        draggable: true,
        x: scoreModel.renderizationMeta.x,
        y: scoreModel.renderizationMeta.y,
      });
      scoreText.on("dragend", (event: any) => {
        const x: any = event.target.attrs.x;
        const y: any = event.target.attrs.y;
        scoreModel.updateRenderizationMeta({
          ...scoreModel.renderizationMeta,
          x,
          y,
        });
      });
      this.getLayer().add(scoreText);
    } else {
      renderedScore.setAttr("text", this.state.gameModel.score.value);
    }
  }

  getLayer() {
    if (!this.state.mainLayer) throw new Error("Main Layer is not yet setup");
    return this.state.mainLayer;
  }

  getDefaultCircleAnimation(): Konva.Animation {
    const animation = (frame: any) => {
      var period = 2000;

      var scale = Math.abs(Math.sin((frame.time * 2 * Math.PI) / period));

      for (let circle of this.state.gameModel.circles) {
        if (!circle.number) continue;
        const renderedCircleGroup: Konva.Group = this.getCircleGroupById(
          circle.number
        );

        if (!circle.touched) {
          renderedCircleGroup.setAttr("opacity", scale);
        } else {
          renderedCircleGroup.setAttr("opacity", 100);
        }
      }
    };

    if (!this.state.defaultCircleAnimation)
      this.state.defaultCircleAnimation = new Konva.Animation(
        animation,
        this.getLayer()
      );
    else {
      this.state.defaultCircleAnimation.func = animation;
    }

    return this.state.defaultCircleAnimation;
  }

  start() {
    this.state.gameModel.start();
    this.getDefaultCircleAnimation().start();
  }

  stop() {
    this.state.gameModel.stop();
    this.getDefaultCircleAnimation().stop();
    this.refreshAllNodes();
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

  resetGame() {
    this.state.gameModel.resetGame();
    this.stop();
  }

  resetCirclesState() {
    this.state.gameModel.resetCirclesState();
    this.refreshAllNodes();
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
      fill: circle.touched
        ? CONSTANTS.defaultCircleTouchedColor
        : CONSTANTS.defaultCircleReadyColor,
      strokeWidth: circle.renderizationMetadata.strokeWidth,
      stroke: "white",
    });

    groupShape.add(circleShape);
    groupShape.add(circleText);

    // Events
    groupShape.on("dragend", (event: any) => {
      const x: any = event.target.attrs.x;
      const y: any = event.target.attrs.y;
      const updateCallback = (circle: Circle) => {
        circle.updateRenderizationMetadata({
          ...circle.renderizationMetadata,
          x,
          y,
        });
      };
      this.state.gameModel.updateCircle(circle, updateCallback);
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

  getCircleGroupById(id: number): any {
    return this.getLayer()
      .getChildren()
      .find((group) => Number(group.attrs.id) === id);
  }

  checkColisions(results: any, onColision?: () => void) {
    if (!this.state.gameModel.isStarted) {
      return;
    }

    const allNonTouchedCircles = this.state.gameModel.circles.filter(
      (c) => !c.touched
    );

    for (const circle of allNonTouchedCircles) {
      if (!circle.number) continue;

      const renderedGroup: any = this.getCircleGroupById(circle.number);
      if (!renderedGroup) {
        continue;
      }

      if (results.poseLandmarks) {
        const defaultPointRadius = 2;
        const poseLandmarks = results.poseLandmarks || [];
        for (let posePoint of [...poseLandmarks]) {
          const x = posePoint.x * window.innerWidth;
          const y = posePoint.y * window.innerHeight;

          if (circle.didColide(x, y, defaultPointRadius)) {
            this.state.gameModel.touch(circle);
            this.doColisionEffect(renderedGroup, circle);
            this.renderScore();
            if (onColision) onColision();
            break;
          }
        }
      }
    }
  }
}
