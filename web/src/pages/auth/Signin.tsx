import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "motion/react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiUser, HiLockClosed } from "react-icons/hi";
import type { ApiResponseData, User } from "../../types/apiResponse";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router";
import { Button } from "../../ui/Button";
import Icon from "../../ui/Icon";

export default function Signin() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const setUser = useUserStore((state) => state.setUser);
	const navigate = useNavigate();

	useEffect(() => {
		// Don't auto-redirect if we're coming from Google OAuth callback
		const urlParams = new URLSearchParams(window.location.search);
		const isGoogleCallback =
			urlParams.has("code") ||
			urlParams.has("state") ||
			window.location.pathname.includes("callback");

		if (!isGoogleCallback) {
			const accessToken = localStorage.getItem("access-token");
			const userString = localStorage.getItem("user");
			if (accessToken && userString) {
				setUser(JSON.parse(userString));
				navigate("/dashboard");
			}
		}
	}, []);

	const handleSignIn = async (e: FormEvent) => {
		e.preventDefault();

		if ((!username && !email) || !password) {
			toast.error("Please provide username/email and password");
			return;
		}

		setIsLoading(true);
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(`${backendUrl}/api/auth/signin`, {
				username: username,
				email: email,
				password: password,
			});

			const responseData: ApiResponseData =
				response.data as ApiResponseData;
			if (response.status === 200) {
				const user: User = responseData.user as User;
				setUser(user);
				const token = responseData.access_token!;
				localStorage.setItem("access-token", token);
				localStorage.setItem("user", JSON.stringify(user));
				toast.success("Welcome back!");
				navigate("/dashboard");
			} else {
				toast.error("Error while signing in. Please try again.");
			}
		} catch (error) {
			console.error("error while signing: ", error);
			toast.error("Invalid credentials. Please try again.");
		} finally {
			setUsername("");
			setEmail("");
			setPassword("");
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = () => {
		const backendUrl = import.meta.env.VITE_BACKEND_URL;
		window.location.href = `${backendUrl}/api/auth/google/login`;
	};

	return (
		<div className="space-y-6">
			{/* Sign In Form */}
			<form onSubmit={handleSignIn} className="space-y-4">
				{/* Username Field */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.1 }}
					className="group"
				>
					<label
						htmlFor="username"
						className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-sky-600 dark:group-focus-within:text-sky-400 transition-colors duration-200"
					>
						Username{" "}
						<span className="text-slate-400 font-normal text-xs">
							(or email)
						</span>
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
							<Icon
								size={18}
								className="text-slate-400 dark:text-slate-500 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors duration-200"
							>
								<HiUser />
							</Icon>
						</div>
						<input
							type="text"
							name="username"
							id="username"
							placeholder="Enter username or email"
							className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-sky-400/50 focus:border-sky-500 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm focus:shadow-md"
							onChange={(e) => setUsername(e.target.value)}
							value={username}
							autoComplete="username"
							disabled={isLoading}
						/>
						{/* Animated border glow */}
						<div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
							<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 blur-sm"></div>
						</div>
					</div>
				</motion.div>

				{/* Password Field */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="group"
				>
					<div className="flex items-center justify-between mb-2">
						<label
							htmlFor="password"
							className="block text-sm font-semibold text-slate-700 dark:text-slate-300 group-focus-within:text-sky-600 dark:group-focus-within:text-sky-400 transition-colors duration-200"
						>
							Password
						</label>
						<button
							type="button"
							className="text-xs text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 transition-colors duration-200 hover:underline font-medium"
						>
							Forgot?
						</button>
					</div>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
							<Icon
								size={18}
								className="text-slate-400 dark:text-slate-500 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors duration-200"
							>
								<HiLockClosed />
							</Icon>
						</div>
						<input
							type={showPassword ? "text" : "password"}
							name="password"
							id="password"
							placeholder="Enter your password"
							className="block w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-sky-400/50 focus:border-sky-500 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm focus:shadow-md"
							onChange={(e) => setPassword(e.target.value)}
							value={password}
							autoComplete="current-password"
							disabled={isLoading}
						/>
						<motion.button
							type="button"
							className="absolute inset-y-0 right-0 pr-3 flex items-center z-10"
							onClick={() => setShowPassword(!showPassword)}
							disabled={isLoading}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Icon
								size={18}
								className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-colors duration-200"
							>
								{showPassword ? <FaEyeSlash /> : <FaEye />}
							</Icon>
						</motion.button>
						{/* Animated border glow */}
						<div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
							<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 blur-sm"></div>
						</div>
					</div>
				</motion.div>

				{/* Submit Button */}
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.3 }}
					className="pt-2"
				>
					<Button
						type="submit"
						level="primary"
						size="large"
						className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
						loading={isLoading}
						disabled={
							isLoading || (!username && !email) || !password
						}
					>
						{isLoading ? "Signing in..." : "Sign In"}
					</Button>
				</motion.div>
			</form>

			{/* Divider */}
			<motion.div
				className="relative"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.4 }}
			>
				<div className="absolute inset-0 flex items-center">
					<div className="w-full border-t border-slate-300/60 dark:border-slate-600/60" />
				</div>
				<div className="relative flex justify-center text-sm">
					<span className="px-3 py-1 bg-white/80 dark:bg-gray-900/80 text-slate-500 dark:text-slate-400 rounded-full backdrop-blur-sm border border-slate-200/50 dark:border-slate-700/50">
						Or continue with
					</span>
				</div>
			</motion.div>

			{/* Google Sign In */}
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.5 }}
			>
				<Button
					onClick={handleGoogleSignIn}
					level="secondary"
					size="large"
					className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
					icon={<FaGoogle />}
					iconPosition="left"
					disabled={isLoading}
				>
					Continue with Google
				</Button>
			</motion.div>
		</div>
	);
}
