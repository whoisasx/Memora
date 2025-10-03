import { PiGraphDuotone } from "react-icons/pi";
import { PiBrainLight } from "react-icons/pi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { FiUser } from "react-icons/fi";
import { useNavigate } from "react-router";
import { Button } from "../../ui/Button";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { FiSun, FiMoon } from "react-icons/fi";
import { useThemeStore } from "../../store/themeStore";
import { useDashboardStore } from "../../store/dashboardStore";
import Icon from "../../ui/Icon";
import Notifications from "./Notifications";

export default function Navbar() {
	const navigate = useNavigate();

	const [userClicked, setUserClicked] = useState(false);
	const [notifClicked, setNotifClicked] = useState(false);

	const notifications = useDashboardStore((s) => s.notifications);
	const unreadCount = notifications.filter((n) => !n.read).length;
	const user = JSON.parse(localStorage.getItem("user")!);

	const handlelogout = () => {
		localStorage.removeItem("user");
		localStorage.removeItem("access-token");
		navigate("/signin");
	};

	return (
		<section className="h-15 w-full mx-auto text-sky-900 dark:text-sky-100 sticky top-0 z-50">
			<motion.div
				className="w-full h-full relative flex items-center justify-between px-4  overflow-visible"
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.4 }}
			>
				{/* Background gradient with teal / sky tones, adapts to dark mode */}
				<div className="absolute inset-0 -z-10 bg-gradient-to-br from-teal-400/20 via-sky-400/10 to-sky-900/10 dark:from-teal-700/30 dark:via-sky-700/10 dark:to-sky-950/40 pointer-events-none" />

				<div className="flex items-center gap-3">
					<Icon size={28} className="text-sky-700 dark:text-sky-200">
						<PiBrainLight />
					</Icon>
					<div className="hidden sm:block font-bold text-lg text-sky-800 dark:text-sky-100">
						Memora
					</div>
				</div>

				<div className="flex items-center gap-6">
					<Button
						size="medium"
						level="primary"
						onClick={() => navigate("/nodes")}
					>
						<div className="flex gap-2 items-center font-semibold">
							<span>Let's Node</span>
							<Icon size={18} className="text-white">
								<PiGraphDuotone />
							</Icon>
						</div>
					</Button>

					{/* theme icon button */}
					<ThemeButton />

					<motion.div
						className="gap-4 flex items-center"
						initial={{ y: 0 }}
						animate={{ y: [0, -3, 0] }}
						transition={{
							duration: 4,
							repeat: Infinity,
							ease: "easeInOut",
						}}
					>
						<div className="relative">
							<Icon
								ariaLabel="notifications"
								interactive
								onClick={() => setNotifClicked((prev) => !prev)}
								className="text-sky-800 dark:text-sky-200"
							>
								<IoMdNotificationsOutline />
							</Icon>
							{unreadCount > 0 && (
								<span className="absolute -top-1 -right-1 bg-rose-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
									{unreadCount > 9 ? "9+" : unreadCount}
								</span>
							)}
						</div>

						<Icon
							ariaLabel="profile"
							interactive
							onClick={() => setUserClicked((prev) => !prev)}
							className="text-sky-800 dark:text-sky-200"
						>
							<FiUser />
						</Icon>
					</motion.div>
				</div>

				{userClicked && (
					<AnimatePresence>
						<motion.div
							className="absolute px-3 py-2 top-full mt-2 right-2 z-30 bg-white dark:bg-gray-800 border border-sky-100 dark:border-sky-800 rounded-lg shadow-lg min-w-[180px]"
							initial={{ opacity: 0, y: -8, scale: 0.98 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -6, scale: 0.98 }}
							transition={{ duration: 0.18, ease: "easeOut" }}
							role="menu"
						>
							<div className="flex flex-col gap-2 text-sky-800 dark:text-sky-100">
								<p className="px-2 py-1 font-semibold truncate">
									{user?.username}
								</p>
								<hr className="border-sky-100 dark:border-sky-800" />
								<button
									onClick={handlelogout}
									className="px-2 py-2 text-left rounded-md text-sm text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-800"
									role="menuitem"
								>
									Log out
								</button>
							</div>
						</motion.div>
					</AnimatePresence>
				)}
			</motion.div>

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
			className={`group relative inline-flex items-center justify-center w-10 h-10 rounded-full p-0.5 cursor-pointer transition-all duration-300 ${className}`}
			whileTap={{ scale: 0.94 }}
		>
			{/* glowing ring */}
			<motion.div
				className={`absolute inset-0 rounded-xl pointer-events-none bg-gradient-to-r ${
					theme === "dark"
						? "from-teal-500/20 to-sky-700/10"
						: "from-sky-200/80 to-blue-200/50"
				}`}
				animate={{ scale: [1, 1.06, 1], opacity: [0.35, 0.7, 0.35] }}
				transition={{
					duration: 2,
					repeat: Infinity,
					ease: "easeInOut",
				}}
			/>

			{/* shimmer */}
			<div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
				<div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-0 transition-transform duration-700 ease-out" />
			</div>

			{/* icon (animates on theme change) */}
			<motion.div
				key={theme}
				initial={{ rotate: -160, opacity: 0, scale: 0.6 }}
				animate={{ rotate: 0, opacity: 1, scale: 1 }}
				transition={{ duration: 0.35, type: "spring", stiffness: 200 }}
				className="relative z-10 text-sky-800 dark:text-sky-200"
			>
				{theme === "dark" ? (
					<FiMoon className="w-5 h-5 text-yellow-400" />
				) : (
					<FiSun className="w-5 h-5 text-sky-600" />
				)}
			</motion.div>

			{/* tiny tooltip */}
			<motion.div
				className="absolute -bottom-9 left-1/2 transform -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 pointer-events-none"
				initial={{ opacity: 0, y: -6 }}
				whileHover={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.18 }}
			>
				Switch to {theme === "dark" ? "light" : "dark"} mode
				<div className="absolute -top-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-900 rotate-45" />
			</motion.div>
		</motion.button>
	);
}
