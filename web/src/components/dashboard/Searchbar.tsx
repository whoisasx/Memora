import { useState, useRef } from "react";
import { motion } from "motion/react";
import Icon from "../../ui/Icon";
import { FiSend, FiSearch } from "react-icons/fi";
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
	const inputRef = useRef<HTMLInputElement | null>(null);

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
		<form
			onSubmit={(e) => handleSubmit(e)}
			className="w-full"
			aria-label="search form"
		>
			<div className="w-full rounded-xl bg-white/60 dark:bg-gray-900/60 border border-sky-100 dark:border-sky-800 shadow-sm relative">
				{/* Add content button at top-right of the search box */}
				<div className="absolute right-2 bottom-full mb-2 z-30">
					<Button
						size="medium"
						level="tertiary"
						onClick={() =>
							useDashboardStore
								.getState()
								.setCreateModelOpen(true)
						}
						ariaLabel="Add content"
					>
						<div className="flex items-center gap-2 text-sky-700 dark:text-sky-200">
							<FiPlus />
							<span className="text-xs hidden md:inline">
								Add content
							</span>
						</div>
					</Button>
				</div>
				{/* top-left toggle */}
				<div className="absolute left-2 mb-2 bottom-full z-20">
					{/* pill toggle: small knob with label outside */}
					<div
						role="switch"
						tabIndex={0}
						onClick={() => setAiMode((v) => !v)}
						onKeyDown={(e) => {
							if (e.key === "Enter" || e.key === " ") {
								e.preventDefault();
								setAiMode((v) => !v);
							}
						}}
						className={`flex items-center gap-2 select-none ${
							aiMode ? "text-sky-50" : "text-sky-700"
						}`}
						aria-checked={aiMode}
					>
						{/* track */}
						<div
							className={`relative w-12 h-6 p-1 rounded-full transition-colors duration-150 ${
								aiMode
									? "bg-teal-500"
									: "bg-sky-50 dark:bg-transparent"
							}`}
						>
							{/* small circular knob */}
							<motion.div
								className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow"
								animate={{ x: aiMode ? 24 : 0 }}
								transition={{
									type: "spring",
									stiffness: 400,
									damping: 28,
								}}
							/>
						</div>

						{/* label outside the toggle */}
						<span className="text-xs font-medium">
							{aiMode ? "AI" : "Search"}
						</span>
					</div>
				</div>

				<div className="px-3 py-2 flex flex-col md:flex-row items-center gap-3">
					<div className="flex items-center gap-2 w-full flex-1">
						<Icon
							className="text-sky-600 dark:text-sky-300"
							size={18}
							interactive={false}
						>
							<FiSearch />
						</Icon>

						<input
							ref={inputRef}
							value={query}
							onChange={(e) => setQuery(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									handleSubmit();
								}
							}}
							placeholder={
								aiMode ? "Ask the AI..." : "Search memora..."
							}
							className="flex-1 bg-transparent outline-none px-2 py-2 text-sky-900 dark:text-sky-100 placeholder-sky-500"
							aria-label={
								aiMode ? "AI search input" : "Search input"
							}
						/>
					</div>

					<div className="flex items-center gap-2 ml-auto">
						<Button
							size="small"
							level="primary"
							onClick={handleSubmit}
						>
							<div className="flex items-center gap-2">
								{loading ? (
									<motion.span
										animate={{ rotate: 360 }}
										transition={{
											repeat: Infinity,
											duration: 0.8,
											ease: "linear",
										}}
										className="inline-block"
									>
										<svg
											className="w-4 h-4 text-white"
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
												strokeDashoffset="0"
											></circle>
										</svg>
									</motion.span>
								) : (
									<Icon
										size={16}
										className="text-white"
										interactive={false}
									>
										<FiSend />
									</Icon>
								)}
								<span>
									{loading
										? "Sending"
										: aiMode
										? "Ask AI"
										: "Search"}
								</span>
							</div>
						</Button>
					</div>
				</div>
			</div>
		</form>
	);
}
