import * as THREE from 'three'
import React, { useRef, useState } from 'react'
import { Canvas, useFrame, ThreeElements, useThree, ThreeEvent } from '@react-three/fiber'
import { Vector3 } from 'three'


function Circle(props: ThreeElements['mesh']) {

    const ref = useRef<THREE.Mesh>(null)
    const [pulsing, pulse] = useState(false)
    const [time, setTime] = useState(0);
    const [dragging, setDragging] = useState(false);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const { camera, mouse } = useThree();



    useFrame((state, delta) => {

        if (pulsing) {
            setTime(state.clock.getElapsedTime());
            ref.current && ref.current.scale.set(
                1 + Math.sin(time * 4) * 0.3,
                1 + Math.sin(time * 4) * 0.3,
                0
            );
        } else {
            ref.current && ref.current.scale.set(
                1,
                1,
                1
            );
        }

        if(dragging){
            const mouseX = (mouse.x );
            const mouseY = (mouse.y);
        
            const x = mouseX + offset.x;
            const y = mouseY + offset.y;
        
            console.log(x, y)
            ref.current?.position.set(x, y, 0);
        }

    })

    return (
        <>
            <mesh
                ref={ref}
                {...props}
                // onClick={() => {
                //     pulse(!pulsing)
                // }}
                onPointerDown={(e) => {
                    console.log("Pointer down")
                    setDragging(true)

                    const { x, y } = ref.current!.position;
                    setOffset({ x: x - mouse.x, y: y - mouse.y });
                }}
                onPointerUp={(e) => {
                    console.log("Pointer up")
                    setDragging(false)
                }}
                onPointerOut={(e) => {
                    setDragging(false)
                }}
            >
                <circleGeometry args={[0.2, 35]} />
                <meshBasicMaterial />
            </mesh>
        </>
    );
}

export default function Lab() {

    const canvasRef = useRef<any>(null);

    React.useEffect(() => {
        if (canvasRef.current) {
            canvasRef.current.width = window.innerWidth;
            canvasRef.current.height = window.innerHeight;
        }
    }, []);

    const circles = [{
        position: new Vector3(0.2, 0, 0),
    },
    {
        position: new Vector3(0, 0, 0),
    }]

    return (
        <Canvas ref={canvasRef}
            onCreated={({ gl, camera }) => {
                gl.setClearColor('black');
                gl.clearColor();
            }}
        >
            <ambientLight />
            <pointLight position={[10, 10, 10]} />
            {circles.map((c, index) => {
                return <Circle key={index} position={c.position} />
            })}

        </Canvas>
    )
}