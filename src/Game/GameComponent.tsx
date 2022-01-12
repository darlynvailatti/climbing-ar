import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import './Game.css';
import { POSE_CONNECTIONS } from '@mediapipe/holistic';
import { Layer, Stage } from 'react-konva';
import { Box, Paper, Stack, Toolbar, Typography } from '@mui/material';
import Konva from 'konva';
import useSound from 'use-sound';
import ActionsBar, { Action, ActionInputType } from './Components/ActionsBar';
import Webcam from 'react-webcam';
import { AppContext } from '../AppContext';
import { AppGlobalActionType } from '../AppGlobalController';
import MediaDeviceSelector from './Components/MediaDeviceSelector';

const fps = {
    start: Date.now(),
    count: 0,
    value: 0
}

function GameComponent() {

    const appContext = useContext(AppContext)
    const appController = appContext.appGlobalController
    const trackingEngineController = appContext.trackingEngineController
    const gameController = appContext.gameController

    const webCamRef = useRef<Webcam>(null)
    const trackingOutputCanvasRef = useRef<HTMLCanvasElement>(null)
    const gameLayerRef = useRef<Konva.Layer>(null)

    // General
    const [play] = useSound(`${process.env.PUBLIC_URL}/colision_2.wav`);
    const [fpsValue, setFpsValue] = useState(0)

    const renderTrackingLandmarks = function (results: any) {
        const canvasElement = trackingOutputCanvasRef.current
        if (!canvasElement)
            return

        const ctx = trackingOutputCanvasRef.current?.getContext("2d")
        if (!ctx)
            return

        ctx.save()
        ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);

        if (appController.state.showCamera)
            ctx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

        if (appController.state.showTrackingLandmakrs) {
            trackingEngineController.renderMarks(ctx, results.poseLandmarks, { lineWidth: 1 })
            trackingEngineController.renderConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 3 })
        }
        ctx.restore();
    }

    function fpsTick() {
        const elapsedTimeInMilliSeconds = Date.now() - fps.start
        if (elapsedTimeInMilliSeconds > 1000) {
            fps.start = Date.now()
            fps.value = fps.count
            fps.count = 0
        } else {
            fps.count += 1
        }
    }

    const onResults = useCallback((results: any) => {
        fpsTick()
        renderTrackingLandmarks(results)
        gameController.checkColisions(results, () => play())
    }, [fpsTick])

    async function setupTrackingCamera() {
        if (!webCamRef.current || !webCamRef.current.video) {
            throw new Error("Video Input Camera is not setup")
        }
        await trackingEngineController.setupTrackingCamera(webCamRef.current.video)
    }

    const toggleTracking = useCallback(() => {
        if (appController.state.enableTracking) {
            console.log("Closing tracking...")
            trackingEngineController.closeTracking()
        } else {
            console.log("Loading tracking...")
            trackingEngineController.loadTrackingEngine(onResults)
            appController.dispatch({ type: AppGlobalActionType.TOGGLE_LOADING })
            setupTrackingCamera().then((r) => {
                console.log("Tracking loaded")
                appController.dispatch({ type: AppGlobalActionType.TOGGLE_LOADING })
            })
        }
        appController.dispatch({ type: AppGlobalActionType.TOGGLE_TRACKING })
    }, [onResults])

    function setupGameController() {
        console.debug("Setuping game controller...")
        if (!gameLayerRef.current)
            throw new Error("Main Game Layer is not yet rendered")

        gameController.setup(gameLayerRef.current)
    }

    function setupTrackingController() {
        console.debug("Setuping tracking controller...")
        if (!trackingOutputCanvasRef || !trackingOutputCanvasRef.current) {
            throw new Error("Output tracking canvas is not loaded yet")
        }
        trackingEngineController.setup(trackingOutputCanvasRef.current)
    }

    function initialSetup() {
        setupGameController()
        setupTrackingController()
        setInterval(() => {
            setFpsValue(fps.value)
        }, 1000)
    }

    const actions: Array<Action> = [
        {
            label: "Tracking",
            onClick: toggleTracking,
            inputType: ActionInputType.SWITCH,
            currentState: appController.state.enableTracking
        },
        {
            label: "Show Tracking Camera",
            onClick: () => appController.dispatch({ type: AppGlobalActionType.TOGGLE_CAMERA }),
            inputType: ActionInputType.SWITCH,
            currentState: appController.state.showCamera,
            disabled: () => !appController.state.enableTracking
        },
        {
            label: "Show Pose Land Marks",
            onClick: () => appController.dispatch({ type: AppGlobalActionType.TOGGLE_TRACKING_LANDMARKS }),
            inputType: ActionInputType.SWITCH,
            currentState: appController.state.showTrackingLandmakrs,
            disabled: () => !appController.state.enableTracking
        },
        {
            label: "Add Circle",
            onClick: () => { gameController.addNewCircle() },
            inputType: ActionInputType.BUTTON
        },
        {
            label: "Reset Game",
            onClick: () => { gameController.resetGame() },
            inputType: ActionInputType.BUTTON
        },
        {
            label: "Reset Circles",
            onClick: () => { gameController.resetCirclesState() },
            inputType: ActionInputType.BUTTON

        }
    ]

    useEffect(() => {
        initialSetup()
    }, [])

    return (
        <div className="MainContainer">
            <Webcam
                className='InputVideo'
                ref={webCamRef}
                videoConstraints={{
                    deviceId: appController.state.selectedDeviceId
                }}
                width={window.innerWidth}
                height={window.innerHeight}
                style={{ display: "none" }}
                onUserMediaError={(e) => {
                    console.error(`Error on loading camera: ${e}`)
                }}>
            </Webcam>

            <canvas ref={trackingOutputCanvasRef}
                className='OutputCanvas'
                width={window.innerWidth}
                height={window.innerHeight}
                style={{}} />

            <Stage
                className='GameCanvas'
                width={window.innerWidth}
                height={window.innerHeight} >
                <Layer ref={gameLayerRef} />
            </Stage>
            <Toolbar
                className='ToolBar'>
                <Paper>
                    <Box margin={1}>
                        <Stack direction="column" spacing={2}>
                            <MediaDeviceSelector />
                            <ActionsBar actions={actions} />
                            <Box>
                                <Stack direction={"row"}>
                                    <Typography variant='h1'>{fpsValue}</Typography>
                                    <Typography variant='caption'>FPS</Typography>
                                </Stack>
                            </Box>
                        </Stack>
                    </Box>
                </Paper>
            </Toolbar>
        </div >
    )
}

export default GameComponent;
