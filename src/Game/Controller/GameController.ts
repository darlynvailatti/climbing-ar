import Konva from "konva";
import { Circle } from "../Model/circle";
import { CircleGame } from "../Model/game";
import { defaultPosePointRadius } from "./TrackingEngineController";
import { CircleInteractionEvent, CircleRemovedEvent, CircleTouchedEvent, GameControllerCallbackEvents } from "./types";

const CONSTANTS = {
  defaultCircleReadyColor: "#ffea00",
  defaultCircleTouchedColor: "#00e676",
  startCheckpointCircleNumber: -1
};

export interface GameKeyboard {
  decreaseKeyIsPressed: boolean
  removeKeyIsPressed: boolean
}

export interface GameControllerState {
  gameModel: CircleGame;
  mainLayer?: Konva.Layer;
  defaultCircleAnimation?: Konva.Animation;
  defaultStartCheckpointAnimation?: Konva.Animation;
  callbackEvents?: GameControllerCallbackEvents
  scoreUpdater?: NodeJS.Timer
  keyboard?: GameKeyboard
}

export const initialGameState: GameControllerState = {
  gameModel: new CircleGame(),
};

export class GameController {
  state: GameControllerState;

  constructor(state?: GameControllerState) {
    console.log("Creating new instance of gamecontroller");
    this.state = state ?? initialGameState;
  }

  setup(gameLayer: Konva.Layer, callbackEvents?: GameControllerCallbackEvents) {
    this.state.mainLayer = gameLayer;
    this.state.callbackEvents = callbackEvents
    this.renderScore();
    this.renderStartCheckpoint();
    this.setupKeyboard()
  }

  setupKeyboard() {
    const state = this.state
    state.keyboard = {
      decreaseKeyIsPressed: false,
      removeKeyIsPressed: false
    }

    document.onkeydown = function (event) {

      if (!state.keyboard) return

      if (event.key === 'd') {
        state.keyboard.decreaseKeyIsPressed = true
      }

      if (event.key === 'r')
        state.keyboard.removeKeyIsPressed = true
    }

    document.onkeyup = function (event) {
      if (!state.keyboard) return
      if (event.key === 'd') {
        state.keyboard.decreaseKeyIsPressed = false
      }

      if (event.key === 'r')
        state.keyboard.removeKeyIsPressed = false
    }
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
      var period = 1000;

      var opacity = Math.abs(Math.sin((frame.time * 2 * Math.PI) / period));

      for (let circle of this.state.gameModel.circles) {
        if (!circle.number) continue;
        const renderedCircleGroup: Konva.Group = this.getCircleGroupById(
          circle.number
        );

        if (!circle.touched) {
          renderedCircleGroup.setAttr("opacity", opacity);
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
      var period = 1000;

      var opacity = Math.abs(Math.sin((frame.time * 2 * Math.PI) / period));

      const startCheckPointRendered = this.getStartCheckpointByKey();

      if (!startCheckPointRendered) return;
      startCheckPointRendered.setAttr("opacity", opacity);
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

    // Keep score up-to-date during execution
    this.state.scoreUpdater = setInterval(() => {
      this.renderScore()
    }, 0)


    if (this.state.callbackEvents?.onStart)
      this.state.callbackEvents?.onStart()
  }

  stop() {
    this.state.gameModel.stop();
    this.getDefaultCircleAnimation().stop();
    this.getDefaultStartCheckpointAnimation().stop();
    this.refreshAllNodes();

    // Stop score timer renderer
    clearInterval(this.state.scoreUpdater)

    if (this.state.callbackEvents?.onStop)
      this.state.callbackEvents?.onStop()
  }

  addNewCircle() {
    const circleNumber = this.state.gameModel.circles.length + 1
    const circle: Circle = new Circle(
      circleNumber,
      {
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

  removeCircle(circleNumber: number) {
    this.state.gameModel.removeCircle(circleNumber)
    const renderedCircle = this.getCircleGroupById(circleNumber)
    renderedCircle.destroy()

    if (this.state.callbackEvents?.onCircleRemoved)
      this.state.callbackEvents.onCircleRemoved({
        circleNumber
      })
  }

  resetGame() {
    console.log("Reseting game...")
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
      const isDecreaseKeyPressed = this.state.keyboard?.decreaseKeyIsPressed
      const isRemoveKeyPressed = this.state.keyboard?.removeKeyIsPressed

      if (isRemoveKeyPressed) {
        this.removeCircle(circle.number)
        return
      }

      const currentRadius = Number(circleShape.attrs.radius)
      const newRadius = isDecreaseKeyPressed ? currentRadius - (currentRadius * 0.1) : currentRadius * 1.1
      const newStrokeWidth = isDecreaseKeyPressed ?
        circleShape.attrs.strokeWidth - (0.1 * circleShape.attrs.strokeWidth)
        : circleShape.attrs.strokeWidth * 1.1

      if (newRadius <= 0 || newStrokeWidth <= 0) return

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
        fontSize: isDecreaseKeyPressed ? circleText.attrs.fontSize - (circleText.attrs.fontSize * 0.1) : circleText.attrs.fontSize * 1.1,
        x: isDecreaseKeyPressed ? circleText.attrs.x - (circleText.attrs.x * 0.1) : circleText.attrs.x * 1.1,
        y: isDecreaseKeyPressed ? circleText.attrs.y - (circleText.attrs.y * 0.1) : circleText.attrs.y * 1.1,
      });
    });

    this.getLayer().add(groupShape);
  }

  // renderLastCircleHand() {
  //   const lastCircleGroup = this.getCircleGroupById(this.state.gameModel.circles.length)

  //   // Only for the last circle
  //   var imageObj = new Image();
  //   imageObj.src = 'https://cdn-icons-png.flaticon.com/512/8611/8611457.png';

  //   imageObj.onload = () => {
  //     const key = 'circle_hand'
  //     const renderedHand = this.getLayer()
  //       .getChildren()
  //       .find((group) => group.attrs.key === key);

  //     const updatedProperties = {
  //       key,
  //       image: imageObj,
  //       x: lastCircleGroup.attrs.x / window.innerWidth,
  //       y: lastCircleGroup.attrs.y / window.innerHeight,
  //       width: 50,
  //       height: 50
  //     }
  //     if(renderedHand){
  //       console.log("Updating hand icon: ", updatedProperties)
  //       renderedHand.setAttrs(updatedProperties)
  //     }else{
  //       let rightHandImage: Konva.Image = new Konva.Image(updatedProperties)
  //       this.getLayer().add(rightHandImage)
  //       console.log("Creating hand icon: ", rightHandImage)
  //     }
  //   }
  // }

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

    if (!renderedTotalTime) {
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
    } else {
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

  touchCircle(circle: Circle) {
    const circleNumber = circle.number
    if (!circleNumber) return

    this.state.gameModel.touch(circle);

    const renderedGroup: any = this.getCircleGroupById(circleNumber);
    if (!renderedGroup) {
      return;
    }

    this.doCircleColisionEffect(renderedGroup, circle);
    if (this.state.callbackEvents?.onCircleTouched)
      this.state.callbackEvents?.onCircleTouched({
        circleNumber: circleNumber
      })
  }

  checkCircleColisions(results: any, callBack?: () => void) {
    if (!this.state.gameModel.isStarted) {
      return;
    }

    const allNonTouchedCircles = this.state.gameModel.circles.filter(
      (c) => !c.touched
    );

    // Session has ended
    if (allNonTouchedCircles.length === 0) {
      console.log("All circles were touched, session has ended")
      this.stop()
    }

    for(const circle of allNonTouchedCircles) {
      if (!circle.number) return;

      const poseLandmarks = results.poseLandmarks || [];
      const rightHandLandmarks = results.rightHandLandmarks || [];
      const lefttHandLandmarks = results.leftHandLandmarks || [];
      const isLastCircle = this.state.gameModel.circles.length === circle.number

      if (isLastCircle) {
        let didColideRightHand = false
        let didColideLeftHand = false

        for (let posePoint of [...rightHandLandmarks]) {
          const x = posePoint.x * window.innerWidth;
          const y = posePoint.y * window.innerHeight;
          if (circle.didColide(x, y, defaultPosePointRadius)) {
            didColideRightHand = true
            break
          }
        }

        for (let posePoint of [...lefttHandLandmarks]) {
          const x = posePoint.x * window.innerWidth;
          const y = posePoint.y * window.innerHeight;
          if (circle.didColide(x, y, defaultPosePointRadius)) {
            didColideLeftHand = true
            break
          }
        }

        if (didColideLeftHand && didColideRightHand) {
          this.touchCircle(circle)
          if (callBack) callBack();
          return;
        }

      } else {
        for (let posePoint of [...poseLandmarks, ...rightHandLandmarks, ...lefttHandLandmarks]) {
          const x = posePoint.x * window.innerWidth;
          const y = posePoint.y * window.innerHeight;

          if (circle.didColide(x, y, defaultPosePointRadius)) {



            this.touchCircle(circle)
            if (callBack) callBack();
            return;
          }
        }
      }
    }
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
    }

    startCheckpoint.checkTrigger();

    if (startCheckpoint.active) {
      this.resetGame()
    }

    if (this.state.callbackEvents?.onCircleInteraction)
      this.state.callbackEvents.onCircleInteraction({
        circleNumber: -1,
        params: {
          touched: startCheckpoint.touched,
          active: startCheckpoint.active
        }
      })

  }

  // Event Callback Listeners
  circleTouched(event: CircleTouchedEvent) {
    console.log("Circle touched...", event)
    const circle = this.state.gameModel.circles.find((c) => c.number === event.circleNumber)
    if (circle)
      this.touchCircle(circle)

  }

  circleInteraction(event: CircleInteractionEvent) {
    // Start checkpoint
    if (event.circleNumber === CONSTANTS.startCheckpointCircleNumber) {

      const startCheckPoint = this.state.gameModel.startCheckpoint

      if (event.params.active && !startCheckPoint.active){
        startCheckPoint.setIsActive()
        this.resetGame()
      }
      else if (!event.params.active && startCheckPoint.active)
        startCheckPoint.setIsInactive()

      if (event.params.touched && !startCheckPoint.touched) {
        startCheckPoint.setTouched()
        this.doStartCheckPointTouchEffetc()
      } else if (!event.params.touched && startCheckPoint.touched) {
        startCheckPoint.setUntouched()
        this.doStartCheckPointUntouchEffetc()
      }
    }
  }

  circleRemoved(event: CircleRemovedEvent) {
    console.log("Circle removed", event)
    this.removeCircle(event.circleNumber)
  }
}
