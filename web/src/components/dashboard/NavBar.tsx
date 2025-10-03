import { PiGraphDuotone } from "react-icons/pi";
import { PiBrainLight } from "react-icons/pi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router";
import { Button } from "../../ui/Button";
import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect, useRef } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useThemeStore } from "../../store/themeStore";
import { useDashboardStore } from "../../store/dashboardStore";
import Icon from "../../ui/Icon";
import Notifications from "./Notifications";

export default function Navbar() {
	const navigate = useNavigate();

	const [userClicked, setUserClicked] = useState(false);
	const [notifClicked, setNotifClicked] = useState(false);
	const [isScrolled, setIsScrolled] = useState(false);

	const userMenuRef = useRef<HTMLDivElement>(null);
	const notifRef = useRef<HTMLDivElement>(null);

	const notifications = useDashboardStore((s) => s.notifications);
	const unreadCount = notifications.filter((n) => !n.read).length;
	const user = JSON.parse(localStorage.getItem("user")!);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				userMenuRef.current &&
				!userMenuRef.current.contains(event.target as Node)
			) {
				setUserClicked(false);
			}
			if (
				notifRef.current &&
				!notifRef.current.contains(event.target as Node)
			) {
				setNotifClicked(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () =>
			document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	// Handle scroll effect
	useEffect(() => {
		const handleScroll = () => setIsScrolled(window.scrollY > 20);
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	const handlelogout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("access-token");
		navigate("/signin");
	};

	return (
		<section className="h-16 w-full sticky top-0 z-50">
			<motion.nav
				className={`w-full h-full relative flex items-center justify-between px-4 sm:px-6 lg:px-8 transition-all duration-300 ${
					isScrolled
						? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg border-b border-sky-200/20 dark:border-sky-800/20"
						: "bg-gradient-to-r from-white/80 via-sky-50/50 to-white/80 dark:from-gray-900/80 dark:via-gray-800/50 dark:to-gray-900/80 backdrop-blur-sm"
				}`}
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, ease: "easeOut" }}
			>
				{/* Animated background pattern */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					<div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-sky-400/10 to-teal-400/10 dark:from-sky-600/20 dark:to-teal-600/20 rounded-full blur-2xl animate-pulse" />
					<div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-bl from-blue-400/10 to-indigo-400/10 dark:from-blue-600/20 dark:to-indigo-600/20 rounded-full blur-2xl animate-pulse delay-1000" />
				</div>

				{/* Logo and Brand */}
				<motion.div
					className="flex items-center gap-3 relative z-10"
					whileHover={{ scale: 1.02 }}
					transition={{ duration: 0.2 }}
				>
					<div className="relative">
						<Icon
							size={32}
							className="text-sky-600 dark:text-sky-300 relative z-10"
						>
							<PiBrainLight />
						</Icon>
						{/* Glow effect */}
						<div className="absolute inset-0 bg-sky-400/20 dark:bg-sky-400/30 rounded-full blur-md animate-pulse" />
					</div>
					<div className="hidden sm:block">
						<h1 className="font-bold text-xl bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
							Memora
						</h1>
					</div>
				</motion.div>

				{/* Center Actions (Hidden on small screens) */}
				<div className="hidden md:flex items-center gap-4">
					<Button
						size="medium"
						level="primary"
						onClick={() => navigate("/nodes")}
						className="group shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
					>
						<div className="flex gap-2 items-center font-semibold">
							<span className="text-sm lg:text-base">
								Let's Node
							</span>
							<Icon
								size={18}
								className="text-white group-hover:rotate-12 transition-transform duration-200"
							>
								<PiGraphDuotone />
							</Icon>
						</div>
					</Button>
				</div>

				{/* Right Actions */}
				<div className="flex items-center gap-2 sm:gap-4 relative z-10">
					{/* Mobile Node Button */}
					<div className="md:hidden">
						<motion.button
							onClick={() => navigate("/nodes")}
							className="p-2 rounded-lg bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
							whileTap={{ scale: 0.95 }}
						>
							<Icon size={20} className="text-white">
								<PiGraphDuotone />
							</Icon>
						</motion.button>
					</div>

					{/* Theme Toggle */}
					<ThemeButton />

					{/* Notifications */}
					<div className="relative" ref={notifRef}>
						<motion.div
							className="relative"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Icon
								ariaLabel="notifications"
								interactive
								onClick={() => setNotifClicked((prev) => !prev)}
								className={`text-sky-700 dark:text-sky-300 p-2 rounded-lg transition-all duration-200 ${
									notifClicked
										? "bg-sky-100 dark:bg-sky-800/50"
										: "hover:bg-sky-50 dark:hover:bg-sky-800/30"
								}`}
								size={24}
							>
								<IoMdNotificationsOutline />
							</Icon>
							{unreadCount > 0 && (
								<motion.span
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									className="absolute -top-1 -right-1 bg-gradient-to-r from-rose-500 to-pink-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg"
								>
									{unreadCount > 9 ? "9+" : unreadCount}
								</motion.span>
							)}
						</motion.div>
					</div>

					{/* User Profile */}
					<div className="relative" ref={userMenuRef}>
						<motion.div
							className="relative"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<Icon
								ariaLabel="profile"
								interactive
								onClick={() => setUserClicked((prev) => !prev)}
								className={`text-sky-700 dark:text-sky-300 p-2 rounded-lg transition-all duration-200 ${
									userClicked
										? "bg-sky-100 dark:bg-sky-800/50"
										: "hover:bg-sky-50 dark:hover:bg-sky-800/30"
								}`}
								size={24}
							>
								<FiUser />
							</Icon>
							{/* Online indicator */}
							<div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 border-2 border-white dark:border-gray-900 rounded-full animate-pulse" />
						</motion.div>

						{/* User Dropdown */}
						<AnimatePresence>
							{userClicked && (
								<motion.div
									className="absolute top-full mt-3 right-0 z-50 bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg border border-sky-200/50 dark:border-sky-700/50 rounded-xl shadow-2xl min-w-[200px] overflow-hidden"
									initial={{
										opacity: 0,
										y: -10,
										scale: 0.95,
									}}
									animate={{ opacity: 1, y: 0, scale: 1 }}
									exit={{ opacity: 0, y: -5, scale: 0.95 }}
									transition={{
										duration: 0.2,
										ease: "easeOut",
									}}
									role="menu"
								>
									{/* User Info */}
									<div className="px-4 py-3 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/50">
										<p className="font-semibold text-sky-800 dark:text-sky-200 truncate">
											{user?.username}
										</p>
										<p className="text-xs text-sky-600 dark:text-sky-400 mt-0.5">
											Online
										</p>
									</div>

									{/* Menu Items */}
									<div className="py-2">
										<motion.button
											onClick={handlelogout}
											className="w-full px-4 py-3 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/20 transition-colors duration-150 font-medium"
											role="menuitem"
											whileHover={{ x: 4 }}
											transition={{ duration: 0.15 }}
										>
											Sign Out
										</motion.button>
									</div>
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</div>
			</motion.nav>

			{/* Notifications Panel */}
			{notifClicked && <Notifications />}
		</section>
	);
}

export function ThemeButton({ className }: { className?: string }) {
	const { theme, setTheme } = useThemeStore();
	const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

	return (
		<motion.button
			onClick={toggle}
			aria-pressed={theme === "dark"}
			aria-label="Toggle theme"
			className={`group relative inline-flex items-center justify-center w-10 h-10 rounded-xl p-2 cursor-pointer transition-all duration-300 hover:bg-sky-100 dark:hover:bg-sky-800/50 ${className}`}
			whileTap={{ scale: 0.92 }}
			whileHover={{ scale: 1.05 }}
		>
			{/* Animated background ring */}
			<motion.div
				className={`absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r ${
					theme === "dark"
						? "from-blue-500/20 via-indigo-500/10 to-purple-500/20"
						: "from-yellow-400/20 via-orange-400/10 to-red-400/20"
				}`}
				animate={{
					scale: [1, 1.1, 1],
					opacity: [0.3, 0.6, 0.3],
				}}
				transition={{
					duration: 2.5,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* Shimmer effect */}
			<div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 dark:via-sky-400/20 to-transparent"
					initial={{ x: "-100%" }}
					whileHover={{ x: "100%" }}
					transition={{ duration: 0.6, ease: "easeOut" }}
				/>
			</div>

			{/* Icon with smooth transition */}
			<motion.div
				key={theme}
				initial={{ rotate: -180, scale: 0.5, opacity: 0 }}
				animate={{ rotate: 0, scale: 1, opacity: 1 }}
				exit={{ rotate: 180, scale: 0.5, opacity: 0 }}
				transition={{
					duration: 0.4,
					type: "spring",
					stiffness: 200,
					damping: 15,
				}}
				className="relative z-10"
			>
				{theme === "dark" ? (
					<FiMoon className="w-5 h-5 text-blue-400 filter drop-shadow-sm" />
				) : (
					<FiSun className="w-5 h-5 text-orange-500 filter drop-shadow-sm" />
				)}
			</motion.div>

			{/* Enhanced tooltip */}
			<motion.div
				className="absolute -bottom-10 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 text-xs rounded-lg opacity-0 pointer-events-none font-medium whitespace-nowrap shadow-lg"
				initial={{ opacity: 0, y: -5 }}
				whileHover={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.2 }}
			>
				Switch to {theme === "dark" ? "light" : "dark"} mode
				<div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 dark:bg-gray-100 rotate-45" />
			</motion.div>
		</motion.button>
	);
}
