import { Add, Remove, Start, Stop } from '@mui/icons-material';
import { Divider, Grid, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, Typography } from '@mui/material';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { BroadcastAction } from '../Model/constants';

export default function BackstageMenu() {

    const appContext = useContext(AppContext)


    const addCircle = () => {
        appContext.gameController.addNewCircle()
        appContext.executeAction(BroadcastAction.ADD_CIRCLE, {})
    }

    const start = () => {
        appContext.gameController.start()
        appContext.executeAction(BroadcastAction.START_GAME, {})
    }

    const stop = () => {
        appContext.gameController.stop()
        appContext.executeAction(BroadcastAction.STOP_GAME, {})
    }

    const resetCircles = () => {
        appContext.gameController.resetCirclesState()
        appContext.executeAction(BroadcastAction.RESET_CIRCLES, {})
    }

    const resetGame = () => {
        appContext.gameController.resetGame()
        appContext.executeAction(BroadcastAction.RESET_GAME, {})
    }

    const showTracking = () => {
        appContext.appGlobalController.toggleTrackingLandmarks()
        appContext.executeAction(BroadcastAction.SHOW_TRACKING, {})
    }

    const showCamera = () => {
        appContext.appGlobalController.toggleCamera()
        appContext.executeAction(BroadcastAction.SHOW_CAMERA, {})
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
                            <Remove />
                        </ListItemIcon>
                        <ListItemText>Show Tracking Land Marks</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={showCamera}>
                        <ListItemIcon>
                            <Remove />
                        </ListItemIcon>
                        <ListItemText>Show Tracking Camera</ListItemText>
                    </MenuItem>
                </MenuList>
            </Paper>
        </Grid>
    )
}