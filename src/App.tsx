import { useCallback, useEffect, useRef, useState } from 'react';
import './App.css';
import { HAND_CONNECTIONS, Holistic, POSE_CONNECTIONS, POSE_LANDMARKS } from '@mediapipe/holistic';
import { Camera } from '@mediapipe/camera_utils';
import { drawConnectors, drawLandmarks, lerp } from '@mediapipe/drawing_utils';
import { Circle as CircleShape, Group, Layer, Stage, Text } from 'react-konva';
import { Box, FormControl, InputLabel, MenuItem, Paper, Select, Toolbar } from '@mui/material';
import Konva from 'konva';
import { Circle, CircleGame, CircleRenderizationMetadata } from './game';
import useSound from 'use-sound';
import ActionsBar, { Action } from './ActionsBar';
import Webcam from 'react-webcam';

const holistic = new Holistic({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/holistic/${file}`;
  }
});

const circleGame = new CircleGame()

holistic.setOptions({
  modelComplexity: 1,
  smoothLandmarks: true,
  // enableSegmentation: true,
  // smoothSegmentation: true,
  refineFaceLandmarks: false,
  enableFaceGeometry: false,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5
});

interface State {
  showCameraVideo: boolean
  showPoseLandMarks: boolean
}

function App() {

  const webCamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)


  // Canvas Game Refs
  const gameCanvasRef = useRef(null)
  const gameLayerRef = useRef<Konva.Layer>(null)

  // General
  const [play] = useSound(`${process.env.PUBLIC_URL}/colision_2.wav`);

  const [state, setState] = useState<State>({
    showCameraVideo: false,
    showPoseLandMarks: false
  })

  const [deviceId, setDeviceId] = useState<string>("096d92b7a0b7991bfc3afed5113dbf6180967d661774fab62ada48dece9fe761");
  const [devices, setDevices] = useState<Array<MediaDeviceInfo>>([]);

  holistic.onResults(onResults)

  const handleDevices = useCallback(
    (mediaDevices: MediaDeviceInfo[]) =>
      setDevices(mediaDevices.filter((device: MediaDeviceInfo) => device.kind === "videoinput")),
    [setDevices]
  );

  const drawPoseLandmarks = useCallback((results: any) => {
    const canvasElement = canvasRef.current

    if (!canvasElement)
      return

    const ctx = canvasRef.current?.getContext("2d")
    if (!ctx)
      return

    ctx.save()
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

    if (state.showCameraVideo)
      ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

    if (state.showPoseLandMarks) {
      drawLandmarks(ctx, results.poseLandmarks, {
        lineWidth: 1
      })

      drawConnectors(
        ctx, results.poseLandmarks, POSE_CONNECTIONS,
        { color: '#00FF00', lineWidth: 3 }
      );

      drawConnectors(
        ctx, results.rightHandLandmarks, HAND_CONNECTIONS,
        { color: 'white' });
      drawLandmarks(ctx, results.rightHandLandmarks, {
        color: 'white',
        fillColor: 'rgb(0,217,231)',
        lineWidth: 2,
        radius: (data: any) => {
          return lerp(data.from!.z!, -0.15, .1, 10, 1);
        }
      });
      drawConnectors(
        ctx, results.leftHandLandmarks, HAND_CONNECTIONS,
        { color: 'white' });
      drawLandmarks(ctx, results.leftHandLandmarks, {
        color: 'white',
        fillColor: 'rgb(255,138,0)',
        lineWidth: 2,
        radius: (data: any) => {
          return lerp(data.from!.z!, -0.15, .1, 10, 1);
        }
      });
    }
    ctx.restore();
  }, [state])

  function checkColisions(results: any) {
    if (gameLayerRef && gameLayerRef.current) {

      const layer = gameLayerRef.current
      for (const circle of circleGame.circles.filter((c) => !c.touched)) {

        const renderedGroup: any = layer.getChildren().find((group) => Number(group.attrs.id) === circle.number)
        if (!renderedGroup) {
          continue
        }

        if (results.poseLandmarks || results.rightHandLandmarks || results.leftHandLandmarks) {

          const defaultPointRadius = 5
          const poseLandmarks = results.poseLandmarks || []
          const rightHandLandmarks = results.rightHandLandmarks || []
          const leftHandLandmarks = results.leftHandLandmarks || []

          for (let posePoint of [...poseLandmarks, ...rightHandLandmarks, ...leftHandLandmarks]) {
            const x = posePoint.x * window.innerWidth
            const y = posePoint.y * window.innerHeight

            if (circle.didColide(x, y, defaultPointRadius) && !circle.touched) {
              circle.touch()
              doColisionEffect(renderedGroup, circle)
              break
            }
          }
        }
      }
    }
  }

  function onResults(results: any) {
    drawPoseLandmarks(results)
    setTimeout(() => {
      checkColisions(results)
    })

  }

  function setup() {
    // Input camera
    if (webCamRef.current && webCamRef.current.video) {
      const video = webCamRef.current.video
      const camera = new Camera(video, {
        onFrame: async () => {
          await holistic.send({ image: video });
        }
      });
      camera.start();
    }

    // Game Canvas Setup
    setupLayer()
  }

  // Actions
  function addNewCircle() {
    new Promise((resolve, reject) => {
      const circle: Circle = new Circle({
        renderizationMetadata: {
          x: window.innerWidth / 2,
          y: window.innerHeight / 2,
          radius: 30
        }
      })
      resolve(circleGame.addCircle(circle))
    }).then(() => {
      renderCircles()
    })
  }

  function toggleCameraVideo() {
    setState((s) => {
      return {
        ...s,
        showCameraVideo: !s.showCameraVideo
      }
    })
  }

  function togglePoseLandMarks() {
    setState((s) => {
      return {
        ...s,
        showPoseLandMarks: !s.showPoseLandMarks
      }
    })
  }

  function setupLayer() {
    // gameLayerRef.current?.add(defaultCircleTransformer)
  }

  function resetLayer() {
    gameLayerRef.current?.destroyChildren()
  }

  function resetGame() {
    circleGame.resetGame()
    renderCircles()
  }

  function resetCirclesState() {
    circleGame.resetCirclesState()
    renderCircles()
  }


  function doColisionEffect(shape: Konva.Group, circle: Circle) {
    play()

    console.log(shape)
    shape.to({
      scaleY: 2,
      scaleX: 2,
      duration: 0.1
    });

    const circleShape: any = shape.getChildren().find((s) => s.getClassName() === Konva.Circle.name)
    circleShape.to({
      fill: "#32a852"
    })
  }

  function renderCircles() {

    resetLayer()

    circleGame.circles.map((circle) => {

      const groupShape: Konva.Group = new Konva.Group({
        key: `circle_group_${circle.number}`,
        id: `${circle.number}`,
        y: circle.renderizationMetadata.y,
        x: circle.renderizationMetadata.x,
        draggable: true,
        rotation: circle.renderizationMetadata.rotation,
        scaleX: circle.renderizationMetadata.scaleX,
        scaleY: circle.renderizationMetadata.scaleY
      })

      const circleText: Konva.Text = new Konva.Text({
        x: (circle.renderizationMetadata.x / window.innerWidth) - 5,
        y: (circle.renderizationMetadata.y / window.innerHeight) - 8,
        text: String(circle.number),
        fontSize: 20,
        fontStyle: "bold",
        align: "center",
        verticalAlign: "middle",
        fill: "white"
      })

      const circleShape: Konva.Circle = new Konva.Circle({
        key: `circle_${circle.number}`,
        id: `${String(circle.number)}`,
        radius: circle.renderizationMetadata.radius,
        fill: "#edcb0c",
        strokeWidth: 10,
        stroke: "white"
      })

      groupShape.add(circleShape)
      groupShape.add(circleText)

      // Events
      groupShape.on("dragend", (event: any) => {
        const x: any = event.target.attrs.x
        const y: any = event.target.attrs.y
        circle.updateRenderizationMetadata({
          ...circle.renderizationMetadata,
          x,
          y
        })
      })

      groupShape.on("click", (e) => {
        if (!e.target.parent)
          return
        const group: any = e.target.parent
        const defaultCircleTransformer = new Konva.Transformer({
          node: group,
          flipEnabled: false,
          keepRatio: true,
          rotateEnabled: false,
          enabledAnchors: [
            "top-left",
            "top-right",
            "bottom-left",
            "bottom-right"
          ]

        })
        defaultCircleTransformer.on("transform", (e) => {
          console.log("transformer changed", e)
          circle.updateRenderizationMetadata({
            ...circle.renderizationMetadata,
            scaleX: e.target.attrs.scaleX,
            scaleY: e.target.attrs.scaleY,
            rotation: e.target.attrs.rotation
          })
        })
        gameLayerRef.current?.add(defaultCircleTransformer)
      })
      gameLayerRef.current?.add(groupShape)
    })
  }

  const [actions] = useState<Array<Action>>([
    {
      label: "Toggle Camera",
      onClick: toggleCameraVideo
    },
    {
      label: "Toggle Pose Land Marks",
      onClick: togglePoseLandMarks
    },
    {
      label: "Add Circle",
      onClick: addNewCircle
    },
    {
      label: "Reset Game",
      onClick: resetGame
    },
    {
      label: "Reset Circles",
      onClick: resetCirclesState
    }
  ])

  useEffect(() => {
    setup()
  }, [deviceId])

  useEffect(
    () => {
      navigator.mediaDevices.enumerateDevices().then(handleDevices);
    },
    [handleDevices]
  )

  return (
    <div className="MainContainer">
      {/* <video ref={webCamRef} className='InputVideo'
        width={window.innerWidth}
        height={window.innerHeight}
        style={{ display: "none" }} /> */}

      <Webcam
        className='InputVideo'
        ref={webCamRef}
        videoConstraints={{
          deviceId: deviceId
        }}
        width={window.innerWidth}
        height={window.innerHeight}
        style={{}}
        onUserMediaError={(e) => {
          console.error(`Error on loading camera: ${e}`)
        }}>
      </Webcam>

      <canvas ref={canvasRef}
        className='OutputCanvas'
        width={window.innerWidth}
        height={window.innerHeight}
        style={{}} />



      <Stage
        ref={gameCanvasRef}
        className='GameCanvas'
        width={window.innerWidth}
        height={window.innerHeight} >
        <Layer ref={gameLayerRef} />
      </Stage>
      <Toolbar
        className='ToolBar'>
        <Box>
          <Paper variant="outlined" style={{ padding: "15px" }}>
            <FormControl>
              <InputLabel>Input Video</InputLabel>
              <Select
                label="Video Input"
                value={deviceId}
                onChange={(e) => { setDeviceId(e.target.value); }}
                defaultValue={devices.find(Boolean)?.deviceId}
              >
                {devices.map((device: MediaDeviceInfo, key) => {
                  return (
                    <MenuItem
                      key={key}
                      value={device.deviceId}>
                      {device.label}
                    </MenuItem>
                  )
                }
                )}
              </Select>
            </FormControl>
            <ActionsBar actions={actions} />
          </Paper>
        </Box>

      </Toolbar>
    </div >
  )
}

export default App;
