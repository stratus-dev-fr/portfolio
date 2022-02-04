import { useRef, useEffect } from "react"
import gsap, { Back } from "gsap"

export default function Project(props) {
	const [active, setActive] = props.activeState
	const ref = useRef()

	useEffect(() => {
		gsap.fromTo(ref.current, { opacity: 0, y: 100 }, { opacity: 1, y: 0, ease: Back.easeOut.config(1.5) }).duration(0.5)
	}, [])

	return (
		active.index === 0 ?
			LauncherAutoProject(setActive, active, ref)

			: active.index === 1 ?
				LTDDProject(setActive, active, ref)

				: active.index === 2 ?
					BBCSProject(setActive, active, ref) : undefined
	)
}

const handleClose = (e, ref, active, setActive) => {
	e.preventDefault()

	console.log(ref.current.className);

	gsap.to(ref.current, {
		opacity: 0, y: 100, ease: Back.easeIn.config(1.5)
	})
		.duration(0.5)
		.then(() => setActive({ value: false, index: active.index }))
}

function BBCSProject(setActive, active, ref) {
	return <div ref={ref} className="project bbcs">
		<div>
			<div>
				<h1>BBCS</h1>
				<h2>Billiard Ball Creative Studio</h2>
			</div>

			<div className="description">
				<p>BBCS was a studio for artistic creations, which is now permenantly closed.</p>
				<p>It grows me a lot about SEO and performance, thanks to working with HTML5, CSS3 and JavaScript.</p>
				<p>I next learned next Next.js and static builds, that helps a lot about SEO and web performance.</p>

				<a href="https://bbcs.netlify.app" target="_blank" rel="noopener noreferrer">Visit</a>
			</div>

			<button onClick={e => handleClose(e, ref, active, setActive)}>Close</button>
		</div>
	</div>
}

function LTDDProject(setActive, active, ref) {
	return <div ref={ref} className="project ltdd">
		<div>
			<div>
				<h1>LTDD</h1>
				<h2>La Taverne Du Design</h2>
			</div>

			<div className="description">
				<p>LTDD is a studio for artistic creations, which was a project that I loved to work on.</p>
				<p>My job was to convert the Figma design to a React.js website, including GSAP, CSS3 and React-router-dom.</p>
				<p>I learned a lot about the React.js framework and how hooks works.</p>

				<a href="https://ltdd.netlify.app" target="_blank" rel="noopener noreferrer">Visit</a>
			</div>

			<button onClick={e => handleClose(e, ref, active, setActive)}>Close</button>
		</div>
	</div>
}

function LauncherAutoProject(setActive, active, ref) {
	return <div ref={ref} className="project launcherauto">
		<div>
			<div>
				<h1>LauncherAuto</h1>
				<h2>Creez votre launcher en un instant</h2>
			</div>

			<div className="description">
				<p>A generator of launchers for Minecraft servers, it was made in October 2020.</p>
				<p>The first purpose was to automate the creation of launchers, a service that cost a lot manually.</p>
				<p>Currently, its purpose is to provide in all Minecraft servers domain, all manual services that cost a lot, converted to automation.</p>

				<a href="https://launcherauto.com" target="_blank" rel="noopener noreferrer">Visit</a>
			</div>
		</div>

		<button onClick={e => handleClose(e, ref, active, setActive)}>Close</button>
	</div>
}
