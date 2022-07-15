import { useRef, useEffect } from "react"
import gsap, { Back } from "gsap"

export default function Project(props) {
	const [active, setActive] = props.activeState

	const ref = useRef()
	const descriptionRef = useRef()
	const buttonRef = useRef()

	useEffect(() => {
		buttonRef.current.onmouseover = () => {
			gsap.to(buttonRef.current, { background: "black", color: "white", cursor: "pointer" }).duration(0.25)
		}

		buttonRef.current.onmouseleave = () => {
			gsap.to(buttonRef.current, { background: "white", color: "black", cursor: "default" }).duration(0.25)
		}

		gsap.fromTo(ref.current, { opacity: 0 }, { opacity: 1 }).duration(0.25)
		gsap.fromTo([descriptionRef.current, buttonRef.current],
			{ opacity: 0, y: 100 },
			{ opacity: 1, y: 0, ease: Back.easeOut.config(1.5), stagger: 0.1 }).duration(0.5)
	}, [])

	return (
		active.index === 0 ?
			ProjectElement(setActive, active, ref, descriptionRef, buttonRef, "LauncherAuto", "Creez votre launcher en un instant", <>
				<p>A generator of launchers for Minecraft servers, it was made in October 2020.</p>
				<p>The first purpose was to automate the creation of launchers, a service that cost a lot manually.</p>
				<p>Currently, its purpose is to provide in all Minecraft servers domain, all manual services that cost a lot, converted to automation.</p>
			</>, "https://launcherauto.com")

			: active.index === 1 ?
				ProjectElement(setActive, active, ref, descriptionRef, buttonRef, "LTDD", "La Taverne Du Design", <>
					<p>LTDD is a studio for artistic creations, which was a project that I loved to work on.</p>
					<p>My job was to convert the Figma design to a React.js website, including GSAP, CSS3 and React-router-dom.</p>
					<p>I learned a lot about the React.js framework and how hooks works.</p>
				</>, "https://ltdd.netlify.app")

				: active.index === 2 ?
					ProjectElement(setActive, active, ref, descriptionRef, buttonRef, "BBCS", "Billiard Ball Creative Studio", <>
						<p>BBCS was a studio for artistic creations, which is now permenantly closed.</p>
						<p>It grows me a lot about SEO and performance, thanks to working with HTML5, CSS3 and JavaScript.</p>
						<p>I next learned next Next.js and static builds, that helps a lot about SEO and web performance.</p>
					</>, "https://bbcs.netlify.app")

					: active.index === 3 ?
						ProjectElement(setActive, active, ref, descriptionRef, buttonRef, "Metaverse GT", "Feel the power!", <>
							<p>Creating a new metaverse open to everyone, without login required, on a website.</p>
							<p>This multiplayer metaverse has been created in only 4 months.</p>
						</>, "https://megt.io") : undefined
	)
}

const handleClose = (e, ref, active, setActive, descriptionRef, buttonRef) => {
	e.preventDefault()

	gsap.to(ref.current, { opacity: 0 }).duration(0.5)
	gsap.to([descriptionRef.current, buttonRef.current],
		{ opacity: 0, y: 100, ease: Back.easeIn.config(window.outerWidth <= 768 ? 2 : 1.5), stagger: 0.1 })
		.duration(window.outerWidth <= 768 ? 0.3 : 0.5)
		.then(() => setActive({ value: false, index: active.index }))

	if (window.outerWidth <= 768 && active.index !== 1)
		require("./ElementMobile").handleReturnMesh(active)
}

function ProjectElement(setActive, active, ref, descriptionRef, buttonRef, title, subtitle, description, url) {
	return <div ref={ref} className={`project ${title.toLowerCase()}`}>
		<div ref={descriptionRef}>
			<div>
				<h1>{title}</h1>
				<h2>{subtitle}</h2>
			</div>

			<div className="description">
				{description}
				<a href={url} target="_blank" rel="noopener noreferrer">Visit</a>
			</div>

			<button ref={buttonRef} onClick={e => handleClose(e, ref, active, setActive, descriptionRef, buttonRef)}>Close</button>
		</div>
	</div>
}