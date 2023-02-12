import { useContext, useEffect, useRef, useState } from "react"
import { Layer, Stage } from "react-konva";
import Konva from 'konva';
import { AppContext } from "../AppContext";
import { BroadcastAction, Broadcasting, BroadcastMessage } from "./Model/constants";
import { CircleInteractionEvent, CircleTouchedEvent, CircleRemovedEvent } from "./Controller/types";

export default function Backstage() {
    const appContext = useContext(AppContext)
    const gameLayerRef = useRef<Konva.Layer>(null)

    const [mainChannel] = useState(new BroadcastChannel(Broadcasting.MAIN_CHANNEL))

    const restart = () => {
        // TODO: Improve the way to reset application state
        window.location.reload()
    }

    useEffect(() => {
        if (gameLayerRef.current)
            appContext.gameController.setup(gameLayerRef.current)

        const actionsMapping: any = {

            // Game controller
            [BroadcastAction.ADD_CIRCLE]: () => appContext.gameController.addNewCircle(),
            [BroadcastAction.START_GAME]: () => appContext.gameController.start(),
            [BroadcastAction.STOP_GAME]: () => appContext.gameController.stop(),
            [BroadcastAction.RESET_CIRCLES]: () => appContext.gameController.resetCirclesState(),
            [BroadcastAction.RESET_GAME]: () => appContext.gameController.resetGame(),

            // From Events
            [BroadcastAction.CIRCLE_INTERACTION]: (params: CircleInteractionEvent) => appContext.gameController.circleInteraction(params),
            [BroadcastAction.CIRCLE_TOUCHED]: (params: CircleTouchedEvent) => appContext.gameController.circleTouched(params),
            [BroadcastAction.CIRCLE_REMOVED]: (params: CircleRemovedEvent) => appContext.gameController.circleRemoved(params),

            // App global
            [BroadcastAction.RESTART]: () => restart()
        }

        mainChannel.onmessage = (event: MessageEvent) => {
            const message = event.data as BroadcastMessage
            const action: any = actionsMapping[message.action]
            if(!action) return
            action(message.params)
        }
    }, [])

    return (
        <Stage
            style={{
                backgroundColor: "black"
            }}
            width={window.innerWidth}
            height={window.innerHeight}>
            <Layer ref={gameLayerRef} />
        </Stage>
    )
}