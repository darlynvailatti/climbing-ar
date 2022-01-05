import { Button, ButtonGroup } from "@mui/material"

export interface Action {
    label: string
    onClick: () => void
}

export interface ActionsBarProps {
    actions: Array<Action>
}

function ActionsBar({ actions }: ActionsBarProps) {
    return <>
        <div className='ActionsBar'>
            <ButtonGroup
                orientation="vertical"
                aria-label="vertical outlined button group"
                fullWidth
            >
                {actions.map((a) => {
                    return (
                        <Button
                            key={a.label}
                            variant="outlined"
                            onClick={a.onClick}
                            fullWidth>
                            {a.label}

                        </Button>
                    )
                })}
            </ButtonGroup>
        </div>
    </>
}

export default ActionsBar