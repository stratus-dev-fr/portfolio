import { Suspense, useEffect, useState, useRef } from "react"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Canvas, extend, useFrame, useThree, useLoader } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import glsl from "babel-plugin-glsl/macro"
import gsap, { Back } from "gsap"
import * as THREE from "three"
import Stats from "stats.js"

import Project from "./Project"

const WaveShaderMaterial = shaderMaterial(
	// uniform
	{
		uResolution: new THREE.Vector2(0, 0),
		uTexture: new THREE.Texture(),
		uOffset: { x: 0, y: 0, z: 0 },
		uOffsetRGB: { x: 0, y: 0, z: 0 }
	},
	// vertex
	glsl`
		precision highp float;

		uniform sampler2D uTexture;
		uniform vec2 uOffset;
		varying vec2 vUv;
		
		float M_PI = 3.141529;
		
		vec3 deformationCurve(vec3 position, vec2 uv, vec2 offset) {
			position.x += sin(uv.y * M_PI) * offset.x;
			position.y += sin(uv.x * M_PI) * offset.y;
			position.z += sin(uv.y * M_PI) * offset.x;
			
			return position;
		}
		
		void main() {
			vUv = uv;

			vec3 newPosition = deformationCurve(position, uv, uOffset);
			gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
		}
  	`,
	// fragment
	glsl`
		precision highp float;

		uniform sampler2D uTexture;
		uniform vec2 uOffsetRGB;

		varying vec2 vUv;

		void main () {
			float r = texture2D(uTexture, vUv + uOffsetRGB).r;
			vec2 gb = texture2D(uTexture, vUv).gb;

			vec3 color = vec3(r, gb);

			gl_FragColor = vec4(color, 1.0);
		}
  	`)

extend({ WaveShaderMaterial, OrbitControls })

const CameraControler = () => {
	const { camera, gl, scene } = useThree()

	useEffect(() => {
		// new OrbitControls(camera, gl.domElement)
	}, [camera, gl, scene])

	return null
}

const Element = props => {
	const ref = props.meshRef

	const [, setLoad] = props.load
	const index = props.index

	const texture = useLoader(THREE.TextureLoader, index === 0 ? "./assets/launcherauto.png" : index === 1 ? "./assets/ltdd.png" : "./assets/bbcs.png", e => console.log(e))

	const [sceneCamera, setSceneCamera] = useState()
	const [sceneGL, setSceneGL] = useState()

	const [hovered, setHovered] = useState(false)
	const [active, setActive] = props.activeState
	const [cooldown, setCooldown] = useState(false)

	const [meshPosition, setMeshPosition] = useState([0, 0, -1])

	const [, setTime] = useState(0.0)

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
					gsap.to(offset.value, { x: e.movementX * 0.01, y: e.movementX * 0.01 }).duration(0.25)
					gsap.to(offsetRGB.value, { x: e.movementX * 0.002, y: e.movementX * 0.002 }).duration(0.25)

					gsap.to(
						position,
						{
							x: mouseCoord.x * 5 + (index === 0 ? -10 : index === 1 ? 0 : 10),
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

		if (ref.current)
			ref.current.rotation.y += 0.0025
	})

	return <mesh
		onClick={() => {
			setActive({ value: true, index: index })

			if (hovered) {
				gsap.to(ref.current.position, {
					x: index === 0 ? -6 : index === 1 ? 4 : 14,
					y: 0, ease: Back.easeInOut.config(3)
				}).duration(0.75)
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

					default:
						gsap.to(sceneCamera.position, { x: 0, ease: Back.easeOut.config(1.5) }).duration(0.75).then(() => setCooldown(false))
						break
				}
			}
		}}
		onPointerLeave={() => setHovered(false)}
		position={meshPosition}
		ref={ref}
	>
		<boxGeometry args={[3.4, 5.6, 3.4, 32, 32]} />
		<waveShaderMaterial
			uTexture={texture}
			uOffset={offset.value}
			uOffsetRGB={offsetRGB.value}
		/>
	</mesh>
}

export default function Scene() {
	const loadRef = useRef()
	const loadContainerRef = useRef()

	const firstRef = useRef()
	const secondRef = useRef()
	const thirdRef = useRef()

	const [load, setLoad] = useState(false)
	const [active, setActive] = useState({ value: false, index: 0 })

	useEffect(() => {
		const stats = new Stats()

		stats.showPanel(0)

		document.body.append(stats.dom)

		const animate = () => {
			requestAnimationFrame(animate)

			stats.begin()
			stats.end()
		}

		animate()

		// remove loading page
		if (load) {
			gsap.to(loadContainerRef.current, { opacity: 0, ease: Back.easeInOut.config(2) }).duration(0.75).then(() => loadContainerRef.current.style = "display: none;")
			gsap.to(loadRef.current.position, { y: -20, ease: Back.easeIn.config(2) }).duration(1.25)

			// space items when is active
			if (active) {
				const indexes = [0, 1, 2]

				indexes.splice(active.index, 1)

				indexes.forEach(index => {
					switch (index) {
						case 0:
							gsap.to(firstRef.current.position, { x: -15, ease: Back.easeInOut.config(3) }).duration(0.25)
							break

						case 1:
							gsap.to(secondRef.current.position, { x: active.index === 0 ? 10 : active.index === 2 ? -10 : 0, ease: Back.easeInOut.config(3) }).duration(0.25)
							break

						case 2:
							gsap.to(thirdRef.current.position, { x: 15, ease: Back.easeInOut.config(3) }).duration(0.25)
							break

						default:
							break
					}
				})
			}
		}
	}, [load, active])

	return (
		<div id="container">
			{active.value ?
				<Project activeState={[active, setActive]} />
				: undefined}

			<div ref={loadContainerRef} className="load">
				<p>Loading...</p>
			</div>

			<Canvas
				camera={{ fov: 90 }}
			>
				<CameraControler />
				<ambientLight color="black" />
				<pointLight position={[1, 1, 1]} color={"#ffffff"} />
				<directionalLight position={[0, 2, 5]} color={"#ffffff"} intensity={10.0} />

				<mesh ref={loadRef} position={[0, 0, 1]}>
					<planeGeometry args={[100, 20, 32, 32]} />
					<meshStandardMaterial color="white" />
				</mesh>

				<Suspense fallback={null}>
					<Element activeState={[active, setActive]} load={[load, setLoad]} index={0} meshRef={firstRef} />
					<Element activeState={[active, setActive]} load={[load, setLoad]} index={1} meshRef={secondRef} />
					<Element activeState={[active, setActive]} load={[load, setLoad]} index={2} meshRef={thirdRef} />
				</Suspense>
			</Canvas>
		</div>
	)
}