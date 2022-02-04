import { Suspense, useEffect, useState, useRef } from "react"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Canvas, extend, useThree } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import glsl from "babel-plugin-glsl/macro"
import gsap, { Back } from "gsap"
import * as THREE from "three"
import Stats from "stats.js"

import Loading from "./Loading"
import Project from "./Project"
import Element from "./Element"
import ElementMobile from "./ElementMobile"

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

		if (load) {
			// remove loading page
			gsap.to(loadContainerRef.current, {
				opacity: 0,
				ease: Back.easeInOut.config(2)
			}).duration(0.75)
			
			gsap.to(loadRef.current.position, {
				y: window.outerWidth >= 768 ? -20 : -10,
				ease: Back.easeIn.config(2)
			}).duration(1.25).then(() => loadContainerRef.current.style = "display: none;")

			// space items when is active
			if (active) {
				const indexes = [0, 1, 2]

				indexes.splice(active.index, 1)

				indexes.forEach(index => {
					switch (index) {
						case 0:
							gsap.to(firstRef.current.position, {
								x: window.outerWidth >= 768 ? -15 : 0,
								y: window.outerWidth <= 768 ? -7.5 : 0,
								ease: Back.easeInOut.config(3)
							}).duration(0.25)
							break

						case 1:
							gsap.to(secondRef.current.position, {
								x: window.outerWidth >= 768 ? active.index === 0 ? 10 : active.index === 2 ? -10 : 0 : 0,
								y: window.outerWidth <= 768 ? active.index === 0 ? -5.5 : active.index === 2 ? 5.5 : 0 : 0,
								ease: Back.easeInOut.config(3)
							}).duration(0.25)
							break

						case 2:
							gsap.to(thirdRef.current.position, {
								x: window.outerWidth >= 768 ? 15 : 0,
								y: window.outerWidth <= 768 ? 7.5 : 0,
								ease: Back.easeInOut.config(3)
							}).duration(0.25)
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

			<Loading meshRef={loadContainerRef} />

			{window.outerWidth >= 768 ? // laptop
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

				: // mobile

				<Canvas
					camera={{ fov: 90 }}
				>
					<CameraControler />
					<ambientLight color="black" />
					<pointLight position={[1, 1, 1]} color={"#ffffff"} />
					<directionalLight position={[0, 2, 5]} color={"#ffffff"} intensity={10.0} />

					<mesh ref={loadRef} position={[0, 0, 1]}>
						<planeGeometry args={[10, 10, 32, 32]} />
						<meshStandardMaterial color="white" />
					</mesh>

					<Suspense fallback={null}>
						<ElementMobile activeState={[active, setActive]} load={[load, setLoad]} index={0} meshRef={firstRef} />
						<ElementMobile activeState={[active, setActive]} load={[load, setLoad]} index={1} meshRef={secondRef} />
						<ElementMobile activeState={[active, setActive]} load={[load, setLoad]} index={2} meshRef={thirdRef} />
					</Suspense>
				</Canvas>}
		</div>
	)
}