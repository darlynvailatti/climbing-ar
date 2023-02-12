export interface CircleInteractionEvent {
    circleNumber: number
    params: any
}

export interface CircleTouchedEvent {
    circleNumber: number
}

export interface CircleRemovedEvent {
    circleNumber: number
}

export interface GameControllerCallbackEvents {
    onCircleTouched?: (circleTouched: CircleTouchedEvent) => void
    onCircleInteraction?: (interaction: CircleInteractionEvent) => void
    onCircleRemoved?: (circleRemoved: CircleRemovedEvent) => void
    onStart?: () => void
    onStop?: () => void
}