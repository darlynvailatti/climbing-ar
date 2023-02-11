import { createContext, useEffect, useState } from "react";
import { AppController } from "./AppGlobalController";
import { GameController } from "./Game/Controller/GameController";
import { BroadcastAction, Broadcasting, BroadcastMessage } from "./Game/Model/constants";
import { TrackingEngineController } from "./Game/Controller/TrackingEngineController";

export interface AppContextState {
    appGlobalController: AppController
    trackingEngineController: TrackingEngineController
    gameController: GameController
    executeAction: (action: BroadcastAction, params: any) => void
}

export interface AppContextWrapperProps {
    children: any
}

const appContextInitialState = {
    appGlobalController: new AppController(),
    trackingEngineController: new TrackingEngineController(),
    gameController: new GameController(),
    executeAction: (action: BroadcastAction, params: any) => {}
}

export const AppContext = createContext<AppContextState>(appContextInitialState)

function AppContextWrapper({ children }: AppContextWrapperProps) {
    const [mainChannel] = useState(new BroadcastChannel(Broadcasting.MAIN_CHANNEL))
    const [appState] = useState(appContextInitialState)

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


    useEffect(() => {
    }, [appState])

    return (
        <AppContext.Provider value={{...appState, executeAction}}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextWrapper