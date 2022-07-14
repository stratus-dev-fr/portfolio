import { useEffect, useState } from "react"
import { useFrame, useThree, useLoader } from "@react-three/fiber"
import gsap, { Back } from "gsap"
import * as THREE from "three"

export default function Element(props) {
    const ref = props.meshRef

    const [, setLoad] = props.load
    const index = props.index

    const texture = useLoader(THREE.TextureLoader, index === 0 ? "./assets/laptop/launcherauto.png" : index === 1 ? "./assets/laptop/ltdd.png" : index === 3 ? "./assets/laptop/megt.png" : "./assets/laptop/bbcs.png", e => console.log(e))

    const [sceneCamera, setSceneCamera] = useState()
    const [sceneGL, setSceneGL] = useState()

    const [hovered, setHovered] = useState(false)
    const [active, setActive] = props.activeState
    const [cooldown, setCooldown] = useState(false)

    const [meshPosition, setMeshPosition] = useState([0, 0, -1])

    const [time, setTime] = useState(0.0)

    const [mouseCoord, setMouseCoord] = useState({ x: 0, y: 0 })

    const [offset] = useState({ value: { x: 0, y: 0, z: 0 } })
    const [offsetRGB] = useState({ value: { x: 0, y: 0, z: 0 } })

    const [lastCoords] = useState({ x: 0, y: 0 })

    useThree(({ gl, camera }) => {
        if (typeof sceneGL === "undefined")
            setSceneGL(gl)

        if (typeof sceneCamera === "undefined")
            setSceneCamera(camera)
    })

    useEffect(() => {
        switch (index) {
            case 0:
                setMeshPosition([-10, 0, -1])
                break

            case 2:
                setMeshPosition([10, 0, 0])
                break

            case 3:
                setMeshPosition([20, 0, 0])
                break

            default:
                break
        }

        if (ref.current) {
            setLoad(true)

            // mouse hover
            if (hovered && !active.value && !cooldown) {
                document.body.style = "cursor: pointer;"
                const position = ref.current.position

                document.onmousemove = e => {
                    gsap.to(offset.value, { x: e.movementX * 0.005, y: e.movementX * 0.005 }).duration(0.25)
                    gsap.to(offsetRGB.value, { x: e.movementX * 0.0005, y: e.movementX * 0.0005 }).duration(0.25)

                    gsap.to(
                        position,
                        {
                            x: mouseCoord.x * 5 + (index === 0 ? -10 : index === 1 ? 0 : index === 3 ? 20 : 10),
                            y: mouseCoord.y * 2,
                            ease: Back.easeOut.config(2.5)
                        }).duration(0.25)
                }

                // mouse leave
            } else if (!hovered && !active.value && (ref.current.position.x !== 0 || ref.current.position.y !== 0)) {
                document.body.style = "cursor: default;"
                document.onmousemove = null

                gsap.to([offset.value, offsetRGB.value], { x: 0, y: 0 }).duration(0.25)

                switch (index) {
                    case 0:
                        gsap.to(ref.current.position, { x: -10, y: 0, z: -1, ease: Back.easeOut.config(2.5) }).duration(0.75)
                        break

                    case 2:
                        gsap.to(ref.current.position, { x: 10, y: 0, z: -1, ease: Back.easeOut.config(2.5) }).duration(0.75)
                        break

                    case 3:
                        gsap.to(ref.current.position, { x: 20, y: 0, z: -1, ease: Back.easeOut.config(2.5) }).duration(0.75)
                        break

                    default:
                        gsap.to(ref.current.position, { x: 0, y: 0, z: -1, ease: Back.easeOut.config(2.5) }).duration(0.75)
                        break
                }

                // on click
            } else if (active.value) {
                document.body.style = "cursor: default;"
                document.onmousemove = null

                gsap.to([offset.value, offsetRGB.value], { x: 0, y: 0 }).duration(0.25)
            }
        }
    }, [hovered, active, offset, mouseCoord, setLoad, lastCoords, offsetRGB, index, ref, cooldown])

    useFrame(({ clock, mouse }) => {
        setTime(clock.elapsedTime)
        setMouseCoord(mouse)

        if (ref.current) {
            ref.current.rotation.y += 0.0025

            // ref.current.rotation.x = Math.cos(time / 4) / 8
            // ref.current.rotation.y = Math.sin(time / 4) / 8
            // ref.current.rotation.z = -0.2 - (1 + Math.sin(time / 1.5)) / 20
            if (!hovered || !active) {
                ref.current.position.y = (1 + Math.sin(time / 1.5)) / 5
                ref.current.position.x = ref.current.position.x + ((Math.cos(time / 1.5)) / 500)
            }
        }
    })

    return <mesh
        onClick={async () => {
            setActive({ value: true, index: index })

            if (hovered) {
                const timeline = gsap.timeline()

                const position = ref.current.position
                const animations = [offset.value, offsetRGB.value]

                timeline.add("start")
                    .to(position, {
                        x: index === 0 ? -6 : index === 1 ? 4 : index === 3 ? 24 : 14,
                        y: 0,
                        duration: 1,
                        ease: Back.easeInOut.config(3)
                    }, 0)
                    .to(animations[0], {
                        x: 0.5,
                        y: 0.5,
                        duration: 0.75,
                        ease: Back.easeInOut.config(3)
                    }, 0)
                    .to(animations[1], {
                        x: 0.05,
                        y: 0.05,
                        duration: 0.75,
                        ease: Back.easeInOut.config(3)
                    }, 0)

                timeline.to(animations, {
                    x: 0,
                    y: 0,
                    duration: 0.25
                }, 0.5)

                timeline.play()
            }
        }}
        onPointerOver={() => {
            setHovered(true)

            // go to project via camera
            if (parseInt(sceneCamera.position.x) !== parseInt(ref.current.position.x) && !cooldown) {
                setCooldown(true)

                switch (index) {
                    case 0:
                        gsap.to(sceneCamera.position, { x: -10, ease: Back.easeInOut.config(1.5) }).duration(0.75).then(() => setCooldown(false))
                        break

                    case 2:
                        gsap.to(sceneCamera.position, { x: 10, ease: Back.easeOut.config(1.5) }).duration(0.75).then(() => setCooldown(false))
                        break

                    case 3:
                        gsap.to(sceneCamera.position, { x: 20, ease: Back.easeOut.config(1.5) }).duration(0.75).then(() => setCooldown(false))
                        break

                    default:
                        gsap.to(sceneCamera.position, { x: 0, ease: Back.easeOut.config(1.5) }).duration(0.75).then(() => setCooldown(false))
                        break
                }
            }
        }}
        onPointerLeave={() => setHovered(false)}
        position={meshPosition}
        ref={ref}
        receiveShadow
        castShadow
    >
        <boxGeometry args={[3.4, 5.6, 3.4, 32, 32]} />
        <waveShaderMaterial
            uTexture={texture}
            uOffset={offset.value}
            uOffsetRGB={offsetRGB.value}
        />
    </mesh>
}