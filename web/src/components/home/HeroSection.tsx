import { Button } from "../../ui/Button";
import Icon from "../../ui/Icon";
import { FaGithub } from "react-icons/fa";
import { motion } from "motion/react";
import { useThemeStore } from "../../store/themeStore";
import { useRef, useEffect } from "react";
import { useNavigate } from "react-router";

export default function HeroSection() {
	const theme = useThemeStore((state) => state.theme);
	const videoRef = useRef<HTMLVideoElement>(null);
	const navigate = useNavigate();

	// Auto-start video when it enters viewport
	useEffect(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting && videoRef.current) {
						videoRef.current.play();
					}
				});
			},
			{ threshold: 0.4 }
		);

		if (videoRef.current) {
			observer.observe(videoRef.current);
		}

		return () => observer.disconnect();
	}, []);

	return (
		<main className="px-6 md:px-12 lg:px-20 py-12 lg:py-20">
			<div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
				{/* Content Section */}
				<motion.section
					className="space-y-8"
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					{/* Hero Text */}
					<div className="space-y-6">
						<motion.div
							className="space-y-4"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.2 }}
						>
							<h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
								<span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 dark:from-white dark:via-gray-100 dark:to-white bg-clip-text text-transparent">
									All your thoughts,
								</span>
								<br />
								<span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-400 dark:via-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
									one connected space.
								</span>
							</h1>
							<motion.h3
								className="text-lg md:text-xl text-gray-600 dark:text-gray-300 font-medium italic"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ duration: 0.6, delay: 0.4 }}
							>
								{`"Tag it. Link it. See the bigger picture."`}
							</motion.h3>
						</motion.div>

						<motion.p
							className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-2xl"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.6 }}
						>
							Memora helps you think better — write, connect, and
							visualize your ideas while an AI assistant makes
							your knowledge truly alive.
						</motion.p>
					</div>

					{/* Action Buttons */}
					<motion.div
						className="flex flex-col sm:flex-row gap-4"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.8 }}
					>
						<Button
							size="large"
							level="primary"
							className="flex-1 sm:flex-none"
							onClick={() => navigate("/dashboard")}
						>
							Start your space
						</Button>
						<Button
							size="large"
							level="secondary"
							className="flex-1 sm:flex-none"
							onClick={() => navigate("/signin")}
						>
							Sign in
						</Button>
					</motion.div>

					{/* GitHub Link */}
					<motion.div
						className="pt-8"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ duration: 0.8, delay: 1.0 }}
					>
						<motion.a
							href="https://github.com"
							target="_blank"
							rel="noopener noreferrer"
							className="inline-flex items-center gap-3 px-4 py-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-200/30 dark:border-gray-700/30 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all duration-200 group"
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							<Icon className="text-gray-700 dark:text-gray-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
								<FaGithub />
							</Icon>
							<span className="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
								View on GitHub
							</span>
						</motion.a>
					</motion.div>
				</motion.section>

				{/* Hero Image Section */}
				<motion.section
					className="relative"
					initial={{ opacity: 0, scale: 0.95 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
				>
					<div className="relative">
						{/* Glow effect behind image */}
						<div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 via-blue-500/20 to-indigo-600/20 rounded-2xl blur-3xl scale-110" />

						{/* Image container */}
						<div className="relative bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200/20 dark:border-gray-700/20 overflow-hidden shadow-2xl">
							{theme === "dark" && (
								<img
									src="/hero-dark.png"
									alt="Memora - Connected knowledge visualization interface"
									className="w-full h-auto object-cover"
								/>
							)}
							{theme === "light" && (
								<img
									src="/hero-light.png"
									alt="Memora - Connected knowledge visualization interface"
									className="w-full h-auto object-cover"
								/>
							)}
						</div>

						{/* Floating elements for visual interest */}
						<motion.div
							className="absolute -top-4 -right-4 w-8 h-8 bg-sky-500/20 rounded-full blur-xl"
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.3, 0.6, 0.3],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
						<motion.div
							className="absolute -bottom-4 -left-4 w-12 h-12 bg-indigo-500/20 rounded-full blur-xl"
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.2, 0.5, 0.2],
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 1,
							}}
						/>
					</div>
				</motion.section>
			</div>

			{/* Product Demo Video Section */}
			<motion.section
				className="mt-24 lg:mt-32"
				data-section="video"
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1, delay: 1.2 }}
			>
				<div className="max-w-6xl mx-auto">
					{/* Section Header */}
					<motion.div
						className="text-center mb-12"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 1.4 }}
					>
						<h2 className="text-3xl md:text-4xl font-bold mb-4">
							<span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
								See Memora in action
							</span>
						</h2>
						<p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
							Watch how seamlessly you can connect ideas,
							visualize knowledge, and let AI enhance your
							thinking process.
						</p>
					</motion.div>

					{/* Video Container */}
					<motion.div
						className="relative group"
						initial={{ opacity: 0, scale: 0.95 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 1, delay: 1.6 }}
					>
						{/* Glow effect */}
						<div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-blue-500/20 to-indigo-500/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

						{/* Video wrapper */}
						<div className="relative bg-gradient-to-br from-white/80 to-gray-100/80 dark:from-gray-900/80 dark:to-gray-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/30 overflow-hidden shadow-2xl">
							{/* Video element */}
							{theme === "dark" && (
								<video
									ref={videoRef}
									className="w-full h-auto rounded-2xl"
									muted
									loop
									autoPlay
									preload="auto"
									playsInline
									onLoadedMetadata={() => {
										if (videoRef.current) {
											videoRef.current.playbackRate = 1.15;
										}
									}}
								>
									<source
										src="/memora-dark.mp4"
										type="video/mp4"
									/>
									Your browser does not support the video tag.
								</video>
							)}
							{theme === "light" && (
								<video
									ref={videoRef}
									className="w-full h-auto rounded-2xl"
									muted
									loop
									autoPlay
									preload="auto"
									playsInline
									onLoadedMetadata={() => {
										if (videoRef.current) {
											videoRef.current.playbackRate = 1.15;
										}
									}}
								>
									<source
										src="/memora-light.mp4"
										type="video/mp4"
									/>
									Your browser does not support the video tag.
								</video>
							)}
						</div>

						{/* Decorative elements */}
						<motion.div
							className="absolute -top-6 -left-6 w-12 h-12 bg-sky-400/20 rounded-full blur-xl"
							animate={{
								scale: [1, 1.4, 1],
								opacity: [0.3, 0.7, 0.3],
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
						<motion.div
							className="absolute -bottom-6 -right-6 w-16 h-16 bg-indigo-400/20 rounded-full blur-xl"
							animate={{
								scale: [1, 1.2, 1],
								opacity: [0.2, 0.6, 0.2],
							}}
							transition={{
								duration: 5,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 2,
							}}
						/>
						<motion.div
							className="absolute top-1/4 -right-8 w-8 h-8 bg-blue-400/20 rounded-full blur-lg"
							animate={{
								scale: [1, 1.3, 1],
								opacity: [0.4, 0.8, 0.4],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
								delay: 1,
							}}
						/>
					</motion.div>

					{/* Feature highlights below video */}
					<motion.div
						className="grid md:grid-cols-3 gap-6 mt-16"
						initial={{ opacity: 0, y: 30 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 2.0 }}
					>
						{[
							{
								title: "Smart Connections",
								description:
									"AI automatically suggests relevant links between your ideas",
								icon: "🔗",
							},
							{
								title: "Visual Thinking",
								description:
									"See your knowledge network grow with beautiful visualizations",
								icon: "🧠",
							},
							{
								title: "Seamless Flow",
								description:
									"Write, tag, and connect without breaking your creative process",
								icon: "⚡",
							},
						].map((feature, index) => (
							<motion.div
								key={feature.title}
								className="text-center p-6 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-xl border border-gray-200/30 dark:border-gray-700/30 hover:border-sky-300/50 dark:hover:border-sky-600/50 transition-all duration-300 group"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{
									duration: 0.6,
									delay: 2.2 + index * 0.1,
								}}
								whileHover={{ y: -4 }}
							>
								<div className="text-3xl mb-3 group-hover:scale-110 transition-transform duration-200">
									{feature.icon}
								</div>
								<h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
									{feature.title}
								</h3>
								<p className="text-gray-600 dark:text-gray-300 text-sm">
									{feature.description}
								</p>
							</motion.div>
						))}
					</motion.div>
				</div>
			</motion.section>

			{/* Features Showcase Section */}
			<motion.section
				className="mt-32 lg:mt-40"
				initial={{ opacity: 0, y: 40 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 1, delay: 2.4 }}
			>
				<div className="max-w-7xl mx-auto">
					{/* Section Header */}
					<motion.div
						className="text-center mb-16"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 2.6 }}
					>
						<h2 className="text-3xl md:text-5xl font-bold mb-6">
							<span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
								Why choose Memora?
							</span>
						</h2>
						<p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
							Experience the next generation of knowledge
							management with AI-powered insights and beautiful
							visualizations that adapt to how you think.
						</p>
					</motion.div>

					{/* Features Grid */}
					<div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
						{/* Feature 1 - AI-Powered Connections */}
						<motion.div
							className="relative"
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 2.8 }}
						>
							<div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-8 hover:border-sky-300/50 dark:hover:border-sky-600/50 transition-all duration-300 group relative overflow-hidden">
								{/* Background glow */}
								<div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								<div className="relative z-10">
									<div className="flex items-center gap-4 mb-6">
										<div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-xl flex items-center justify-center">
											<span className="text-white text-2xl">
												🧠
											</span>
										</div>
										<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
											AI-Powered Intelligence
										</h3>
									</div>
									<p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
										Our advanced AI doesn't just store your
										thoughts—it understands them. Get
										intelligent suggestions for connections,
										automatic tagging, and insights that
										help you discover patterns you never
										knew existed.
									</p>
									<div className="flex flex-wrap gap-2">
										{[
											"Smart Linking",
											"Auto-tagging",
											"Pattern Recognition",
											"Context Awareness",
										].map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 bg-sky-100/50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 text-sm rounded-full border border-sky-200/50 dark:border-sky-700/50"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>
						</motion.div>

						{/* Feature 2 - Visual Knowledge Maps */}
						<motion.div
							className="relative"
							initial={{ opacity: 0, x: 30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 3.0 }}
						>
							<div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-8 hover:border-emerald-300/50 dark:hover:border-emerald-600/50 transition-all duration-300 group relative overflow-hidden">
								{/* Background glow */}
								<div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 via-transparent to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								<div className="relative z-10">
									<div className="flex items-center gap-4 mb-6">
										<div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
											<span className="text-white text-2xl">
												🗺️
											</span>
										</div>
										<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
											Visual Knowledge Maps
										</h3>
									</div>
									<p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
										Transform abstract ideas into beautiful,
										interactive visualizations. See how your
										thoughts connect, explore knowledge
										clusters, and navigate your mental
										landscape with intuitive visual tools.
									</p>
									<div className="flex flex-wrap gap-2">
										{[
											"Interactive Graphs",
											"Cluster Views",
											"Timeline Viz",
											"Custom Layouts",
										].map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 bg-emerald-100/50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-full border border-emerald-200/50 dark:border-emerald-700/50"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>
						</motion.div>

						{/* Feature 3 - Seamless Workflow */}
						<motion.div
							className="relative"
							initial={{ opacity: 0, x: -30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 3.2 }}
						>
							<div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-8 hover:border-purple-300/50 dark:hover:border-purple-600/50 transition-all duration-300 group relative overflow-hidden">
								{/* Background glow */}
								<div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								<div className="relative z-10">
									<div className="flex items-center gap-4 mb-6">
										<div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
											<span className="text-white text-2xl">
												⚡
											</span>
										</div>
										<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
											Seamless Workflow
										</h3>
									</div>
									<p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
										Write naturally, think freely. Our
										distraction-free interface adapts to
										your workflow with real-time
										collaboration, powerful search, and
										integrations that work exactly how you
										need them to.
									</p>
									<div className="flex flex-wrap gap-2">
										{[
											"Real-time Sync",
											"Quick Capture",
											"Smart Search",
											"Team Collaboration",
										].map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 bg-purple-100/50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-sm rounded-full border border-purple-200/50 dark:border-purple-700/50"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>
						</motion.div>

						{/* Feature 4 - Secure & Private */}
						<motion.div
							className="relative"
							initial={{ opacity: 0, x: 30 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ duration: 0.8, delay: 3.4 }}
						>
							<div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-200/30 dark:border-gray-700/30 p-8 hover:border-orange-300/50 dark:hover:border-orange-600/50 transition-all duration-300 group relative overflow-hidden">
								{/* Background glow */}
								<div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-red-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

								<div className="relative z-10">
									<div className="flex items-center gap-4 mb-6">
										<div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
											<span className="text-white text-2xl">
												🔒
											</span>
										</div>
										<h3 className="text-2xl font-bold text-gray-900 dark:text-white">
											Secure & Private
										</h3>
									</div>
									<p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed mb-6">
										Your thoughts deserve protection. With
										end-to-end encryption, local storage
										options, and complete data ownership,
										your knowledge remains yours while
										staying accessible across all your
										devices.
									</p>
									<div className="flex flex-wrap gap-2">
										{[
											"End-to-End Encryption",
											"Local Storage",
											"Data Ownership",
											"Zero-Knowledge",
										].map((tag) => (
											<span
												key={tag}
												className="px-3 py-1 bg-orange-100/50 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-sm rounded-full border border-orange-200/50 dark:border-orange-700/50"
											>
												{tag}
											</span>
										))}
									</div>
								</div>
							</div>
						</motion.div>
					</div>

					{/* Call to Action */}
					<motion.div
						className="text-center mt-16"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 3.6 }}
					>
						<div className="inline-flex flex-col sm:flex-row items-center gap-4">
							<Button size="large" level="primary">
								Start building your knowledge space
							</Button>
							<Button size="large" level="tertiary">
								Explore all features
							</Button>
						</div>
						<p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
							Free to start • No credit card required • 14-day
							trial
						</p>
					</motion.div>
				</div>
			</motion.section>

			{/* add one more section please. */}
		</main>
	);
}
