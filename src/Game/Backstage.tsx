import { useContext, useEffect, useRef, useState } from 'react';
import './Game.css';
import { POSE_CONNECTIONS, HAND_CONNECTIONS } from '@mediapipe/holistic';
import { Layer, Stage } from 'react-konva';
import { Box, Button, Fade, Grid, Modal } from '@mui/material';
import Konva from 'konva';
import useSound from 'use-sound';
import Webcam from 'react-webcam';
import { AppContext } from '../AppContext';
import MediaDeviceSelector from './Components/MediaDeviceSelector';
import BackstageMenu from './Components/BackstageMenu';
import { BroadcastAction } from './Model/constants';

// const fps = {
//     start: Date.now(),
//     count: 0,
//     value: 0
// }

function Backstage() {

    const appContext = useContext(AppContext)
    const appController = appContext.appGlobalController
    const trackingEngineController = appContext.trackingEngineController
    const gameController = appContext.gameController

    const webCamRef = useRef<Webcam>(null)
    const trackingOutputCanvasRef = useRef<HTMLCanvasElement>(null)
    const gameLayerRef = useRef<Konva.Layer>(null)

    // General
    const [readyToStart, setReadyToStart] = useState(false)
    const [circleColisionSoundEffect] = useSound(`${process.env.PUBLIC_URL}/colision_2.wav`);
    const [startCheckpointTriggerSoundEffect] = useSound(`${process.env.PUBLIC_URL}/start_checkpoint.wav`);
    // const [fpsValue, setFpsValue] = useState(0)

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
            trackingEngineController.renderConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS,
                { color: '#00FF00', lineWidth: 4 });
            trackingEngineController.renderConnectors(ctx, results.leftHandLandmarks, HAND_CONNECTIONS,
                { color: '#CC0000', lineWidth: 5 });
            trackingEngineController.renderConnectors(ctx, results.rightHandLandmarks, HAND_CONNECTIONS,
                { color: '#00CC00', lineWidth: 5 });

            trackingEngineController.renderMarks(ctx, results.poseLandmarks,
                { color: '#FF0000', lineWidth: 2 });
            trackingEngineController.renderMarks(ctx, results.leftHandLandmarks,
                { color: '#00FF00', lineWidth: 2 });
            trackingEngineController.renderMarks(ctx, results.rightHandLandmarks,
                { color: '#FF0000', lineWidth: 2 });
            trackingEngineController.renderConnectors(ctx, results.poseLandmarks, POSE_CONNECTIONS, { color: '#00FF00', lineWidth: 3 })
        }
        ctx.restore();
    }

    // function fpsTick() {
    //     const elapsedTimeInMilliSeconds = Date.now() - fps.start
    //     if (elapsedTimeInMilliSeconds > 1000) {
    //         fps.start = Date.now()
    //         fps.value = fps.count
    //         fps.count = 0
    //     } else {
    //         fps.count += 1
    //     }
    // }

    const onResults = (results: any) => {
        // fpsTick()
        renderTrackingLandmarks(results)
        gameController.checkCircleColisions(results, () => circleColisionSoundEffect())

        if (!gameController.state.gameModel.isStarted) {
            gameController.checkStartCheckpointColision(results, () => { })
            if (gameController.state.gameModel.startCheckpoint.active) {
                gameController.start()
                startCheckpointTriggerSoundEffect()
            }
        }

    }

    async function setupTrackingCamera() {
        if (!webCamRef.current || !webCamRef.current.video) {
            throw new Error("Video Input Camera is not setup")
        }
        await trackingEngineController.setupTrackingCamera(webCamRef.current.video)
    }

    const toggleTracking = () => {
        if (appController.state.trackingEnabled) {
            console.log("Closing tracking...")
            trackingEngineController.closeTracking()
            appController.toggleCamera()
            appController.toggleTrackingLandmarks()
        } else {
            console.log("Loading tracking...")
            trackingEngineController.loadTrackingEngine(onResults)
            setupTrackingCamera()
        }
        appController.toggleTracking()
    }

    function setupGameController() {
        console.debug("Setuping game controller...")
        if (!gameLayerRef.current)
            throw new Error("Main Game Layer is not yet rendered")

        gameController.setup(gameLayerRef.current, {
            onCircleInteraction(interaction) {
                appContext.executeAction(BroadcastAction.CIRCLE_INTERACTION, interaction)
            },
            onCircleTouched(circleTouched) {
                appContext.executeAction(BroadcastAction.CIRCLE_TOUCHED, circleTouched)
            },
            onStart() {
                appContext.executeAction(BroadcastAction.START_GAME, {})
            },
            onStop(){
                appContext.executeAction(BroadcastAction.STOP_GAME, {})
            }
        })
    }

    function setupTrackingController() {
        console.debug("Setuping tracking controller...")
        if (!trackingOutputCanvasRef || !trackingOutputCanvasRef.current) {
            throw new Error("Output tracking canvas is not loaded yet")
        }
        trackingEngineController.setup(trackingOutputCanvasRef.current)
    }

    function handleOnConfirmSetup() {
        if (appController.state.selectedDeviceId)
            setReadyToStart(true)
    }

    function initialSetup() {
        setupGameController()
        setupTrackingController()
        // setInterval(() => {
        //     setFpsValue(fps.value)
        // }, 1000)
    }

    useEffect(() => {
        if (readyToStart) {
            initialSetup()
            setTimeout(() => {
                toggleTracking()
            }, 1000)
        }
    }, [readyToStart])


    return (
        <div >

            {Boolean(readyToStart) ?
                <>
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

                    <BackstageMenu/>

                </> :
                <Modal
                    open={true}
                    onClose={() => false}
                >
                    <Fade in={true}>

                        <Box sx={{
                            position: 'absolute',
                            top: '50%',
                            left: '50%',
                            transform: 'translate(-50%, -50%)',
                            width: 500,
                            bgcolor: 'background.paper',
                            boxShadow: 24,
                            p: 6,

                        }}>
                            <Grid direction={'row'} container alignItems={'flex-end'}>

                                <Grid xs={10} md={8} padding={1} item>
                                    <MediaDeviceSelector />
                                </Grid>
                                <Grid xs={2} md={2} padding={1} item>
                                    <Button variant='contained' onClick={handleOnConfirmSetup}>
                                        Confirm
                                    </Button>
                                </Grid>
                            </Grid>
                        </Box>
                    </Fade>
                </Modal>}

        </div >
    )
}

export default Backstage;
