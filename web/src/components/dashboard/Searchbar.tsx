import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import Icon from "../../ui/Icon";
import { FiSend, FiSearch, FiZap, FiStar, FiPlay } from "react-icons/fi";
import { Button } from "../../ui/Button";
import { useDashboardStore } from "../../store/dashboardStore";
import { FiPlus } from "react-icons/fi";

export default function Searchbar({
	onSearch,
}: {
	onSearch?: (query: string, aiMode: boolean) => Promise<any>;
}) {
	const [query, setQuery] = useState("");
	const [aiMode, setAiMode] = useState(false);
	const [loading, setLoading] = useState(false);
	const [isFocused, setIsFocused] = useState(false);
	const [isHovered, setIsHovered] = useState(false);
	const inputRef = useRef<HTMLInputElement | null>(null);

	// Auto-focus on mount for better UX
	useEffect(() => {
		const timer = setTimeout(() => {
			inputRef.current?.focus();
		}, 500);
		return () => clearTimeout(timer);
	}, []);

	const handleSubmit = async (e?: React.FormEvent | React.MouseEvent) => {
		e?.preventDefault?.();
		if (!query.trim()) return;
		setLoading(true);
		try {
			if (onSearch) await onSearch(query, aiMode);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="max-w-7xl w-full relative">
			{/* Hero Section with Floating Elements */}
			<div className="relative mb-8">
				{/* Background Particles */}
				<div className="absolute inset-0 overflow-hidden pointer-events-none">
					{[...Array(6)].map((_, i) => (
						<motion.div
							key={i}
							className="absolute w-2 h-2 bg-gradient-to-r from-sky-400/30 to-blue-500/30 rounded-full"
							animate={{
								x: [0, 100, -50, 0],
								y: [0, -100, 50, 0],
								opacity: [0.3, 0.8, 0.3],
								scale: [1, 1.5, 1],
							}}
							transition={{
								duration: 8 + i * 2,
								repeat: Infinity,
								ease: "easeInOut",
							}}
							style={{
								left: `${20 + i * 15}%`,
								top: `${10 + i * 5}%`,
							}}
						/>
					))}
				</div>

				{/* Main Hero Content */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
					className="text-center mb-18 relative z-10"
				>
					<motion.div
						className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-sky-100/80 to-blue-100/80 dark:from-sky-900/50 dark:to-blue-900/50 border border-sky-200/50 dark:border-sky-700/50 mb-6"
						animate={{ scale: [1, 1.02, 1] }}
						transition={{ duration: 3, repeat: Infinity }}
					>
						<Icon
							size={16}
							className="text-sky-600 dark:text-sky-400"
						>
							<FiPlay />
						</Icon>
						<span className="text-sm font-medium text-sky-700 dark:text-sky-300">
							Powered by Advanced AI
						</span>
					</motion.div>

					<h1 className="text-4xl md:text-6xl font-bold mb-4">
						<span className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 dark:from-sky-300 dark:via-blue-300 dark:to-indigo-300 bg-clip-text text-transparent">
							Your Digital
						</span>
						<br />
						<span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-300 dark:via-purple-300 dark:to-pink-300 bg-clip-text text-transparent">
							Memory Palace
						</span>
					</h1>

					<p className="text-lg md:text-xl text-sky-600 dark:text-sky-400 max-w-2xl mx-auto leading-relaxed">
						Search through your memories with AI, discover hidden
						connections, and unlock insights you never knew existed.
					</p>
				</motion.div>
			</div>

			{/* Enhanced Search Form */}
			<form
				onSubmit={(e) => handleSubmit(e)}
				className="w-full max-w-4xl mx-auto"
				aria-label="AI-powered search form"
			>
				<motion.div
					className={`relative rounded-2xl transition-all duration-500 ${
						isFocused || isHovered
							? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl shadow-2xl border-2 border-sky-300/50 dark:border-sky-600/50"
							: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-lg shadow-xl border border-sky-200/50 dark:border-sky-700/50"
					}`}
					onMouseEnter={() => setIsHovered(true)}
					onMouseLeave={() => setIsHovered(false)}
					whileHover={{ scale: 1.01 }}
					transition={{ duration: 0.3 }}
				>
					{/* Animated Border Glow */}
					<motion.div
						className="absolute inset-0 rounded-2xl bg-gradient-to-r from-sky-400/20 via-blue-400/20 to-indigo-400/20 dark:from-sky-500/30 dark:via-blue-500/30 dark:to-indigo-500/30 blur-xl"
						animate={{
							opacity: isFocused ? 0.8 : 0.3,
							scale: isFocused ? 1.02 : 1,
						}}
						transition={{ duration: 0.3 }}
					/>

					{/* AI Mode Toggle - Floating */}
					<motion.div
						className="absolute -top-10 left-6 z-30"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						<motion.div
							role="switch"
							tabIndex={0}
							onClick={() => setAiMode((v) => !v)}
							onKeyDown={(e) => {
								if (e.key === "Enter" || e.key === " ") {
									e.preventDefault();
									setAiMode((v) => !v);
								}
							}}
							className="flex items-center gap-3 select-none cursor-pointer group"
							aria-checked={aiMode}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							{/* Enhanced Toggle Track */}
							<div
								className={`relative w-16 h-8 p-1 rounded-full transition-all duration-300 ${
									aiMode
										? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 shadow-lg"
										: "bg-sky-100 dark:bg-sky-800/50 border border-sky-200 dark:border-sky-700"
								}`}
							>
								{/* Animated Knob */}
								<motion.div
									className={`absolute top-1 w-6 h-6 rounded-full shadow-lg flex items-center justify-center ${
										aiMode
											? "bg-white text-purple-600"
											: "bg-sky-500 text-white"
									}`}
									animate={{ x: aiMode ? 32 : 4 }}
									transition={{
										type: "spring",
										stiffness: 500,
										damping: 30,
									}}
								>
									<Icon size={12} className="text-current">
										{aiMode ? <FiZap /> : <FiSearch />}
									</Icon>
								</motion.div>

								{/* Sparkle Effects for AI Mode */}
								<AnimatePresence>
									{aiMode && (
										<motion.div
											className="absolute inset-0 pointer-events-none"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
											exit={{ opacity: 0 }}
										>
											{[...Array(3)].map((_, i) => (
												<motion.div
													key={i}
													className="absolute w-1 h-1 bg-white rounded-full"
													animate={{
														x: [5, 60, 5],
														y: [10, 5, 15],
														opacity: [0, 1, 0],
													}}
													transition={{
														duration: 2,
														repeat: Infinity,
														delay: i * 0.5,
													}}
												/>
											))}
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Enhanced Label */}
							<div className="flex items-center gap-2">
								<span
									className={`text-sm font-semibold transition-colors ${
										aiMode
											? "bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent"
											: "text-sky-700 dark:text-sky-300"
									}`}
								>
									{aiMode ? "AI Mode" : "Search Mode"}
								</span>
								{aiMode && (
									<motion.div
										initial={{ scale: 0 }}
										animate={{ scale: 1 }}
										className="flex items-center gap-1"
									>
										<Icon
											size={14}
											className="text-purple-500"
										>
											<FiStar />
										</Icon>
									</motion.div>
								)}
							</div>
						</motion.div>
					</motion.div>

					{/* Add Content Button - Enhanced */}
					<motion.div
						className="absolute -top-12 right-6 z-30"
						initial={{ y: 20, opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						transition={{ delay: 0.3 }}
					>
						<Button
							size="medium"
							level="tertiary"
							onClick={() =>
								useDashboardStore
									.getState()
									.setCreateModelOpen(true)
							}
							ariaLabel="Add content"
							className="shadow-lg hover:shadow-xl backdrop-blur-sm border border-sky-200/50 dark:border-sky-700/50"
						>
							<motion.div
								className="flex items-center gap-2 text-sky-700 dark:text-sky-200"
								whileHover={{ scale: 1.05 }}
							>
								<Icon size={16} className="text-current">
									<FiPlus />
								</Icon>
								<span className="text-sm font-medium hidden sm:inline">
									Add Content
								</span>
							</motion.div>
						</Button>
					</motion.div>

					{/* Main Input Area */}
					<div className="p-6 md:p-8">
						<div className="flex flex-col lg:flex-row items-center gap-4 lg:gap-6">
							{/* Search Icon with Animation */}
							<motion.div
								className="flex-shrink-0"
								animate={
									isFocused
										? { scale: 1.1, rotate: [0, 5, -5, 0] }
										: { scale: 1 }
								}
								transition={{ duration: 0.3 }}
							>
								<div
									className={`p-3 rounded-xl transition-all duration-300 ${
										aiMode
											? "bg-gradient-to-r from-indigo-100 to-purple-100 dark:from-indigo-900/50 dark:to-purple-900/50"
											: "bg-sky-100 dark:bg-sky-800/50"
									}`}
								>
									<Icon
										className={`transition-colors duration-300 ${
											aiMode
												? "text-purple-600 dark:text-purple-400"
												: "text-sky-600 dark:text-sky-300"
										}`}
										size={24}
										interactive={false}
									>
										{aiMode ? <FiZap /> : <FiSearch />}
									</Icon>
								</div>
							</motion.div>

							{/* Enhanced Input Field */}
							<div className="flex-1 w-full relative">
								<input
									ref={inputRef}
									value={query}
									onChange={(e) => setQuery(e.target.value)}
									onFocus={() => setIsFocused(true)}
									onBlur={() => setIsFocused(false)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											handleSubmit();
										}
									}}
									placeholder={
										aiMode
											? "Ask me anything about your memories..."
											: "Search through your digital memory palace..."
									}
									className="w-full bg-transparent outline-none px-4 py-4 text-lg md:text-xl text-sky-900 dark:text-sky-100 placeholder-sky-500 dark:placeholder-sky-400 font-medium"
									aria-label={
										aiMode
											? "AI search input"
											: "Search input"
									}
								/>

								{/* Typing Indicator */}
								<AnimatePresence>
									{query && (
										<motion.div
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											exit={{ opacity: 0, scale: 0.8 }}
											className="absolute right-2 top-1/2 transform -translate-y-1/2"
										>
											<div className="flex gap-1">
												{[...Array(3)].map((_, i) => (
													<motion.div
														key={i}
														className={`w-2 h-2 rounded-full ${
															aiMode
																? "bg-purple-400"
																: "bg-sky-400"
														}`}
														animate={{
															scale: [1, 1.2, 1],
															opacity: [
																0.5, 1, 0.5,
															],
														}}
														transition={{
															duration: 1,
															repeat: Infinity,
															delay: i * 0.2,
														}}
													/>
												))}
											</div>
										</motion.div>
									)}
								</AnimatePresence>
							</div>

							{/* Enhanced Action Button */}
							<motion.div
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Button
									size="large"
									level="primary"
									onClick={handleSubmit}
									className={`shadow-xl hover:shadow-2xl transition-all duration-300 ${
										aiMode
											? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
											: ""
									}`}
									disabled={loading || !query.trim()}
								>
									<div className="flex items-center gap-3">
										{loading ? (
											<motion.div
												animate={{ rotate: 360 }}
												transition={{
													repeat: Infinity,
													duration: 1,
													ease: "linear",
												}}
											>
												<svg
													className="w-5 h-5 text-white"
													viewBox="0 0 24 24"
													fill="none"
												>
													<circle
														cx="12"
														cy="12"
														r="10"
														stroke="currentColor"
														strokeWidth="2"
														strokeDasharray="31.4"
														strokeDashoffset="10"
													/>
												</svg>
											</motion.div>
										) : (
											<Icon
												size={18}
												className="text-white"
												interactive={false}
											>
												{aiMode ? (
													<FiZap />
												) : (
													<FiSend />
												)}
											</Icon>
										)}
										<span className="font-semibold text-lg">
											{loading
												? "Processing..."
												: aiMode
												? "Ask AI"
												: "Search"}
										</span>
										{aiMode && !loading && (
											<Icon
												size={16}
												className="text-white"
											>
												<FiPlay />
											</Icon>
										)}
									</div>
								</Button>
							</motion.div>
						</div>

						{/* Suggestions */}
						<AnimatePresence>
							{!query && (
								<motion.div
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -10 }}
									transition={{ delay: 0.5 }}
									className="mt-6 flex flex-wrap gap-2 justify-center"
								>
									{(aiMode
										? [
												"What did I learn about React last week?",
												"Show me my JavaScript notes",
												"Find insights about productivity",
										  ]
										: [
												"JavaScript",
												"Design patterns",
												"Meeting notes",
												"Project ideas",
										  ]
									).map((suggestion, i) => (
										<motion.button
											key={suggestion}
											onClick={() => setQuery(suggestion)}
											className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
												aiMode
													? "bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/30 dark:to-purple-900/30 text-purple-700 dark:text-purple-300 hover:from-indigo-100 hover:to-purple-100 dark:hover:from-indigo-800/50 dark:hover:to-purple-800/50"
													: "bg-sky-50 dark:bg-sky-800/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100 dark:hover:bg-sky-700/50"
											} border border-sky-200/50 dark:border-sky-700/50 hover:shadow-md`}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{
												delay: 0.7 + i * 0.1,
											}}
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
										>
											{suggestion}
										</motion.button>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				</motion.div>
			</form>
		</div>
	);
}
