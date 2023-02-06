import { Divider, Grid, IconButton, ListItemIcon, ListItemText, MenuItem, MenuList, Paper, ToggleButton, Typography } from "@mui/material"
import { useState } from "react"
import { BroadcastAction, Broadcasting, BroadcastMessage } from "./Model/constants"
import { Add, Start, Stop, Remove, RestartAlt } from '@mui/icons-material';

export default function Backstage() {

    const [mainChannel, setMainChannel] = useState(new BroadcastChannel(Broadcasting.MAIN_CHANNEL))

    const sendMessage = (message: BroadcastMessage) => {
        mainChannel.postMessage(message)
    }

    const executeAction = (action: BroadcastAction, params: any) => {
        const message: BroadcastMessage = {
            action,
            params
        }
        sendMessage(message)
    }


    return (
        <Grid sx={{ margin: "auto", width: window.innerWidth / 1.2, maxWidth: window.innerWidth / 2, marginTop: 10 }}>

            <Paper elevation={20}>
                <MenuList>
                    <MenuItem onClick={() => executeAction(BroadcastAction.ADD_CIRCLE, {})}>
                        <ListItemIcon>
                            <Add />
                        </ListItemIcon>
                        <ListItemText>Add Circle</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘X
                        </Typography>
                    </MenuItem>
                    <MenuItem onClick={() => executeAction(BroadcastAction.START_GAME, {})}>
                        <ListItemIcon>
                            <Start />
                        </ListItemIcon>
                        <ListItemText>Start</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘C
                        </Typography>
                    </MenuItem>
                    <MenuItem onClick={() => executeAction(BroadcastAction.STOP_GAME, {})}>
                        <ListItemIcon>
                            <Stop />
                        </ListItemIcon>
                        <ListItemText>Stop</ListItemText>
                        <Typography variant="body2" color="text.secondary">
                            ⌘V
                        </Typography>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => executeAction(BroadcastAction.RESET_CIRCLES, {})}>
                        <ListItemIcon>
                            <Remove />
                        </ListItemIcon>
                        <ListItemText>Reset Circles</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => executeAction(BroadcastAction.RESET_GAME, {})}>
                        <ListItemIcon>
                            <Remove />
                        </ListItemIcon>
                        <ListItemText>Reset Game</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => executeAction(BroadcastAction.SHOW_TRACKING, {})}>
                        <ListItemIcon>
                            <Remove />
                        </ListItemIcon>
                        <ListItemText>Show Tracking Land Marks</ListItemText>
                    </MenuItem>
                    <MenuItem onClick={() => executeAction(BroadcastAction.SHOW_CAMERA, {})}>
                        <ListItemIcon>
                            <Remove />
                        </ListItemIcon>
                        <ListItemText>Show Tracking Camera</ListItemText>
                    </MenuItem>
                    <Divider />
                    <MenuItem onClick={() => executeAction(BroadcastAction.RESTART, {})}>
                        <ListItemIcon>
                            <RestartAlt />
                        </ListItemIcon>
                        <ListItemText>Restart</ListItemText>
                    </MenuItem>
                </MenuList>
            </Paper>
        </Grid>
    )
}