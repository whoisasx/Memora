import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { motion } from "motion/react";
import { PiBrainLight } from "react-icons/pi";
import { HiSun, HiMoon, HiArrowLeft } from "react-icons/hi";
import Icon from "../../ui/Icon";
import { useThemeStore } from "../../store/themeStore";
import { useEffect } from "react";

export default function AuthPage() {
	const { theme, setTheme } = useThemeStore();
	const location = useLocation();
	const navigate = useNavigate();
	const isSignup = location.pathname.includes("signup");

	useEffect(() => {
		// Check if user is already authenticated
		const accessToken = localStorage.getItem("access-token");
		const userString = localStorage.getItem("user");
		if (accessToken && userString) {
			navigate("/dashboard");
		}
	}, [navigate]);

	return (
		<div className="min-h-screen relative text-black dark:text-white overflow-hidden">
			{/* Background */}
			<div className="absolute inset-0 -z-10">
				{/* Base gradient background */}
				<div className="absolute inset-0 bg-gradient-to-br from-sky-100 via-slate-100 to-blue-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"></div>

				{/* Animated grid pattern */}
				<div className="absolute inset-0 opacity-30 dark:opacity-20">
					<svg
						width="100%"
						height="100%"
						className="absolute inset-0"
					>
						<defs>
							<pattern
								id="auth-grid"
								width="60"
								height="60"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 60 0 L 0 0 0 60"
									fill="none"
									stroke="currentColor"
									strokeWidth="0.5"
									strokeDasharray="2,4"
									className="text-sky-400 dark:text-sky-600"
								/>
							</pattern>
						</defs>
						<rect
							width="100%"
							height="100%"
							fill="url(#auth-grid)"
						/>
					</svg>
				</div>

				{/* Elegant floating particles */}
				<div className="absolute inset-0 overflow-hidden">
					{[...Array(12)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-2 h-2 bg-sky-400/30 dark:bg-sky-300/20 rounded-full"
							style={{
								left: `${Math.random() * 100}%`,
								top: `${Math.random() * 100}%`,
							}}
							animate={{
								y: [-20, -100, -20],
								opacity: [0, 1, 0],
								scale: [0, 1, 0],
							}}
							transition={{
								duration: 8 + Math.random() * 4,
								repeat: Infinity,
								delay: Math.random() * 8,
								ease: "easeInOut",
							}}
						/>
					))}
				</div>

				{/* Animated geometric shapes */}
				<div className="absolute inset-0 overflow-hidden">
					<motion.div
						className="absolute top-1/4 left-1/4 w-6 h-6 border border-sky-300/20 dark:border-sky-500/10 rotate-45"
						animate={{
							rotate: [45, 225, 45],
							scale: [1, 0.8, 1],
						}}
						transition={{
							duration: 12,
							repeat: Infinity,
							ease: "linear",
						}}
					/>
					<motion.div
						className="absolute top-3/4 right-1/4 w-4 h-4 bg-blue-400/10 dark:bg-blue-300/5 rounded-full"
						animate={{
							scale: [1, 1.5, 1],
							opacity: [0.5, 0.8, 0.5],
						}}
						transition={{
							duration: 6,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					/>
					<motion.div
						className="absolute top-1/2 right-1/3 w-3 h-8 bg-gradient-to-b from-indigo-300/10 to-transparent dark:from-indigo-400/5 rounded-full"
						animate={{
							scaleY: [1, 1.3, 1],
							opacity: [0.3, 0.6, 0.3],
						}}
						transition={{
							duration: 8,
							repeat: Infinity,
							ease: "easeInOut",
							delay: 2,
						}}
					/>
				</div>

				{/* Animated glow spots */}
				<motion.div
					className="absolute top-20 left-10 w-32 h-32 bg-gradient-radial from-sky-300/10 to-transparent dark:from-sky-400/5 rounded-full blur-xl"
					animate={{
						scale: [1, 1.2, 1],
						opacity: [0.3, 0.6, 0.3],
					}}
					transition={{
						duration: 6,
						repeat: Infinity,
						ease: "easeInOut",
					}}
				/>
				<motion.div
					className="absolute bottom-32 right-16 w-40 h-40 bg-gradient-radial from-blue-300/10 to-transparent dark:from-blue-400/5 rounded-full blur-xl"
					animate={{
						scale: [1.2, 1, 1.2],
						opacity: [0.4, 0.7, 0.4],
					}}
					transition={{
						duration: 8,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 2,
					}}
				/>
				<motion.div
					className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-gradient-radial from-indigo-300/5 to-transparent dark:from-indigo-400/3 rounded-full blur-2xl"
					animate={{
						scale: [1, 1.1, 1],
						opacity: [0.2, 0.4, 0.2],
					}}
					transition={{
						duration: 10,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 4,
					}}
				/>
			</div>

			{/* Header */}
			<motion.header
				className="relative z-10 flex items-center justify-between p-6 md:p-8"
				initial={{ y: -50, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				{/* Back button and Logo */}
				<div className="flex items-center gap-4">
					<motion.button
						onClick={() => navigate("/")}
						className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full p-2 shadow-lg hover:shadow-xl transition-all duration-200 group"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Icon className="text-sky-600 dark:text-sky-400 group-hover:text-sky-700 dark:group-hover:text-sky-300 transition-colors">
							<HiArrowLeft />
						</Icon>
					</motion.button>

					<div className="flex items-center gap-3">
						<div className="relative group">
							<div className="absolute inset-0 bg-sky-500/20 dark:bg-sky-400/20 rounded-full blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							<Icon
								size={32}
								className="text-sky-600 dark:text-sky-400 relative z-10 transition-colors duration-300"
							>
								<PiBrainLight />
							</Icon>
						</div>
						<h1 className="font-bold text-2xl bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent select-none">
							Memora
						</h1>
					</div>
				</div>

				{/* Theme Toggle */}
				<motion.button
					onClick={() =>
						setTheme(theme === "light" ? "dark" : "light")
					}
					className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 group"
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
				>
					<motion.div
						animate={{ rotate: theme === "light" ? 0 : 180 }}
						transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
					>
						{theme === "light" ? (
							<Icon className="text-orange-500 group-hover:text-orange-600 transition-colors duration-200">
								<HiSun />
							</Icon>
						) : (
							<Icon className="text-blue-400 group-hover:text-blue-500 transition-colors duration-200">
								<HiMoon />
							</Icon>
						)}
					</motion.div>
				</motion.button>
			</motion.header>

			{/* Main Content */}
			<div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-6">
				<motion.div
					className="w-full max-w-md"
					initial={{ y: 50, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
				>
					{/* Auth Card */}
					<div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-xl border border-white/20 dark:border-gray-700/20 rounded-2xl shadow-2xl p-8">
						{/* Auth Header */}
						<motion.div
							className="text-center mb-8"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.4 }}
						>
							<h2 className="text-3xl font-bold bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent mb-2">
								{isSignup ? "Create Account" : "Welcome Back"}
							</h2>
							<p className="text-slate-600 dark:text-slate-400">
								{isSignup
									? "Start your journey with Memora today"
									: "Sign in to continue to your account"}
							</p>
						</motion.div>

						{/* Form Container */}
						<motion.div
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.6 }}
						>
							<Outlet />
						</motion.div>

						{/* Switch between Sign in/Sign up */}
						<motion.div
							className="text-center mt-6 pt-6 border-t border-slate-200/50 dark:border-slate-700/50"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.8 }}
						>
							<p className="text-slate-600 dark:text-slate-400">
								{isSignup
									? "Already have an account?"
									: "Don't have an account?"}{" "}
								<button
									onClick={() =>
										navigate(
											isSignup ? "/signin" : "/signup"
										)
									}
									className="text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 font-medium transition-colors duration-200 hover:underline"
								>
									{isSignup ? "Sign in" : "Sign up"}
								</button>
							</p>
						</motion.div>
					</div>
				</motion.div>
			</div>
		</div>
	);
}
