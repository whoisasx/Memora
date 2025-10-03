import ContentCard from "./ContentCard";
import { Button } from "../../ui/Button";
import { FiPlus } from "react-icons/fi";
import { FiGrid, FiList } from "react-icons/fi";
import { motion } from "framer-motion";

import { useDashboardStore } from "../../store/dashboardStore";

export default function ContentBox() {
	const contents = useDashboardStore((s) => s.contents);
	const viewMode = useDashboardStore((s) => s.viewMode);
	const setViewMode = useDashboardStore((s) => s.setViewMode);
	const selectedFilter = useDashboardStore((s) => s.selectedFilter);
	const setSelectedFilter = useDashboardStore((s) => s.setSelectedFilter);
	const setCreateModelOpen = useDashboardStore((s) => s.setCreateModelOpen);

	// Always show the full contents here (search results are handled by SearchSection)
	let items = [...contents];

	// apply simple filters driven by the dashboard store
	if (selectedFilter === "favorits") {
		items = items.filter((c) => (c.tags || []).includes("favorite"));
	} else if (selectedFilter === "hot") {
		items = items.filter((c) => (c.tags || []).includes("hot"));
	} else if (selectedFilter === "trash") {
		items = items.filter((c) => (c.tags || []).includes("trash"));
	} else if (selectedFilter === "recent") {
		// recent: sort by timestamp desc
		items = items.sort((a, b) => b.timestamp - a.timestamp);
	}

	return (
		<section
			id="content-list"
			tabIndex={-1}
			className="w-full mt-6 sm:mt-8"
		>
			{/* Enhanced Top Bar */}
			<div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 p-4 sm:p-5 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-sky-200/50 dark:border-sky-700/50 shadow-lg hover:shadow-xl transition-all duration-300">
				<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
					<div className="text-sm sm:text-base font-medium text-sky-900 dark:text-sky-100 bg-gradient-to-r from-sky-800 to-blue-700 dark:from-sky-200 dark:to-blue-300 bg-clip-text">
						Showing {items.length}{" "}
						{items.length === 1 ? "content" : "contents"}
					</div>

					{/* Enhanced filter buttons */}
					<div className="flex items-center gap-1 sm:gap-2 flex-wrap">
						{(
							[
								{ key: "all", label: "All" },
								{ key: "favorits", label: "Favorites" },
								{ key: "recent", label: "Recent" },
								{ key: "hot", label: "Hot" },
								{ key: "trash", label: "Trash" },
							] as {
								key:
									| "all"
									| "favorits"
									| "recent"
									| "trash"
									| "hot";
								label: string;
							}[]
						).map((filter, index) => (
							<motion.button
								key={filter.key}
								className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-full transition-all duration-200 ${
									selectedFilter === filter.key
										? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-md"
										: "bg-sky-50/80 dark:bg-sky-900/50 text-sky-700 dark:text-sky-300 hover:bg-sky-100/80 dark:hover:bg-sky-800/50 border border-sky-200/50 dark:border-sky-700/50"
								}`}
								onClick={() => setSelectedFilter(filter.key)}
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								initial={{ opacity: 0, x: -10 }}
								animate={{ opacity: 1, x: 0 }}
								transition={{ delay: index * 0.1 }}
							>
								{filter.label}
							</motion.button>
						))}
					</div>
				</div>

				<div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
					{/* View toggle buttons */}
					<div className="flex items-center gap-1 p-1 bg-sky-50/80 dark:bg-sky-900/50 rounded-xl border border-sky-200/50 dark:border-sky-700/50">
						<motion.button
							onClick={() => setViewMode("grid")}
							className={`p-2 rounded-lg transition-all duration-200 ${
								viewMode === "grid"
									? "bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-md"
									: "text-sky-500 dark:text-sky-500 hover:text-sky-600 dark:hover:text-sky-400"
							}`}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							aria-label="Grid view"
						>
							<FiGrid className="w-4 h-4" />
						</motion.button>
						<motion.button
							onClick={() => setViewMode("list")}
							className={`p-2 rounded-lg transition-all duration-200 ${
								viewMode === "list"
									? "bg-white dark:bg-gray-800 text-sky-600 dark:text-sky-400 shadow-md"
									: "text-sky-500 dark:text-sky-500 hover:text-sky-600 dark:hover:text-sky-400"
							}`}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							aria-label="List view"
						>
							<FiList className="w-4 h-4" />
						</motion.button>
					</div>

					{/* Add content button */}
					<motion.div
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<Button
							size="small"
							level="primary"
							onClick={() => setCreateModelOpen(true)}
							ariaLabel="Add content"
							className="shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transform hover:-translate-y-0.5"
						>
							<div className="flex items-center gap-2">
								<FiPlus className="w-4 h-4" />
								<span className="text-xs sm:text-sm font-medium">
									Add
								</span>
							</div>
						</Button>
					</motion.div>
				</div>
			</div>

			{/* Content Display */}
			{items.length === 0 ? (
				<motion.div
					className="w-full py-16 sm:py-20 rounded-2xl bg-gradient-to-br from-sky-50/80 to-blue-50/80 dark:from-sky-900/40 dark:to-blue-900/40 border-2 border-dashed border-sky-200/60 dark:border-sky-700/60 flex flex-col items-center justify-center text-center shadow-inner"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5 }}
				>
					<motion.div
						className="w-16 h-16 sm:w-20 sm:h-20 mb-6 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg"
						initial={{ scale: 0 }}
						animate={{ scale: 1 }}
						transition={{ delay: 0.2, type: "spring" }}
					>
						<FiPlus className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
					</motion.div>
					<motion.div
						className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100 mb-3"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.3 }}
					>
						No contents yet
					</motion.div>
					<motion.div
						className="max-w-md text-sm sm:text-base text-sky-700 dark:text-sky-300 mb-6 px-4"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.4 }}
					>
						You don't have any saved content. Click the button below
						to add your first URL and start building your
						collection.
					</motion.div>
					<motion.button
						className="px-6 py-3 bg-gradient-to-r from-sky-500 to-blue-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
						onClick={() => setCreateModelOpen(true)}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.5 }}
					>
						✨ Add Your First Content
					</motion.button>
				</motion.div>
			) : viewMode === "grid" ? (
				<motion.div
					className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				>
					{items.map((c, index) => (
						<motion.div
							key={c!.id}
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: index * 0.1, duration: 0.3 }}
						>
							<ContentCard content={c!} />
						</motion.div>
					))}
				</motion.div>
			) : (
				<motion.div
					className="flex flex-col gap-3 sm:gap-4"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.3 }}
				>
					{items.map((c, index) => (
						<motion.div
							key={c!.id}
							className="overflow-hidden bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-sky-200/50 dark:border-sky-700/50 shadow-md hover:shadow-lg transition-all duration-300"
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.1, duration: 0.3 }}
							whileHover={{ scale: 1.01 }}
						>
							<ContentCard content={c!} />
						</motion.div>
					))}
				</motion.div>
			)}
		</section>
	);
}
