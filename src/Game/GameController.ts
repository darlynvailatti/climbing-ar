import Konva from "konva";
import { Circle } from "./Model/circle";
import { CircleGame } from "./Model/game";
import { defaultPosePointRadius } from "./TrackingEngineController";

const CONSTANTS = {
  defaultCircleReadyColor: "#ffea00",
  defaultCircleTouchedColor: "#00e676",
};
export interface GameControllerState {
  gameModel: CircleGame;
  mainLayer?: Konva.Layer;
  defaultCircleAnimation?: Konva.Animation;
  defaultStartCheckpointAnimation?: Konva.Animation;
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
    this.renderStartCheckpoint();
  }

  resetLayer() {
    this.getLayer().destroyChildren();
  }

  refreshAllNodes() {
    this.resetLayer();
    this.renderAllCircles();
    this.renderScore();
    this.renderStartCheckpoint();
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

  getDefaultStartCheckpointAnimation(): Konva.Animation {
    const animation = (frame: any) => {
      var period = 2000;

      var scale = Math.abs(Math.sin((frame.time * 2 * Math.PI) / period));

      const startCheckPointRendered = this.getStartCheckpointByKey();

      if (!startCheckPointRendered) return;
      startCheckPointRendered.setAttr("opacity", scale);
      startCheckPointRendered.setAttr('fill', 'red')
    };

    if (!this.state.defaultStartCheckpointAnimation)
      this.state.defaultStartCheckpointAnimation = new Konva.Animation(
        animation,
        this.getLayer()
      );
    else {
      this.state.defaultStartCheckpointAnimation.func = animation;
    }

    return this.state.defaultStartCheckpointAnimation;
  }

  start() {
    this.state.gameModel.start();
    this.getDefaultCircleAnimation().start();
    this.getDefaultStartCheckpointAnimation().start();
  }

  stop() {
    this.state.gameModel.stop();
    this.getDefaultCircleAnimation().stop();
    this.getDefaultStartCheckpointAnimation().stop();
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

  doCircleColisionEffect(shape: Konva.Group, circle: Circle) {
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

  doStartCheckPointTouchEffetc() {
    const startCheckPointRendered = this.getStartCheckpointByKey();
    if (!startCheckPointRendered) return
    function pulse(startCheckPointRendered: any, state: GameController) {
      const startCheckpoint = state.state.gameModel.startCheckpoint;
      if (!startCheckpoint.touched || state.state.gameModel.isStarted) return

      startCheckPointRendered.to({
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 0.1,
        easing: Konva.Easings.EaseInOut,
        fill: 'white',
        onFinish: () => {
          startCheckPointRendered.to({
            scaleX: 1,
            scaleY: 1,
            duration: 0.1,
            easing: Konva.Easings.EaseInOut,
            fill: 'red',
            onFinish: () => {
              // Call the pulse function again to repeat the animation
              pulse(startCheckPointRendered, state);
            }
          });
        }
      });
    }

    pulse(startCheckPointRendered, this)
  }

  doStartCheckPointUntouchEffetc() {
    const startCheckPointRendered = this.getStartCheckpointByKey();
    startCheckPointRendered?.to({
      scaleX: 1.0,
      scaleY: 1.0,
      duration: 0.2,
      fill: 'white'
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
      fontVariant: "bold",
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

  renderScore() {
    const layer = this.getLayer();
    const renderedScore = this.getLayer()
      .getChildren()
      .find((c) => c.attrs.key === "score_value_text");

    const renderedTotalTime = this.getLayer()
    .getChildren()
    .find((c) => c.attrs.key === "score_total_time");
  
    if (!renderedScore) {
      console.log("Rendering score...");
      const scoreModel = this.state.gameModel.score;

      const scoreLabelText = new Konva.Text({
        key: "score_label_text",
        x: scoreModel.renderizationMeta.x,
        y: scoreModel.renderizationMeta.y,
        fill: "white",
        fontSize: 30,
        fontVariant: "bold",
        text: "Score",
        draggable: true,
        offsetY: 30,
        offsetX: -5,
      });

      const scoreValueText = new Konva.Text({
        key: "score_value_text",
        text: `${this.state.gameModel.score.value}`,
        fill: "white",
        fontSize: 70,
        fontVariant: "bold",
        x: scoreModel.renderizationMeta.x,
        y: scoreModel.renderizationMeta.y,
        draggable: true,
      });

      const onDragMove = (event: any) => {
        const x: any = event.target.attrs.x;
        const y: any = event.target.attrs.y;
        scoreModel.updateRenderizationMeta({
          ...scoreModel.renderizationMeta,
          x,
          y,
        });
        scoreValueText.setAttr("x", x);
        scoreValueText.setAttr("y", y);

        scoreLabelText.setAttr("x", x);
        scoreLabelText.setAttr("y", y);
      };

      scoreLabelText.on("dragmove", onDragMove);
      scoreValueText.on("dragmove", onDragMove);
      layer.add(scoreValueText, scoreLabelText);
    } else {
      renderedScore.setAttr("text", this.state.gameModel.score.value);
    }

    if(!renderedTotalTime){
      const scoreModel = this.state.gameModel.score;
     
      const scoreTotalTimeLabelText = new Konva.Text({
        key: "score_total_time_label_text",
        x: scoreModel.renderizationMeta.x,
        y: scoreModel.renderizationMeta.y,
        fill: "white",
        fontSize: 30,
        fontVariant: "bold",
        text: "Total time",
        draggable: true,
        offsetY: 110,
        offsetX: -5,
      });

      const scoreTotalTime = new Konva.Text({
        key: "score_total_time",
        x: scoreModel.renderizationMeta.x,
        y: scoreModel.renderizationMeta.y,
        fill: "white",
        fontSize: 30,
        fontVariant: "bold",
        text: `${this.state.gameModel.getTotalTime()}`,
        draggable: true,
        offsetY: 70,
        offsetX: -5,
      });


      const onDragMove = (event: any) => {
        const x: any = event.target.attrs.x;
        const y: any = event.target.attrs.y;
        scoreModel.updateRenderizationMeta({
          ...scoreModel.renderizationMeta,
          x,
          y,
        });
        scoreTotalTime.setAttr("x", x);
        scoreTotalTime.setAttr("y", y);

        scoreTotalTimeLabelText.setAttr("x", x);
        scoreTotalTimeLabelText.setAttr("y", y);
      };
      scoreTotalTime.on("dragmove", onDragMove);
      scoreTotalTimeLabelText.on("dragmove", onDragMove);
      layer.add(scoreTotalTime, scoreTotalTimeLabelText);
    }else{
      renderedTotalTime.setAttr("text", this.state.gameModel.getTotalTime());
    }
  }

  renderStartCheckpoint() {
    const layer = this.getLayer();
    const startCheckPointRendered = this.getStartCheckpointByKey();

    if (!startCheckPointRendered) {
      const startCheckpoint = this.state.gameModel.startCheckpoint;
      const elipse = new Konva.Circle({
        key: "start_checkpoint",
        x: startCheckpoint.renderizationMeta.x,
        y: startCheckpoint.renderizationMeta.y,
        radius: startCheckpoint.renderizationMeta.radius,
        fill: "white",
        draggable: true,
      });

      elipse.on("dragend", (event: any) => {
        const x: any = event.target.attrs.x;
        const y: any = event.target.attrs.y;
        startCheckpoint.updateRenderizationMeta({
          ...startCheckpoint.renderizationMeta,
          x,
          y,
        });
      });

      elipse.on('click', (event: any) => {
        const newRadius = Number(elipse.attrs.radius) * 1.1
        elipse.setAttr('radius', newRadius)
        startCheckpoint.updateRenderizationMeta({
          ...startCheckpoint.renderizationMeta,
          radius: newRadius
        });
      })

      layer.add(elipse);
    }
  }

  getCircleGroupById(id: number): any {
    return this.getLayer()
      .getChildren()
      .find((group) => Number(group.attrs.id) === id);
  }

  getStartCheckpointByKey() {
    return this.getLayer()
      .getChildren()
      .find((c) => c.attrs.key === "start_checkpoint");
  }

  checkCircleColisions(results: any, callBack?: () => void) {
    if (!this.state.gameModel.isStarted) {
      return;
    }

    const allNonTouchedCircles = this.state.gameModel.circles.filter(
      (c) => !c.touched
    );

    allNonTouchedCircles.forEach((circle) => {
      if (!circle.number) return;

      const renderedGroup: any = this.getCircleGroupById(circle.number);
      if (!renderedGroup) {
        return;
      }

      const poseLandmarks = results.poseLandmarks || [];
      const rightHandLandmarks = results.rightHandLandmarks || [];
      const lefttHandLandmarks = results.leftHandLandmarks || [];

      for (let posePoint of [...poseLandmarks, ...rightHandLandmarks, ...lefttHandLandmarks]) {
        const x = posePoint.x * window.innerWidth;
        const y = posePoint.y * window.innerHeight;

        if (circle.didColide(x, y, defaultPosePointRadius)) {
          this.state.gameModel.touch(circle);
          this.doCircleColisionEffect(renderedGroup, circle);
          if (callBack) callBack();
          return;
        }
      }
    })
  }

  checkStartCheckpointColision(results: any, callBack?: () => void) {
    const startCheckpoint = this.state.gameModel.startCheckpoint;
    const poseLandmarks = results.poseLandmarks || [];
    const rightHandLandmarks = results.rightHandLandmarks || [];
    const lefttHandLandmarks = results.leftHandLandmarks || [];

    let didColide = false;

    for (let posePoint of [...poseLandmarks, ...rightHandLandmarks, ...lefttHandLandmarks]) {
      const x = posePoint.x * window.innerWidth;
      const y = posePoint.y * window.innerHeight;
      if (startCheckpoint.didColide(x, y, defaultPosePointRadius)) {
        didColide = true;
        if (!startCheckpoint.touched) {
          startCheckpoint.setTouched();
          this.doStartCheckPointTouchEffetc();
        }
        break;
      }
    }

    if (!didColide && startCheckpoint.touched) {
      startCheckpoint.setUntouched();
      this.doStartCheckPointUntouchEffetc();
      const startCheckPointRendered = this.getStartCheckpointByKey();
      startCheckPointRendered?.to({
        scaleX: 1,
        scaleY: 1,
        duration: 0.2,
        fill: 'white'
      });
    }
    startCheckpoint.checkTrigger();
  }
}
