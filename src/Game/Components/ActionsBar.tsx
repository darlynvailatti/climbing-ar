import { Button, FormControlLabel, FormGroup, Switch } from "@mui/material"
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
    const appController = context.appGlobalController

    function forceUpdate() {
        setFake((s: number) => {
            return s + 1
        })
    }

    return <>
        <div className='ActionsBar'>
            <FormGroup>
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
                                <FormControlLabel key={a.label} control={
                                    <Switch
                                        key={a.label}
                                        onChange={() => { a.onClick(); forceUpdate(); }}
                                        value={a.currentState}
                                        disabled={disabled} />
                                } label={a.label}
                                />
                            )
                        default:
                            return <></>
                    }
                })}
            </FormGroup>
        </div>
    </>
}

export default ActionsBar