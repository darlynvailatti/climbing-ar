import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../../AppContext";
import useForceUpdate from "../../hooks";

function MediaDeviceSelector() {

    const appContext = useContext(AppContext)
    const appController = appContext.appGlobalController
    const trackingController = appContext.trackingEngineController
    const forceUpdate = useForceUpdate()

    const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
        appController.setAvailableMediaDevices(mediaDevices.filter((device: MediaDeviceInfo) => device.kind === "videoinput"))
    }, [appController.setAvailableMediaDevices]);

    function loadMediaDevices() {
        console.log("Loading media devices...")
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }

    function handleMediaChange(event: any) {
        trackingController.refreshInputDevice()
        appController.setDeviceId(event.target.value)
        forceUpdate()
    }

    useEffect(() => {
        loadMediaDevices()
    }, [])

    return (
        <FormControl variant="standard" sx={{ minWidth: "100%" }} size="small">
            <InputLabel>Select a input video source</InputLabel>
            <Select
                label="Video Input"
                value={appController.state.selectedDeviceId}
                onChange={(e) => {
                    handleMediaChange(e)
                }}
                displayEmpty>
                {appController.state.availableDevices.map((device: MediaDeviceInfo, key) => {
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
    )
}

export default MediaDeviceSelector