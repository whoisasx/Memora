import { PiBrainLight } from "react-icons/pi";
import Icon from "../../ui/Icon";
import { Button } from "../../ui/Button";
import { FaGithub } from "react-icons/fa";
import { HiMenu, HiX } from "react-icons/hi";
import { motion, AnimatePresence } from "motion/react";
import { useState } from "react";
import { useNavigate } from "react-router";

export default function Navbar() {
	const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
	const navigate = useNavigate();
	const navItems = ["Solution", "Teams", "Resources", "About", "Contact"];

	return (
		<>
			<motion.nav
				// bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg border-b border-gray-200/20 dark:border-gray-700/20
				className="w-full flex items-center justify-between px-6 md:px-12 lg:px-20 sticky top-0 py-2 z-50"
				initial={{ y: -100, opacity: 0 }}
				animate={{ y: 0, opacity: 1 }}
				transition={{ duration: 0.6, ease: "easeOut" }}
			>
				{/* Logo Section */}
				<motion.div
					className="flex items-center gap-2 relative group"
					initial={{ x: -50, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.1 }}
				>
					<div className="relative">
						{/* Logo glow effect */}
						<div className="absolute inset-0 bg-sky-500/20 dark:bg-sky-400/20 rounded-full blur-lg scale-150 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
						<Icon
							size={32}
							className="text-sky-600 dark:text-sky-400 relative z-10 transition-colors duration-300 hover:text-sky-700 dark:hover:text-sky-300"
						>
							<PiBrainLight />
						</Icon>
					</div>
					<div className="hidden sm:block">
						<h1 className="font-bold text-2xl bg-gradient-to-r from-sky-700 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent select-none">
							Memora
						</h1>
					</div>
				</motion.div>

				{/* Desktop Navigation Menu */}
				<motion.div
					className="hidden md:block"
					initial={{ y: -20, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.2 }}
				>
					<ul className="flex items-center px-5 py-2 bg-gray-50/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-full border border-gray-200/30 dark:border-gray-700/30 shadow-sm">
						{navItems.map((item, index) => (
							<div key={item} className="flex items-center">
								<motion.li
									className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors duration-200 relative group px-2.5"
									initial={{ y: -10, opacity: 0 }}
									animate={{ y: 0, opacity: 1 }}
									transition={{
										duration: 0.3,
										delay: 0.3 + index * 0.1,
									}}
								>
									<a
										href={`#${item.toLowerCase()}`}
										className="block"
									>
										{item}
									</a>
									<div className="absolute -bottom-1 left-4 right-4 h-0.5 bg-gradient-to-r from-sky-500 to-blue-500 scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
								</motion.li>
								{index < navItems.length - 1 && (
									<div className="w-px h-4 bg-gray-300 dark:bg-gray-600 opacity-50" />
								)}
							</div>
						))}
						<div className="w-px h-4 bg-gray-300 dark:bg-gray-600 opacity-50" />
						<motion.li
							className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors duration-200 group px-2"
							initial={{ y: -10, opacity: 0 }}
							animate={{ y: 0, opacity: 1 }}
							transition={{ duration: 0.3, delay: 0.7 }}
						>
							<a
								href="https://github.com/whoisasx/Memora"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center gap-2"
							>
								<Icon className="text-gray-600 dark:text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors duration-200">
									<FaGithub />
								</Icon>
							</a>
						</motion.li>
					</ul>
				</motion.div>

				{/* Desktop Action Buttons */}
				<motion.div
					className="hidden md:flex items-center gap-3"
					initial={{ x: 50, opacity: 0 }}
					animate={{ x: 0, opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					{/* Auth Buttons - Hidden on tablet, visible on desktop */}
					<div className="hidden lg:flex items-center gap-2">
						<Button
							size="small"
							level="tertiary"
							className="transition-all duration-200"
							onClick={() => navigate("/signup")}
						>
							Sign up
						</Button>
						<Button
							size="small"
							level="secondary"
							className="transition-all duration-200"
							onClick={() => navigate("/signin")}
						>
							Log in
						</Button>
					</div>

					{/* Primary CTA */}
					<Button
						size="medium"
						level="primary"
						className="transition-all duration-200 shadow-lg hover:shadow-xl"
						onClick={() => navigate("/dashboard")}
					>
						Start building
					</Button>
				</motion.div>

				{/* Mobile Menu Toggle & CTA */}
				<div className="md:hidden flex items-center gap-3">
					<Button
						size="small"
						level="primary"
						className="transition-all duration-200"
						onClick={() => navigate("/dashboard")}
					>
						Start
					</Button>
					<button
						onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
						className="p-2 text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-200"
						aria-label="Toggle mobile menu"
					>
						<Icon size={24}>
							{isMobileMenuOpen ? <HiX /> : <HiMenu />}
						</Icon>
					</button>
				</div>
			</motion.nav>

			{/* Mobile Menu */}
			<AnimatePresence>
				{isMobileMenuOpen && (
					<motion.div
						className="md:hidden fixed inset-x-0 top-[73px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border-b border-gray-200/20 dark:border-gray-700/20 z-40"
						initial={{ opacity: 0, y: -20 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -20 }}
						transition={{ duration: 0.2 }}
					>
						<div className="px-6 py-6 space-y-6">
							{/* Mobile Navigation Items */}
							<div className="space-y-4">
								{navItems.map((item, index) => (
									<motion.div
										key={item}
										className="text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors duration-200 font-medium"
										initial={{ x: -30, opacity: 0 }}
										animate={{ x: 0, opacity: 1 }}
										transition={{ delay: index * 0.1 }}
									>
										<a
											href={`#${item.toLowerCase()}`}
											className="block py-2"
										>
											{item}
										</a>
									</motion.div>
								))}
								<div className="h-px bg-gray-200 dark:bg-gray-700 my-2" />
								<motion.div
									className=" text-gray-700 dark:text-gray-300 hover:text-sky-600 dark:hover:text-sky-400 cursor-pointer transition-colors duration-200 font-medium"
									initial={{ x: -30, opacity: 0 }}
									animate={{ x: 0, opacity: 1 }}
									transition={{ delay: 0.4 }}
								>
									<a
										href="https://github.com"
										target="_blank"
										rel="noopener noreferrer"
										className="flex items-center gap-2 py-2"
									>
										<Icon className="text-gray-600 dark:text-gray-400">
											<FaGithub />
										</Icon>
									</a>
								</motion.div>
							</div>

							{/* Mobile Auth Buttons */}
							<motion.div
								className="space-y-3 pt-4 border-t border-gray-200/30 dark:border-gray-700/30"
								initial={{ y: 20, opacity: 0 }}
								animate={{ y: 0, opacity: 1 }}
								transition={{ delay: 0.3 }}
							>
								<Button
									size="medium"
									level="tertiary"
									className="w-full"
									onClick={() => navigate("/signup")}
								>
									Sign up
								</Button>
								<Button
									size="medium"
									level="secondary"
									className="w-full"
									onClick={() => navigate("/signin")}
								>
									Log in
								</Button>
							</motion.div>
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
