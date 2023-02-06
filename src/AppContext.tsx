import { createContext, useEffect, useState } from "react";
import { AppController } from "./AppGlobalController";
import { GameController } from "./Game/GameController";
import { BroadcastAction, Broadcasting, BroadcastMessage } from "./Game/Model/constants";
import { TrackingEngineController } from "./Game/TrackingEngineController";

export interface AppContextState {
    appGlobalController: AppController
    trackingEngineController: TrackingEngineController
    gameController: GameController
}

export interface AppContextWrapperProps {
    children: any
}

const appContextInitialState = {
    appGlobalController: new AppController(),
    trackingEngineController: new TrackingEngineController(),
    gameController: new GameController()
}

export const AppContext = createContext<AppContextState>(appContextInitialState)

function AppContextWrapper({ children }: AppContextWrapperProps) {

    const [mainChannel] = useState(new BroadcastChannel(Broadcasting.MAIN_CHANNEL))
    const [appState, setAppState] = useState(appContextInitialState)


    const restart = () => {
        // TODO: Improve the way to reset application state
        window.location.reload()
    }

    useEffect(() => {

        const actionsMapping = {
            [BroadcastAction.ADD_CIRCLE]: () => appState.gameController.addNewCircle(),
            [BroadcastAction.START_GAME]: () => appState.gameController.start(),
            [BroadcastAction.STOP_GAME]: () => appState.gameController.stop(),
            [BroadcastAction.RESET_CIRCLES]: () => appState.gameController.resetCirclesState(),
            [BroadcastAction.RESET_GAME]: () => appState.gameController.resetGame(),
            [BroadcastAction.TRACK]: () => appState.appGlobalController.toggleTracking(),
            [BroadcastAction.SHOW_CAMERA]: () => appState.appGlobalController.toggleCamera(),
            [BroadcastAction.SHOW_TRACKING]: () => appState.appGlobalController.toggleTrackingLandmarks(),
            [BroadcastAction.RESTART]: () => restart()
        }

        mainChannel.onmessage = (event: MessageEvent) => {
            const message = event.data as BroadcastMessage
            const action = actionsMapping[message.action]
            if(!action) return
            action()
        }
    }, [appState])

    return (
        <AppContext.Provider value={appState}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextWrapper