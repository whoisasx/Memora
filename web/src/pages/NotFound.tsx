import { motion } from "motion/react";
import { HiHome, HiArrowLeft, HiSearchCircle } from "react-icons/hi";
import { PiBrainLight, PiCompassDuotone } from "react-icons/pi";
import { useNavigate } from "react-router-dom";
import Icon from "../ui/Icon";
import { Button } from "../ui/Button";

export default function NotFound() {
	const navigate = useNavigate();

	return (
		<div className="min-h-screen relative text-black dark:text-white overflow-hidden flex items-center justify-center">
			{/* Background */}
			<div className="absolute inset-0 -z-10">
				{/* Base gradient background */}
				<div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"></div>

				{/* Animated grid pattern */}
				<div className="absolute inset-0 opacity-30 dark:opacity-15">
					<svg
						width="100%"
						height="100%"
						className="absolute inset-0"
					>
						<defs>
							<pattern
								id="notfound-grid"
								width="50"
								height="50"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 50 0 L 0 0 0 50"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
									className="text-slate-300/50 dark:text-slate-600/50"
								/>
							</pattern>
						</defs>
						<rect
							width="100%"
							height="100%"
							fill="url(#notfound-grid)"
						/>
					</svg>
				</div>

				{/* Floating elements */}
				<div className="absolute inset-0 overflow-hidden">
					{[...Array(8)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-1 h-1 bg-slate-400/30 dark:bg-slate-500/20 rounded-full"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
							}}
							animate={{
								y: [-30, -120, -30],
								opacity: [0, 0.7, 0],
								scale: [0, 1.2, 0],
							}}
							transition={{
								duration: 12 + Math.random() * 4,
								repeat: Infinity,
								delay: Math.random() * 8,
								ease: "easeInOut",
							}}
						/>
					))}
				</div>

				{/* Decorative shapes */}
				<div className="absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute top-1/4 left-1/6 w-4 h-4 border-2 border-slate-300/40 dark:border-slate-600/30 rotate-45"
						animate={{
							rotate: [45, 405, 45],
							scale: [1, 0.8, 1],
						}}
						transition={{
							duration: 20,
							repeat: Infinity,
							ease: "linear",
						}}
					/>
					<motion.div
						className="absolute top-2/3 right-1/5 w-6 h-6 bg-slate-300/20 dark:bg-slate-600/15 rounded-full"
						animate={{
							scale: [1, 1.4, 1],
							opacity: [0.3, 0.6, 0.3],
						}}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
					<motion.div
						className="absolute top-1/2 right-1/3 w-2 h-10 bg-gradient-to-b from-slate-300/25 to-transparent dark:from-slate-600/20 rounded-full"
						animate={{
							scaleY: [1, 1.3, 1],
							opacity: [0.4, 0.7, 0.4],
						}}
						transition={{
							duration: 6,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 1,
						}}
					/>
				</div>

				{/* Ambient glow effects */}
				<motion.div
					className="absolute top-1/4 left-1/4 w-40 h-40 bg-gradient-radial from-slate-200/20 to-transparent dark:from-slate-400/5 rounded-full blur-2xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.5, 0.3],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute bottom-1/3 right-1/4 w-48 h-48 bg-gradient-radial from-slate-200/15 to-transparent dark:from-slate-400/3 rounded-full blur-2xl"
					animate={{
						scale: [1.1, 1, 1.1],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 2,
					}}
				/>
			</div>

			{/* Main Content */}
			<div className="relative z-10 text-center max-w-2xl mx-auto px-6">
				{/* 404 Animation */}
				<motion.div
					className="mb-8"
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<div className="relative">
						{/* Large 404 text */}
						<motion.h1
							className="text-8xl md:text-9xl font-black bg-gradient-to-r from-slate-300 via-slate-400 to-slate-300 dark:from-slate-600 dark:via-slate-500 dark:to-slate-600 bg-clip-text text-transparent select-none"
							animate={{
								opacity: [0.7, 1, 0.7],
							}}
							transition={{
								duration: 3,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						>
							404
						</motion.h1>

						{/* Floating compass icon */}
						<motion.div
							className="absolute top-4 right-4 md:top-8 md:right-8"
							animate={{
								rotate: [0, 360],
								scale: [1, 1.1, 1],
							}}
							transition={{
								duration: 10,
								repeat: Infinity,
								ease: "linear",
							}}
						>
							<Icon
								size={32}
								className="text-slate-400/60 dark:text-slate-500/40"
							>
								<PiCompassDuotone />
							</Icon>
						</motion.div>

						{/* Search icon */}
						<motion.div
							className="absolute bottom-4 left-4 md:bottom-8 md:left-8"
							animate={{
								y: [-5, 5, -5],
								opacity: [0.5, 0.8, 0.5],
							}}
							transition={{
								duration: 4,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						>
							<Icon
								size={28}
								className="text-slate-400/60 dark:text-slate-500/40"
							>
								<HiSearchCircle />
							</Icon>
						</motion.div>
					</div>
				</motion.div>

				{/* Content */}
				<motion.div
					className="space-y-6"
					initial={{ y: 30, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.3 }}
				>
					{/* Title */}
					<div className="space-y-2">
						<h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-slate-700 via-slate-600 to-slate-700 dark:from-slate-300 dark:via-slate-200 dark:to-slate-300 bg-clip-text text-transparent">
							Oops! Page Not Found
						</h2>
						<p className="text-lg text-slate-600 dark:text-slate-400">
							The page you're looking for seems to have wandered
							off into the digital void.
						</p>
					</div>

					{/* Logo and brand */}
					<motion.div
						className="flex items-center justify-center gap-3 py-4"
						animate={{
							scale: [1, 1.02, 1],
						}}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						<div className="relative">
							<motion.div
								className="absolute inset-0 bg-sky-500/20 dark:bg-sky-400/10 rounded-full blur-lg scale-150"
								animate={{
									opacity: [0.3, 0.6, 0.3],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>
							<Icon
								size={32}
								className="text-sky-600 dark:text-sky-400 relative z-10"
							>
								<PiBrainLight />
							</Icon>
						</div>
						<span className="font-bold text-2xl bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
							Memora
						</span>
					</motion.div>

					{/* Description */}
					<p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
						Don't worry, even the best explorers sometimes take a
						wrong turn. Let's get you back on track to discover your
						memories.
					</p>
				</motion.div>

				{/* Action buttons */}
				<motion.div
					className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8"
					initial={{ y: 30, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.6 }}
				>
					<Button
						onClick={() => navigate("/")}
						level="primary"
						size="large"
						className="w-full sm:w-auto min-w-[160px] shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
						icon={<HiHome />}
						iconPosition="left"
					>
						Go Home
					</Button>

					<Button
						onClick={() => navigate(-1)}
						level="secondary"
						size="large"
						className="w-full sm:w-auto min-w-[160px] shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
						icon={<HiArrowLeft />}
						iconPosition="left"
					>
						Go Back
					</Button>
				</motion.div>

				{/* Help text */}
				<motion.div
					className="pt-8 text-center"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 1 }}
				>
					<p className="text-xs text-slate-400 dark:text-slate-500">
						If you believe this is an error, please contact our
						support team
					</p>
				</motion.div>
			</div>
		</div>
	);
}
