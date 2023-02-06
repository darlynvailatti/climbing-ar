export enum Broadcasting {

    MAIN_CHANNEL="climbing-ar-main-channel"
}


export enum BroadcastAction {
    ADD_CIRCLE = 'ADD_CIRCLE',
    START_GAME = "START_GAME",
    STOP_GAME = "STOP_GMAE",
    RESET_CIRCLES = "RESET_CIRCLES",
    RESET_GAME = "RESET_GAME",
    TRACK = "TRACK",
    SHOW_CAMERA = "SHOW_CAMERA",
    SHOW_TRACKING = "SHOW_TRACKING",
    RESTART = "RESTART"
}

export interface BroadcastMessage {
    action: BroadcastAction,
    params: any
}