import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { useCallback, useContext, useEffect, useState } from "react";
import { AppContext } from "../../AppContext";

function MediaDeviceSelector() {

    const appContext = useContext(AppContext)
    const appController = appContext.appGlobalController

    const [deviceId, setDeviceId] = useState<string>("");
    const [devices, setDevices] = useState<Array<MediaDeviceInfo>>([]);

    const handleDevices = useCallback((mediaDevices: MediaDeviceInfo[]) => {
        setDevices(mediaDevices.filter((device: MediaDeviceInfo) => device.kind === "videoinput"))
    }, [setDevices]);

    function loadMediaDevices() {
        console.log("Loading media devices...")
        navigator.mediaDevices.enumerateDevices().then(handleDevices);
    }

    useEffect(() => {
        loadMediaDevices()
    }, [])

    return (
        <FormControl>
            <InputLabel>Input Video</InputLabel>
            <Select
                label="Video Input"
                value={deviceId}
                onChange={(e) => {
                    setDeviceId(e.target.value);
                    appController.setDeviceId(e.target.value)
                }}
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
    )
}

export default MediaDeviceSelector