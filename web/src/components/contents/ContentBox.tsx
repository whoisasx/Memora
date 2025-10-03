import ContentCard from "./ContentCard";
import Icon from "../../ui/Icon";
import { Button } from "../../ui/Button";
import { FiPlus } from "react-icons/fi";
import { FiGrid, FiList } from "react-icons/fi";

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
		<section id="content-list" tabIndex={-1} className="w-full mt-8">
			<div className="flex items-center justify-between mb-4">
				<div className="flex items-center gap-3">
					<div className="text-sm text-sky-700 dark:text-sky-200">
						Showing {items.length}{" "}
						{items.length === 1 ? "content" : "contents"}
					</div>

					{/* filter buttons */}
					<div className="flex items-center gap-2 ml-4">
						<button
							className={`px-2 py-1 text-xs rounded ${
								selectedFilter === "all"
									? "bg-sky-100 dark:bg-sky-700"
									: "bg-transparent"
							}`}
							onClick={() => setSelectedFilter("all")}
						>
							All
						</button>
						<button
							className={`px-2 py-1 text-xs rounded ${
								selectedFilter === "favorits"
									? "bg-sky-100 dark:bg-sky-700"
									: "bg-transparent"
							}`}
							onClick={() => setSelectedFilter("favorits")}
						>
							Favorites
						</button>
						<button
							className={`px-2 py-1 text-xs rounded ${
								selectedFilter === "recent"
									? "bg-sky-100 dark:bg-sky-700"
									: "bg-transparent"
							}`}
							onClick={() => setSelectedFilter("recent")}
						>
							Recent
						</button>
						<button
							className={`px-2 py-1 text-xs rounded ${
								selectedFilter === "hot"
									? "bg-sky-100 dark:bg-sky-700"
									: "bg-transparent"
							}`}
							onClick={() => setSelectedFilter("hot")}
						>
							Hot
						</button>
						<button
							className={`px-2 py-1 text-xs rounded ${
								selectedFilter === "trash"
									? "bg-sky-100 dark:bg-sky-700"
									: "bg-transparent"
							}`}
							onClick={() => setSelectedFilter("trash")}
						>
							Trash
						</button>
					</div>
				</div>

				<div className="flex items-center gap-2">
					<Icon
						interactive
						onClick={() => setViewMode("grid")}
						ariaLabel="Grid view"
					>
						<FiGrid />
					</Icon>
					<Icon
						interactive
						onClick={() => setViewMode("list")}
						ariaLabel="List view"
					>
						<FiList />
					</Icon>

					{/* Add content button in content header */}
					<div>
						<Button
							size="small"
							level="tertiary"
							onClick={() => setCreateModelOpen(true)}
							ariaLabel="Add content"
							className="ml-2"
						>
							<div className="flex items-center gap-2">
								<FiPlus />
								<span className="text-xs">Add</span>
							</div>
						</Button>
					</div>
				</div>
			</div>

			{items.length === 0 ? (
				<div className="w-full py-12 rounded-xl bg-white/60 dark:bg-gray-900/60 border border-dashed border-sky-100 dark:border-sky-800 flex flex-col items-center justify-center text-sky-500 gap-4">
					<div className="text-lg font-semibold">No contents yet</div>
					<div className="max-w-md text-center text-sm">
						You don't have any saved content. Click the button below
						to add your first URL.
					</div>
					<button
						className="mt-3 px-4 py-2 bg-sky-600 text-white rounded"
						onClick={() => setCreateModelOpen(true)}
					>
						Add content
					</button>
				</div>
			) : viewMode === "grid" ? (
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
					{items.map((c) => (
						<ContentCard key={c!.id} content={c!} />
					))}
				</div>
			) : (
				<div className="flex flex-col divide-y divide-sky-100 dark:divide-sky-800">
					{items.map((c) => (
						<div key={c!.id} className="py-3">
							<ContentCard content={c!} view="list" />
						</div>
					))}
				</div>
			)}
		</section>
	);
}
