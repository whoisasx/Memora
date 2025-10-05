import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { motion } from "motion/react";
import { FaGoogle, FaEye, FaEyeSlash } from "react-icons/fa";
import { HiUser, HiMail, HiLockClosed } from "react-icons/hi";
import type { ApiResponseData, User } from "../../types/apiResponse";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router";
import { Button } from "../../ui/Button";
import Icon from "../../ui/Icon";

export default function Signup() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullname, setFullname] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [isLoading, setIsLoading] = useState(false);

	const setUser = useUserStore((state) => state.setUser);
	const navigate = useNavigate();

	const handleSignUp = async (e: FormEvent) => {
		e.preventDefault();

		if (!username || !password) {
			toast.error("Username and password are required");
			return;
		}

		setIsLoading(true);
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(`${backendUrl}/auth/signup`, {
				username: username,
				email: email.length > 0 ? email : undefined,
				password: password,
				fullname: fullname.length > 0 ? fullname : undefined,
			});

			const responseData: ApiResponseData =
				response.data as ApiResponseData;
			if (response.status === 201) {
				const user: User = responseData.user as User;
				setUser(user);
				const token = responseData.access_token!;
				localStorage.setItem("access-token", token);
				localStorage.setItem("user", JSON.stringify(user));
				toast.success("Welcome to Memora!");
				navigate("/dashboard");
			} else if (response.status === 400) {
				toast.error("User already registered. Please sign in.");
			} else {
				console.log("message:", responseData.message);
				toast.error("Error while signing up. Please try again.");
			}
		} catch (error: any) {
			console.error("error while signing up: ", error);
			if (error.response?.status === 400) {
				toast.error("User already exists. Please sign in instead.");
			} else {
				toast.error("Please try again.");
			}
		} finally {
			setUsername("");
			setPassword("");
			setEmail("");
			setFullname("");
			setIsLoading(false);
		}
	};

	const handleGoogleSignIn = () => {
		const backendUrl = import.meta.env.VITE_BACKEND_URL;
		window.location.href = `${backendUrl}/auth/google/login`;
	};

	return (
		<div className="space-y-6">
			{/* Sign Up Form */}
			<form onSubmit={handleSignUp} className="space-y-4">
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
						<span className="text-red-500 font-medium">*</span>
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
							placeholder="Choose a username"
							className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-sky-400/50 focus:border-sky-500 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm focus:shadow-md"
							onChange={(e) => setUsername(e.target.value)}
							value={username}
							autoComplete="username"
							disabled={isLoading}
							required
						/>
						{/* Animated border glow */}
						<div className="absolute inset-0 rounded-xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 pointer-events-none">
							<div className="absolute inset-0 rounded-xl bg-gradient-to-r from-sky-500/20 to-blue-500/20 blur-sm"></div>
						</div>
					</div>
				</motion.div>

				{/* Email Field (Optional) */}
				<motion.div
					initial={{ x: -20, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="group"
				>
					<label
						htmlFor="email"
						className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-sky-600 dark:group-focus-within:text-sky-400 transition-colors duration-200"
					>
						Email{" "}
						<span className="text-slate-400 font-normal text-xs">
							(optional)
						</span>
					</label>
					<div className="relative">
						<div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
							<Icon
								size={18}
								className="text-slate-400 dark:text-slate-500 group-focus-within:text-sky-500 dark:group-focus-within:text-sky-400 transition-colors duration-200"
							>
								<HiMail />
							</Icon>
						</div>
						<input
							type="email"
							name="email"
							id="email"
							placeholder="Enter your email"
							className="block w-full pl-10 pr-3 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-sky-400/50 focus:border-sky-500 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm focus:shadow-md"
							onChange={(e) => setEmail(e.target.value)}
							value={email}
							autoComplete="email"
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
					transition={{ duration: 0.5, delay: 0.3 }}
					className="group"
				>
					<label
						htmlFor="password"
						className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2 group-focus-within:text-sky-600 dark:group-focus-within:text-sky-400 transition-colors duration-200"
					>
						Password{" "}
						<span className="text-red-500 font-medium">*</span>
					</label>
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
							placeholder="Create a strong password"
							className="block w-full pl-10 pr-12 py-3 border border-slate-300 dark:border-slate-600 rounded-xl bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/50 dark:focus:ring-sky-400/50 focus:border-sky-500 dark:focus:border-sky-400 focus:bg-white dark:focus:bg-gray-800 transition-all duration-300 hover:border-slate-400 dark:hover:border-slate-500 shadow-sm focus:shadow-md"
							onChange={(e) => setPassword(e.target.value)}
							value={password}
							autoComplete="new-password"
							disabled={isLoading}
							required
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
					{/* Compact password strength indicator */}
					{password && (
						<motion.div
							initial={{ opacity: 0, height: 0 }}
							animate={{ opacity: 1, height: "auto" }}
							className="mt-1"
						>
							<div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
								<div
									className={`w-2 h-2 rounded-full ${
										password.length >= 8
											? "bg-green-500"
											: password.length >= 6
											? "bg-yellow-500"
											: "bg-red-500"
									}`}
								/>
								<span className="font-medium">
									{password.length >= 8
										? "Strong"
										: password.length >= 6
										? "Medium"
										: "Weak"}
								</span>
							</div>
						</motion.div>
					)}
				</motion.div>

				{/* Submit Button */}
				<motion.div
					initial={{ y: 20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="pt-2"
				>
					<Button
						type="submit"
						level="primary"
						size="large"
						className="w-full h-12 text-base font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
						loading={isLoading}
						disabled={isLoading || !username || !password}
					>
						{isLoading ? "Creating Account..." : "Create Account"}
					</Button>
				</motion.div>
			</form>

			{/* Divider */}
			<motion.div
				className="relative"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.5 }}
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

			{/* Google Sign Up */}
			<motion.div
				initial={{ y: 20, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.6 }}
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

			{/* Compact Terms and Privacy */}
			<motion.div
				className="text-center"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.7 }}
			>
				<p className="text-xs text-slate-500 dark:text-slate-400">
					By signing up, you agree to our{" "}
					<a
						href="#"
						className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
					>
						Terms
					</a>{" "}
					and{" "}
					<a
						href="#"
						className="text-sky-600 dark:text-sky-400 hover:underline font-medium"
					>
						Privacy Policy
					</a>
				</p>
			</motion.div>
		</div>
	);
}
