import { Button, FormControlLabel, FormGroup, Stack, Switch, Typography } from "@mui/material"
import { useContext, useState } from "react"
import { AppContext } from "../../AppContext"

export enum ActionInputType {
    SWITCH = "switch",
    BUTTON = "button"
}

export interface Action {
    label: string
    inputType: ActionInputType.SWITCH | ActionInputType.BUTTON
    onClick: () => void
    currentState?: any
    disabled?: () => boolean
}

export interface ActionsBarProps {
    actions: Array<Action>
}

function ActionsBar({ actions }: ActionsBarProps) {

    const [fake, setFake] = useState(0)
    const context = useContext(AppContext)

    function forceUpdate() {
        setFake((s: number) => {
            return s + 1
        })
    }

    return <>
        <div className='ActionsBar'>
            <Stack direction={"column"} padding={1} spacing={1}>
                {actions.map((a) => {
                    const disabled = a.disabled ? a.disabled() : false
                    switch (a.inputType) {
                        case ActionInputType.BUTTON:
                            return (
                                <Button
                                    key={a.label}
                                    variant="outlined"
                                    onClick={() => { a.onClick(); forceUpdate() }}
                                    fullWidth
                                    disabled={disabled}>
                                    {a.label}
                                </Button>
                            )
                        case ActionInputType.SWITCH:
                            return (
                                <Stack direction={"row"} alignItems={"center"}>
                                    <Switch
                                        key={a.label}
                                        onChange={() => { a.onClick(); forceUpdate(); }}
                                        value={a.currentState}
                                        disabled={disabled} />
                                    <Typography>{a.label}</Typography>
                                </Stack>


                            )
                        default:
                            return <></>
                    }
                })}
            </Stack>
        </div>
    </>
}

export default ActionsBar