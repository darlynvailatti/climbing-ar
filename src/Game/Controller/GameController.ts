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

  resetStartCheckpoint() {
    const startCheckpointGroup = this.getStartCheckpointByKey()
    if(startCheckpointGroup){
      startCheckpointGroup.destroy()
    }
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
        const renderedCircleGroup: Konva.Group = this.getCircleGroupByNumber(
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
      this.updateScore()
    }, 0)


    if (this.state.callbackEvents?.onStart)
      this.state.callbackEvents?.onStart()
  }

  stop() {
    this.state.gameModel.stop();
    this.getDefaultCircleAnimation().stop();
    this.getDefaultStartCheckpointAnimation().stop();
    this.resetStartCheckpoint()

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
    const renderedCircle = this.getCircleGroupByNumber(circleNumber)
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
    this.refreshAllNodes();
  }

  resetCirclesState() {
    this.state.gameModel.resetCirclesState();
    this.refreshAllNodes();
  }

  doCircleColisionEffect(shape: Konva.Group, circle: Circle) {
    const originalScaleX =  shape.attrs.scaleX
    const originalScaleY = shape.attrs.scaleY
    shape.to({
      scaleY: originalScaleX + 0.5,
      scaleX: originalScaleY + 0.5,
      duration: 0.3,
      onFinish: () => {
        shape.to({
          scaleY: originalScaleY,
          scaleX: originalScaleX,
          duration: 0.3,
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
    const startCheckPointRenderedGroup = this.getStartCheckpointByKey();
    if (!startCheckPointRenderedGroup) return

    const startCheckpointShape = startCheckPointRenderedGroup.getChildren()[0]
    function pulse(startCheckpointShape: any, state: GameController) {
      const startCheckpoint = state.state.gameModel.startCheckpoint;
      if (!startCheckpoint.touched || state.state.gameModel.isStarted) return

      startCheckpointShape.to({
        scaleX: 1.2,
        scaleY: 1.2,
        duration: 0.1,
        easing: Konva.Easings.EaseInOut,
        fill: 'white',
        onFinish: () => {
          startCheckpointShape.to({
            scaleX: 1,
            scaleY: 1,
            duration: 0.1,
            easing: Konva.Easings.EaseInOut,
            fill: 'red',
            onFinish: () => {
              // Call the pulse function again to repeat the animation
              pulse(startCheckpointShape, state);
            }
          });
        }
      });
    }

    pulse(startCheckpointShape, this)
  }

  doStartCheckPointUntouchEffetc() {
    const startCheckPointRendered = this.getStartCheckpointByKey();
    if (!startCheckPointRendered) return
    const startCheckpointShape = startCheckPointRendered.getChildren()[0]
    startCheckpointShape?.to({
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
      scaleX: circle.renderizationMetadata.scaleX || 1,
      scaleY: circle.renderizationMetadata.scaleY || 1,
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
      // x: circle.renderizationMetadata.x / window.innerWidth,
      // y: circle.renderizationMetadata.y / window.innerHeight,
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
      this._onClickResizableGroup(
        groupShape,
        () => this.removeCircle(circle.number),
        (group: Konva.Group) => {
          circle.updateRenderizationMetadata({
            ...circle.renderizationMetadata,
            scaleX: group.attrs.scaleX,
            scaleY: group.attrs.scaleY
          });
        }
      )
    });

    this.getLayer().add(groupShape);
  }

  renderScore() {
    const layer = this.getLayer();
    const scoreModel = this.state.gameModel.score;


    const scoreGroup = new Konva.Group({
      key: "score",
      ...scoreModel.renderizationMeta,
      draggable: true,
    })

    const scoreLabelText = new Konva.Text({
      key: "score_label_text",
      x: scoreModel.renderizationMeta.x / window.innerWidth,
      y: scoreModel.renderizationMeta.y / window.innerHeight,
      fill: "white",
      fontSize: 30,
      fontVariant: "bold",
      text: "Score",
      offsetY: 30,
      offsetX: -5,
    });

    const scoreValueText = new Konva.Text({
      key: "score_value_text",
      text: `${this.state.gameModel.score.value}`,
      fill: "white",
      fontSize: 70,
      fontVariant: "bold",
      x: scoreModel.renderizationMeta.x / window.innerWidth,
      y: scoreModel.renderizationMeta.y / window.innerHeight
    });

    const scoreTotalTimeLabelText = new Konva.Text({
      key: "score_total_time_label_text",
      x: scoreModel.renderizationMeta.x / window.innerWidth,
      y: scoreModel.renderizationMeta.y / window.innerHeight,
      fill: "white",
      fontSize: 30,
      fontVariant: "bold",
      text: "Total time",
      offsetY: 110,
      offsetX: -5,
    });

    const scoreTotalTime = new Konva.Text({
      key: "score_total_time",
      x: scoreModel.renderizationMeta.x / window.innerWidth,
      y: scoreModel.renderizationMeta.y / window.innerHeight,
      fill: "white",
      fontSize: 30,
      fontVariant: "bold",
      text: `${this.state.gameModel.getTotalTime()}`,
      offsetY: 70,
      offsetX: -5,
    });

    scoreGroup.add(scoreLabelText)
    scoreGroup.add(scoreValueText)
    scoreGroup.add(scoreTotalTimeLabelText)
    scoreGroup.add(scoreTotalTime)

    scoreGroup.on("dragend", (event: any) => {
      const x: any = event.target.attrs.x;
      const y: any = event.target.attrs.y;
      scoreModel.updateRenderizationMeta({
        ...scoreModel.renderizationMeta,
        x,
        y,
      });
    });

    scoreGroup.on("click", () => {
      this._onClickResizableGroup(
        scoreGroup,
        () => { },
        (group: Konva.Group) => {
          scoreModel.updateRenderizationMeta({
            ...scoreModel.renderizationMeta,
            ...group.attrs
          })
        }
      )
    })
    layer.add(scoreGroup)
  }

  updateScore() {
    const renderedScore = this.getByGroupKey("score")
    if (!renderedScore) {
      return
    }

    const scoreTotalTimeText = renderedScore.getChildren().find((shape: any) => shape.attrs.key === 'score_total_time')
    const scoreText = renderedScore.getChildren().find((shape: any) => shape.attrs.key === 'score_value_text')

    scoreText?.setAttr('text', this.state.gameModel.score.value)
    scoreTotalTimeText?.setAttr('text', this.state.gameModel.getTotalTime())
  }

  renderStartCheckpoint() {
    const layer = this.getLayer();
    const startCheckpoint = this.state.gameModel.startCheckpoint;

    const startCheckPointGroup = new Konva.Group({
      key: "start_checkpoint",
      x: startCheckpoint.renderizationMeta.x,
      y: startCheckpoint.renderizationMeta.y,
      draggable: true,
      scaleX: startCheckpoint.renderizationMeta.scaleX,
      scaleY: startCheckpoint.renderizationMeta.scaleY,
    })

    const elipse = new Konva.Circle({
      x: startCheckpoint.renderizationMeta.x / window.innerWidth,
      y: startCheckpoint.renderizationMeta.y / window.innerHeight,
      radius: startCheckpoint.renderizationMeta.radius,
      fill: "white"
    });

    startCheckPointGroup.add(elipse)
    startCheckPointGroup.on("dragend", (event: any) => {
      const x: any = event.target.attrs.x;
      const y: any = event.target.attrs.y;
      startCheckpoint.updateRenderizationMeta({
        ...startCheckpoint.renderizationMeta,
        x,
        y,
      });
    });

    startCheckPointGroup.on('click', (event: any) => {

      this._onClickResizableGroup(
        startCheckPointGroup,
        () => { },
        (group: Konva.Group) => {
          startCheckpoint.updateRenderizationMeta({
            ...startCheckpoint.renderizationMeta,
            ...group.attrs
          });
        }
      )
    })

    layer.add(startCheckPointGroup);
  }

  getByGroupKey(key: string): any {
    return this.getLayer().getChildren().find((group) => group.attrs.key === key);
  }

  getCircleGroupByNumber(id: number): any {
    return this.getByGroupKey(`circle_group_${id}`)
  }

  getStartCheckpointByKey() {
    return this.getByGroupKey("start_checkpoint")
  }

  touchCircle(circle: Circle) {
    const circleNumber = circle.number
    if (!circleNumber) return

    this.state.gameModel.touch(circle);

    const renderedGroup: any = this.getCircleGroupByNumber(circleNumber);
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

    for (const circle of allNonTouchedCircles) {
      if (!circle.number) return;

      const poseLandmarks = results.poseLandmarks || [];
      const rightHandLandmarks = results.rightHandLandmarks || [];
      const lefttHandLandmarks = results.leftHandLandmarks || [];
      const isLastCircle = this.state.gameModel.circles.length === circle.number

      // if (isLastCircle) {
      //   let didColideRightHand = false
      //   let didColideLeftHand = false

      //   for (let posePoint of [...rightHandLandmarks]) {
      //     const x = posePoint.x * window.innerWidth;
      //     const y = posePoint.y * window.innerHeight;
      //     if (circle.didColide(x, y, defaultPosePointRadius)) {
      //       didColideRightHand = true
      //       break
      //     }
      //   }

      //   for (let posePoint of [...lefttHandLandmarks]) {
      //     const x = posePoint.x * window.innerWidth;
      //     const y = posePoint.y * window.innerHeight;
      //     if (circle.didColide(x, y, defaultPosePointRadius)) {
      //       didColideLeftHand = true
      //       break
      //     }
      //   }

      //   if (didColideLeftHand && didColideRightHand) {
      //     this.touchCircle(circle)
      //     if (callBack) callBack();
      //     return;
      //   }

      // } else {
      for (let posePoint of [...poseLandmarks, ...rightHandLandmarks, ...lefttHandLandmarks]) {
        const x = posePoint.x * window.innerWidth;
        const y = posePoint.y * window.innerHeight;

        if (circle.didColide(x, y, defaultPosePointRadius)) {



          this.touchCircle(circle)
          if (callBack) callBack();
          return;
        }
      }
      // }
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

      if (event.params.active && !startCheckPoint.active) {
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

  _onClickResizableGroup(group: any, onRemoveCallback: Function, onUpdate: Function) {
    const isDecreaseKeyPressed = this.state.keyboard?.decreaseKeyIsPressed
    const isRemoveKeyPressed = this.state.keyboard?.removeKeyIsPressed

    if (isRemoveKeyPressed) {
      onRemoveCallback()
      return
    }
    const currentScaleX = group.getScaleX()
    const currentScaleY = group.getScaleY()

    group.scale({
      x: isDecreaseKeyPressed ? currentScaleX - (currentScaleX * 0.1) : currentScaleX * 1.1,
      y: isDecreaseKeyPressed ? currentScaleY - (currentScaleY * 0.1) : currentScaleY * 1.1,
    })

    onUpdate(group)
  }

}
