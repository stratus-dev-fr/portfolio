import { useEffect, useState } from "react"

import { TextGeometry } from "three/examples/jsm/geometries/TextGeometry"
import { useThree, useLoader, extend } from "@react-three/fiber"
import { Text } from "troika-three-text"
import gsap, { Back } from "gsap"
import * as THREE from "three"

extend({ TextGeometry, Text })

export const handleReturnMesh = active => {
    const position = active.position
    const offsetRGB = active.offsetRGB
    const index = active.index

    const timeline = gsap.timeline()

    timeline.add("start")
        .to(position, {
            y: 0,
            z: -0.5,
            ease: Back.easeOut.config(3)
        }, 0).duration(0.6)
        .to(offsetRGB.value, {
            x: 0.005,
            y: 0.005,
            ease: Back.easeOut.config(2),
            duration: 0.75
        }, 0)

    timeline
        .to(position, {
            z: index !== 1 ? 0 : 0.5,
            ease: Back.easeOut.config(3),
            duration: 0.25
        }, 0.3)
        .to(offsetRGB.value, {
            x: 0,
            y: 0,
            ease: Back.easeOut.config(2),
            duration: 0.5
        }, 0.4)
}

export default function ElementMobile(props) {
    const ref = props.meshRef

    const [, setLoad] = props.load
    const index = props.index

    const texture = useLoader(THREE.TextureLoader, index === 0 ? "./assets/mobile/launcherauto.png" : index === 1 ? "./assets/mobile/ltdd.png" : index === 3 ? "./assets/mobile/megt.png" : "./assets/mobile/bbcs.png", e => console.log(e))
    // const font = useLoader(FontLoader, '/font.json')

    const [active, setActive] = props.activeState

    const [sceneCamera, setSceneCamera] = useState()
    const [sceneGL, setSceneGL] = useState()
    const [meshPosition, setMeshPosition] = useState([0, 0, 0])

    const [offset] = useState({ value: { x: 0, y: 0, z: 0 } })
    const [offsetRGB] = useState({ value: { x: 0, y: 0, z: 0 } })

    useThree(({ gl, camera }) => {
        if (typeof sceneGL === "undefined")
            setSceneGL(gl)

        if (typeof sceneCamera === "undefined")
            setSceneCamera(camera)
    })

    useEffect(() => {
        switch (index) {
            case 0:
                setMeshPosition([0, -2.5, 0])
                break

            case 2:
                setMeshPosition([0, 0.5, 0])
                break

            default: // index 1
                setMeshPosition([0, 0, 0])
                break
        }

        if (ref.current) {
            setLoad(true)

            if (active.value) {
                gsap.to([offset.value, offsetRGB.value], { x: 0, y: 0 }).duration(0.25)
            } else {
                gsap.to(ref.current.position, {
                    x: 0,
                    y: index === 0 ? -3 : index === 1 ? 0 : index === 2 ? 3 : 0,
                    z: 0,
                    ease: Back.easeInOut.config(3)
                }).duration(0.75)
            }
        }
    }, [ref, active, setLoad, index, offset, offsetRGB])

    return <mesh
        onClick={() => {
            setActive({
                value: true,
                index: index,
                position: ref.current.position,
                offsetRGB
            })

            const timeline = gsap.timeline()

            const position = ref.current.position

            timeline.add("start")
                .to(position, {
                    y: 0,
                    z: 0.5,
                    ease: Back.easeOut.config(3)
                }, 0).duration(0.6)
                .to(offsetRGB.value, {
                    x: 0.005,
                    y: 0.005,
                    ease: Back.easeOut.config(2),
                    duration: 0.75
                }, 0)

            timeline
                .to(position, {
                    z: index !== 1 ? 0 : 0.5,
                    ease: Back.easeOut.config(3),
                    duration: 0.25
                }, 0.3)
                .to(offsetRGB.value, {
                    x: 0,
                    y: 0,
                    ease: Back.easeOut.config(2),
                    duration: 0.5
                }, 0.4)
        }}
        position={meshPosition}
        ref={ref}
    >
        <mesh position={[1.25, -0.5, 0.1]}>
            <text
                {...{
                    font: "Agatho",
                    fontSize: 1,
                    color: index === 0 ? "#1b1520" : index === 1 ? "#A85912" : "#28BA29",
                    maxWidth: 300,
                    lineHeight: 0,
                    letterSpacing: 0,
                    textAlign: "left"
                }}
                font={"https://dl.dropboxusercontent.com/s/9jw03nizfewmwy0/font.otf"}
                text={index === 0 ? "LA" : index === 1 ? "LTDD" : "BBCS"}
                anchorX="center"
                anchorY="middle"
            />
        </mesh>

        <planeGeometry args={[4.5, 2.3]} />
        <waveShaderMaterial
            uTexture={texture}
            uOffset={offset.value}
            uOffsetRGB={offsetRGB.value}
        />
    </mesh>
}