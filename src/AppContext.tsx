import { createContext } from "react";
import { AppController } from "./AppGlobalController";
import { GameController } from "./Game/GameController";
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

    return (
        <AppContext.Provider value={appContextInitialState}>
            {children}
        </AppContext.Provider>
    )
}

export default AppContextWrapper