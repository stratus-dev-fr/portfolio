import { useEffect, useState } from "react"
import { useFrame, useThree, useLoader } from "@react-three/fiber"
import gsap, { Back } from "gsap"
import * as THREE from "three"

export default function ElementMobile(props) {
    const ref = props.meshRef

    const [, setLoad] = props.load
    const index = props.index

    const texture = useLoader(THREE.TextureLoader, index === 0 ? "./assets/launcherauto.png" : index === 1 ? "./assets/ltdd.png" : "./assets/bbcs.png", e => console.log(e))

    const [active, setActive] = props.activeState

    const [sceneCamera, setSceneCamera] = useState()
    const [sceneGL, setSceneGL] = useState()
    const [meshPosition, setMeshPosition] = useState([0, 0, 0])
    const [, setTime] = useState(0.0)

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
                setMeshPosition([0, -5.5, -0.5])
                break

            case 2:
                setMeshPosition([0, 5.5, -0.5])
                break

            default:
                setMeshPosition([0, 0, -0.5])
                break
        }

        if (ref.current) {
            setLoad(true)

            if (active.value) {
                gsap.to([offset.value, offsetRGB.value], { x: 0, y: 0 }).duration(0.25)
            } else {
                gsap.to(ref.current.position, {
                    y: index === 0 ? -5.5 : index === 1 ? 0 : index === 2 ? 5.5 : 0,
                    ease: Back.easeInOut.config(3)
                }).duration(0.75)
            }
        }
    }, [ref, active, setLoad, index, offset.value, offsetRGB.value])

    useFrame(({ clock }) => {
        setTime(clock.elapsedTime)

        if (ref.current)
            ref.current.rotation.y += 0.0025
    })

    return <mesh
        onClick={() => {
            setActive({ value: true, index: index })

            gsap.to(ref.current.position, {
                y: 0,
                ease: Back.easeInOut.config(3)
            }).duration(0.75)
        }}
        position={meshPosition}
        ref={ref}
    >
        <boxGeometry args={[2.4, 4.6, 2.4, 32, 32]} />
        <waveShaderMaterial
            uTexture={texture}
            uOffset={offset.value}
            uOffsetRGB={offsetRGB.value}
        />
    </mesh>
}