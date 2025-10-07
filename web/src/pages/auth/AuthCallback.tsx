// src/pages/auth/Callback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { HiCheckCircle, HiXCircle, HiRefresh } from "react-icons/hi";
import { PiBrainLight } from "react-icons/pi";
import { useUserStore } from "../../store/userStore";
import type { User } from "../../types/apiResponse";
import Icon from "../../ui/Icon";
import { Button } from "../../ui/Button";
import Loading from "../../components/Loading";

type CallbackState = "processing" | "success" | "error";

export default function Callback() {
	const navigate = useNavigate();
	const setUser = useUserStore((state) => state.setUser);
	const [state, setState] = useState<CallbackState>("processing");
	const [message, setMessage] = useState("Processing authentication...");
	const [errorDetails, setErrorDetails] = useState<string | null>(null);

	useEffect(() => {
		const processCallback = async () => {
			try {
				const params = new URLSearchParams(window.location.search);

				const token = params.get("token");
				const username = params.get("username");
				const email = params.get("email");
				const fullname = params.get("fullname");
				const error = params.get("error");

				// Show processing state briefly
				await new Promise((resolve) => setTimeout(resolve, 1000));

				if (error) {
					console.error("OAuth error:", error);
					setState("error");
					setMessage("Authentication failed");
					setErrorDetails(error);
					setTimeout(() => navigate("/signin"), 1000);
					return;
				}

				if (token && username) {
					localStorage.setItem("access-token", token);
					const user: User = {
						username: username,
						email: email ?? undefined,
						fullname: fullname ?? undefined,
						authenticated: true,
					};
					setUser(user);
					localStorage.setItem("user", JSON.stringify(user));

					setState("success");
					setMessage("Welcome to Memora!");
					await new Promise((resolve) => setTimeout(resolve, 1500));
					navigate("/dashboard");
				} else {
					console.log(
						"Missing required OAuth parameters, redirecting to signin"
					);
					setState("error");
					setMessage("Authentication incomplete");
					setErrorDetails("Missing required parameters");
					setTimeout(() => navigate("/signin"), 1000);
				}
			} catch (err) {
				console.error("Callback processing error:", err);
				setState("error");
				setMessage("Something went wrong");
				setErrorDetails("Please try signing in again");
				setTimeout(() => navigate("/signin"), 1500);
			}
		};

		processCallback();
	}, [navigate, setUser]);

	const handleRetry = () => {
		navigate("/signin");
	};

	// Use the existing Loading component for processing state
	if (state === "processing") {
		return <Loading />;
	}

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
								id="callback-grid"
								width="40"
								height="40"
								patternUnits="userSpaceOnUse"
							>
								<path
									d="M 40 0 L 0 0 0 40"
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
							fill="url(#callback-grid)"
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

				{/* Glow effects */}
				<motion.div
					className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-radial from-slate-200/20 to-transparent dark:from-sky-400/10 rounded-full blur-xl"
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
					className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-gradient-radial from-slate-200/20 to-transparent dark:from-blue-400/10 rounded-full blur-xl"
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

			{/* Main Content */}
			<div className="relative z-10 text-center max-w-md mx-auto px-6">
				<motion.div
					className="space-y-8"
					initial={{ scale: 0.9, opacity: 0 }}
					animate={{ scale: 1, opacity: 1 }}
					transition={{ duration: 0.5 }}
				>
					{/* State Icon */}
					<motion.div
						className="flex justify-center"
						initial={{ scale: 0, rotate: -180 }}
						animate={{ scale: 1, rotate: 0 }}
						transition={{ duration: 0.6, ease: "easeOut" }}
					>
						{state === "success" && (
							<motion.div
								className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
								animate={{ scale: [1, 1.1, 1] }}
								transition={{
									duration: 0.6,
									ease: "easeInOut",
								}}
							>
								<Icon
									size={40}
									className="text-green-600 dark:text-green-400"
								>
									<HiCheckCircle />
								</Icon>
							</motion.div>
						)}

						{state === "error" && (
							<motion.div
								className="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center"
								animate={{
									scale: [1, 1.1, 1],
									rotate: [0, -5, 5, 0],
								}}
								transition={{
									duration: 0.6,
									ease: "easeInOut",
								}}
							>
								<Icon
									size={40}
									className="text-red-600 dark:text-red-400"
								>
									<HiXCircle />
								</Icon>
							</motion.div>
						)}
					</motion.div>

					{/* Brand */}
					<motion.div
						className="flex items-center justify-center gap-3"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.2 }}
					>
						<div className="relative">
							<motion.div
								className="absolute inset-0 bg-sky-500/20 dark:bg-sky-400/10 rounded-full blur-lg scale-150"
								animate={{
									opacity: [0.3, 0.6, 0.3],
								}}
								transition={{
									duration: 2,
									repeat: Infinity,
									ease: "easeInOut",
								}}
							/>
							<Icon
								size={28}
								className="text-sky-600 dark:text-sky-400 relative z-10"
							>
								<PiBrainLight />
							</Icon>
						</div>
						<h1 className="font-bold text-2xl bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
							Memora
						</h1>
					</motion.div>

					{/* Status Message */}
					<motion.div
						className="space-y-3"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ duration: 0.6, delay: 0.4 }}
					>
						<motion.h2
							className={`text-xl font-semibold ${
								state === "success"
									? "text-green-700 dark:text-green-300"
									: "text-red-700 dark:text-red-300"
							}`}
							initial={{ opacity: 0, y: 10 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.4 }}
						>
							{message}
						</motion.h2>

						{errorDetails && (
							<motion.p
								className="text-sm text-slate-500 dark:text-slate-400"
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: 0.3 }}
							>
								{errorDetails}
							</motion.p>
						)}
					</motion.div>

					{/* Error Actions */}
					{state === "error" && (
						<motion.div
							className="pt-4"
							initial={{ y: 20, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.6, delay: 0.8 }}
						>
							<Button
								onClick={handleRetry}
								level="primary"
								size="medium"
								className="shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
								icon={<HiRefresh />}
								iconPosition="left"
							>
								Try Again
							</Button>
						</motion.div>
					)}

					{/* Auto redirect notice */}
					<motion.p
						className="text-xs text-slate-400 dark:text-slate-500"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 1.2 }}
					>
						{state === "success"
							? "Redirecting to your dashboard..."
							: "Redirecting to sign in..."}
					</motion.p>
				</motion.div>
			</div>
		</div>
	);
}
