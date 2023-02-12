import { Add, Remove, Start, Stop, Radar, Polyline, Videocam } from '@mui/icons-material';
import { Divider, Grid, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Typography } from '@mui/material';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import useForceUpdate from '../../hooks';
import { BroadcastAction } from '../Model/constants';

export default function BackstageMenu() {

    const appContext = useContext(AppContext)
    const forceUpdate = useForceUpdate()


    const addCircle = () => {
        appContext.gameController.addNewCircle()
        appContext.executeAction(BroadcastAction.ADD_CIRCLE, {})
        forceUpdate()
    }

    const start = () => {
        appContext.gameController.start()
        appContext.executeAction(BroadcastAction.START_GAME, {})
        forceUpdate()
    }

    const stop = () => {
        appContext.gameController.stop()
        appContext.executeAction(BroadcastAction.STOP_GAME, {})
        forceUpdate()
    }

    const resetCircles = () => {
        appContext.gameController.resetCirclesState()
        appContext.executeAction(BroadcastAction.RESET_CIRCLES, {})
        forceUpdate()
    }

    const resetGame = () => {
        appContext.gameController.resetGame()
        appContext.executeAction(BroadcastAction.RESET_GAME, {})
        forceUpdate()
    }

    const showTracking = () => {
        appContext.appGlobalController.toggleTrackingLandmarks()
        appContext.executeAction(BroadcastAction.SHOW_TRACKING, {})
        forceUpdate()
    }

    const showCamera = () => {
        appContext.appGlobalController.toggleCamera()
        appContext.executeAction(BroadcastAction.SHOW_CAMERA, {})
        forceUpdate()
    }

    const detectColisions = () => {
        appContext.appGlobalController.toggleColisionDetection()
        forceUpdate()
    }

    return (
        <Grid
            sx={{
                position: "absolute",
                margin: "auto",
                width: 280,
                marginTop: 10,
                marginLeft: 10
            }}>

            <Paper elevation={20}>
                <MenuList>
                    <MenuItem onClick={addCircle}>
                        <ListItemIcon>
                            <Add />
                        </ListItemIcon>
                        <ListItemText>Add Circle</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘X
                        </Typography>
                    </MenuItem>
                    <MenuItem onClick={start}>
                        <ListItemIcon>
                            <Start />
                        </ListItemIcon>
                        <ListItemText>Start</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘C
                        </Typography>
                    </MenuItem>
                    <MenuItem onClick={stop}>
                        <ListItemIcon>
                            <Stop />
                        </ListItemIcon>
                        <ListItemText>Stop</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘V
                        </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={resetCircles}>
                        <ListItemIcon>
                            <Remove />
                        </ListItemIcon>
                        <ListItemText>Reset Circles</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={resetGame}>
                        <ListItemIcon>
                            <Remove />
                        </ListItemIcon>
                        <ListItemText>Reset Game</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={showTracking}>
                        <ListItemIcon>
                            <Polyline color={appContext.appGlobalController.getShowTrackingLandmakrs() ? 'primary' : 'inherit'}/>
                        </ListItemIcon>
                        <ListItemText>Show Tracking Land Marks</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={showCamera}>
                        <ListItemIcon>
                            <Videocam color={appContext.appGlobalController.getShowCamera() ? 'primary' : 'inherit'}/>
                        </ListItemIcon>
                        <ListItemText>Show Tracking Camera</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={detectColisions}>
                        <ListItemIcon>
                            <Radar color={appContext.appGlobalController.getDetectColision() ? 'primary' : 'inherit'}/>
                        </ListItemIcon>
                        <ListItemText>
                            Detect Colisions
                        </ListItemText>
                    </MenuItem>
                </MenuList>
            </Paper>
        </Grid>
    )
}