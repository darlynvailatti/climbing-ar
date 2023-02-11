export interface CircleInteractionEvent {
    circleNumber: number
    params: any
}

export interface CircleTouchedEvent {
    circleNumber: number
}

export interface GameControllerCallbackEvents {
    onCircleTouched?: (circleTouched: CircleTouchedEvent) => void
    onCircleInteraction?: (interaction: CircleInteractionEvent) => void
    onStart?: () => void
    onStop?: () => void
}