import { motion } from "motion/react";
import { PiBrainLight } from "react-icons/pi";
import Icon from "../ui/Icon";

export default function Loading() {
	return (
		<div className="min-h-screen relative text-black dark:text-white overflow-hidden flex items-center justify-center">
			{/* Background */}
			<div className="absolute inset-0 -z-10">
				{/* Base gradient background */}
				<div className="absolute inset-0 bg-gradient-to-br from-gray-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"></div>

				{/* Animated grid pattern */}
				<div className="absolute inset-0 opacity-40 dark:opacity-20">
					<svg
						width="100%"
						height="100%"
						className="absolute inset-0"
					>
						<defs>
							<pattern
								id="loading-grid"
								width="60"
								height="60"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 60 0 L 0 0 0 60"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
									className="text-slate-300/60 dark:text-slate-600"
								/>
							</pattern>
						</defs>
						<rect
							width="100%"
							height="100%"
							fill="url(#loading-grid)"
						/>
					</svg>
				</div>

				{/* Floating particles */}
				<div className="absolute inset-0 overflow-hidden">
					{[...Array(6)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-1 h-1 bg-slate-400/30 dark:bg-sky-300/20 rounded-full"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
							}}
							animate={{
								y: [-20, -80, -20],
								opacity: [0, 0.8, 0],
								scale: [0, 1, 0],
							}}
							transition={{
								duration: 8 + Math.random() * 4,
								repeat: Infinity,
								delay: Math.random() * 6,
								ease: "easeInOut",
							}}
						/>
					))}
				</div>

				{/* Animated glow spots */}
				<motion.div
					className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-radial from-slate-200/30 to-transparent dark:from-sky-400/10 rounded-full blur-xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.6, 0.3],
					}}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-radial from-slate-200/30 to-transparent dark:from-blue-400/10 rounded-full blur-xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.4, 0.7, 0.4],
					}}
					transition={{
						duration: 5,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 1,
					}}
				/>
			</div>

			{/* Loading Content */}
			<div className="relative z-10 text-center">
				{/* Logo with pulsing animation */}
				<motion.div
					className="flex flex-col items-center mb-8"
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<div className="relative mb-6">
						{/* Outer ring */}
						<motion.div
							className="absolute inset-0 w-24 h-24 rounded-full border-2 border-sky-200/30 dark:border-sky-500/20"
							animate={{ rotate: 360 }}
							transition={{
								duration: 8,
								repeat: Infinity,
								ease: "linear",
							}}
						/>

						{/* Middle ring */}
						<motion.div
							className="absolute inset-2 w-20 h-20 rounded-full border-2 border-sky-300/50 dark:border-sky-400/30"
							animate={{ rotate: -360 }}
							transition={{
								duration: 6,
								repeat: Infinity,
								ease: "linear",
							}}
						/>

						{/* Inner glow */}
						<motion.div
							className="absolute inset-4 w-16 h-16 rounded-full bg-gradient-to-r from-sky-400/20 to-blue-500/20 dark:from-sky-400/10 dark:to-blue-500/10 blur-sm"
							animate={{
								scale: [1, 1.1, 1],
								opacity: [0.5, 0.8, 0.5],
							}}
							transition={{
								duration: 2,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>

						{/* Logo icon */}
						<div className="relative w-24 h-24 flex items-center justify-center">
							<motion.div
								animate={{
									scale: [1, 1.1, 1],
									rotate: [0, 5, -5, 0],
								}}
								transition={{
									duration: 3,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							>
								<Icon
									size={48}
									className="text-sky-600 dark:text-sky-400"
								>
									<PiBrainLight />
								</Icon>
							</motion.div>
						</div>
					</div>

					{/* Brand name */}
					<motion.h1
						className="font-bold text-3xl bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent select-none"
						animate={{
							opacity: [0.7, 1, 0.7],
						}}
						transition={{
							duration: 2,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						Memora
					</motion.h1>
				</motion.div>

				{/* Loading text and progress */}
				<motion.div
					className="space-y-4"
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.8, delay: 0.3 }}
				>
					{/* Loading text */}
					<motion.p
						className="text-lg text-slate-600 dark:text-slate-400 font-medium"
						animate={{
							opacity: [0.6, 1, 0.6],
						}}
						transition={{
							duration: 1.5,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						Loading your experience...
					</motion.p>

					{/* Progress bar */}
					<div className="w-64 h-2 bg-slate-200/50 dark:bg-slate-700/50 rounded-full overflow-hidden mx-auto">
						<motion.div
							className="h-full bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500 rounded-full"
							initial={{ width: 0 }}
							animate={{ width: "100%" }}
							transition={{
								duration: 2.5,
								repeat: Infinity,
								ease: "easeInOut",
							}}
						/>
					</div>

					{/* Loading dots */}
					<div className="flex items-center justify-center space-x-2 pt-2">
						{[...Array(3)].map((_, i) => (
							<motion.div
								key={i}
								className="w-2 h-2 bg-sky-500 dark:bg-sky-400 rounded-full"
								animate={{
									scale: [1, 1.5, 1],
									opacity: [0.5, 1, 0.5],
								}}
								transition={{
									duration: 1,
									repeat: Infinity,
									delay: i * 0.2,
									ease: "easeInOut",
								}}
							/>
						))}
					</div>
				</motion.div>

				{/* Subtle status text */}
				<motion.p
					className="text-xs text-slate-500 dark:text-slate-500 mt-8 font-light"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 1, delay: 1 }}
				>
					Preparing your personalized dashboard
				</motion.p>
			</div>
		</div>
	);
}
