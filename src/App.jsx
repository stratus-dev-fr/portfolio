import { Suspense, useEffect, useState, useRef, useMemo } from "react"

import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { Canvas, extend, useThree } from "@react-three/fiber"
import { shaderMaterial } from "@react-three/drei"
import glsl from "babel-plugin-glsl/macro"
import gsap, { Back } from "gsap"
import * as THREE from "three"

import ElementMobile from "./ElementMobile"
import Project from "./Project"
import Element from "./Element"
import Loading from "./Loading"

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
		precision lowp float;

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
		precision lowp float;

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

	// eslint-disable-next-line react-hooks/exhaustive-deps
	const refs = [useRef(), useRef(), useRef(), useRef()];
	const elements = [
		{
			path_texture: './assets/laptop/launcherauto.png',
		},
		{
			path_texture: './assets/laptop/ltdd.png',
		},
		{
			path_texture: './assets/laptop/bbcs.png',
		},
		{
			path_texture: './assets/laptop/megt.png',
		}
	];

	const [load, setLoad] = useState(false)
	const [active, setActive] = useState({ value: false, index: 0 })

	useEffect(() => {
		if (load) {
			// remove loading page
			gsap.to(loadContainerRef.current, {
				opacity: 0,
				ease: Back.easeInOut.config(2)
			}).duration(0.75).then(() => loadContainerRef.current.style = "display: none;")

			gsap.to(loadRef.current.position, {
				y: window.outerWidth >= 768 ? -20 : -10,
				ease: Back.easeIn.config(2)
			}).duration(1.25)

			// space items when is active
			if (active) {
				const indexes = [0, 1, 2, 3]

				indexes.splice(active.index, 1)

				indexes.forEach(index => {
					switch (index) {
						case 0:
							gsap.to(refs[0].current.position, {
								x: window.outerWidth >= 768 ? -15 : 0,
								y: window.outerWidth <= 768 ? active.index === 1 ? -4.5 : -3 : 0,
								ease: Back.easeInOut.config(3)
							}).duration(window.outerWidth >= 768 ? 0.5 : 0.25)
							break

						case 1:
							gsap.to(refs[1].current.position, {
								x: window.outerWidth >= 768 ? active.index === 0 ? 10 : active.index === 2 ? -10 : 0 : 0,
								y: window.outerWidth <= 768 ? active.index === 0 ? -3 : active.index === 2 ? 3 : 0 : 0,
								ease: Back.easeInOut.config(3)
							}).duration(window.outerWidth >= 768 ? 0.5 : 0.25)
							break

						case 2:
							gsap.to(refs[2].current.position, {
								x: window.outerWidth >= 768 ? active.index === 3 ? -5 : 15 : 0,
								y: window.outerWidth <= 768 ? active.index === 1 ? 4.5 : 3 : 0,
								ease: Back.easeInOut.config(3)
							}).duration(window.outerWidth <= 768 ? 0.5 : 0.25)
							break

						case 3:
							if (window.innerWidth >= 768) gsap.to(refs[3].current.position, {
								x: window.outerWidth >= 768 ? active.index === 2 ? 24 : 20 : 0,
								y: window.outerWidth <= 768 ? active.index === 1 ? 4.5 : 3 : 0,
								ease: Back.easeInOut.config(3)
							}).duration(window.outerWidth <= 768 ? 0.5 : 0.25)
							break

						default:
							break
					}
				})
			}
		}
	}, [load, active, refs])

	return (
		<div id="container">
			{active.value ?
				<Project activeState={[active, setActive]} />
				: undefined}

			<Loading meshRef={loadContainerRef} />

			{window.outerWidth >= 768 ? // laptop
				<Canvas
					shadows
					shadowMap
					camera={{ fov: 90 }}
				>
					<CameraControler />
					<pointLight position={[1, 1, 1]} color={"#ffffff"} />
					<directionalLight position={[0, 2, 5]} color={"#ffffff"} intensity={10.0} />

					<mesh ref={loadRef} position={[0, 0, 1]}>
						<planeGeometry args={[100, 20, 32, 32]} />
						<meshStandardMaterial color="white" />
					</mesh>

					<Suspense fallback={null}>
						{refs.map((ref, i) => <Element activeState={[active, setActive]} load={[load, setLoad]} options={elements[i]} index={i} key={i} meshRef={ref} />)}
					</Suspense>
				</Canvas>

				: // mobile

				<Canvas
					camera={{ fov: 90 }}
				>
					<CameraControler />
					<ambientLight color="white" />
					<pointLight position={[1, 1, 1]} color={"#ffffff"} />
					<directionalLight position={[0, 2, 5]} color={"#ffffff"} intensity={10.0} />

					<mesh ref={loadRef} position={[0, 0, 1]}>
						<planeGeometry args={[10, 10, 32, 32]} />
						<meshStandardMaterial color="white" />
					</mesh>

					<Suspense fallback={null}>
						{[0, 1, 2].map((_, i) => <ElementMobile activeState={[active, setActive]} load={[load, setLoad]} index={i} key={i} meshRef={refs[i]} />)}
					</Suspense>
				</Canvas>}
		</div>
	)
}