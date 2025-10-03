import { useMemo, useState } from "react";
import type { Content } from "../../types/apiResponse";
import Icon from "../../ui/Icon";
import { Button } from "../../ui/Button";
import {
	FiMoreVertical,
	FiHeart,
	FiStar,
	FiTrash2,
	FiPlus,
	FiCopy,
} from "react-icons/fi";
import { motion } from "motion/react";
import { useDashboardStore } from "../../store/dashboardStore";
import toast from "react-hot-toast";
import axios from "axios";
import { useNodeStore } from "../../store/nodeStore";

interface ContentCardProps {
	content: Content;
	// optional override of view mode, otherwise read from store
	view?: "grid" | "list";
}

const COLORS = [
	"from-sky-400 to-blue-600",
	"from-emerald-400 to-teal-600",
	"from-rose-300 to-pink-500",
	"from-yellow-300 to-amber-500",
	"from-indigo-400 to-violet-600",
];

function timeAgo(ts: number) {
	// console.log(ts);
	const s = Math.floor((Date.now() - ts) / 1000);
	if (s < 60) return `${s}s`;
	const m = Math.floor(s / 60);
	if (m < 60) return `${m}m`;
	const h = Math.floor(m / 60);
	if (h < 24) return `${h}h`;
	const d = Math.floor(h / 24);
	return `${d}d`;
}

export default function ContentCard({ content, view }: ContentCardProps) {
	const storeView = useDashboardStore((s) => s.viewMode);
	// const addChild = useDashboardStore((s) => s.addChild);
	const deleteContent = useDashboardStore((s) => s.deleteContent);
	const updateContent = useDashboardStore((s) => s.updateContent);
	const addNotification = useDashboardStore((s) => s.addNotification);

	const { addLink, deleteLinks, deleteNode } = useNodeStore();

	const mode = view ?? storeView;

	const [menuOpen, setMenuOpen] = useState(false);
	const [hoverThumb, setHoverThumb] = useState(false);
	const [isFav, setIsFav] = useState(
		() => content.tags?.includes("favorite") ?? false
	);
	const [isHot, setIsHot] = useState(
		() => content.tags?.includes("hot") ?? false
	);

	const chosenGradient = useMemo(() => {
		// pick gradient by color string if provided otherwise first
		if (content.color) return content.color;
		return COLORS[parseInt(content.id.slice(-1), 36) % COLORS.length];
	}, [content]);

	const handleAddChild = async () => {
		const id = window.prompt("Add child id:");
		if (!id) return;
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(
				`${backendUrl}/contents/connect-to/${content.id}`,
				id,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"access-token"
						)}`,
					},
				}
			);
			if (response.status === 200) {
				toast.success("Added.");
				const newChildren = [...content["all-children"], id];
				updateContent(content.id, { "all-children": newChildren });
				addLink({
					source: content.id,
					target: id,
					destination: id,
					value: Math.floor(Math.random() * 10) + 1,
				});
				addNotification({
					title: "Child added",
					message: `${id} added`,
					type: "success",
					read: false,
				});
			} else {
				toast.error("Request failed.");
			}
		} catch (error) {
			console.log(error);
			toast.error("Request failed.");
		}
	};

	const handleCopyId = async () => {
		try {
			await navigator.clipboard.writeText(content.id);
			addNotification({
				title: "Copied ID",
				message: content.id,
				type: "info",
				read: false,
			});
			toast.success("ID copied");
		} catch (err) {
			console.error("Failed to copy id", err);
			toast.error("Failed to copy ID");
		}
	};

	const handleDelete = async () => {
		if (!window.confirm("Delete this content?")) return;
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.delete(
				`${backendUrl}/contents/${content.id}`,
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"access-token"
						)}`,
					},
				}
			);
			if (response.status === 200) {
				deleteContent(content.id);
				deleteNode(content.id);
				deleteLinks(content.id);
				addNotification({
					title: "Deleted",
					message: `Deleted content`,
					type: "info",
					read: false,
				});
				toast.success("Content deleted");
			} else {
				toast.error("Error while deleting.");
			}
		} catch (error) {
			console.log(error);
			toast.error("Error while deleting.");
		} finally {
		}
	};

	const toggleFav = () => {
		setIsFav((v) => {
			const newV = !v;
			const tags = newV
				? Array.from(new Set([...(content.tags || []), "favorite"]))
				: (content.tags || []).filter((t) => t !== "favorite");
			updateContent(content.id, { tags });
			addNotification({
				title: newV ? "Added to favorites" : "Removed from favorites",
				message: content.url,
				type: "success",
				read: false,
			});
			return newV;
		});
	};

	const toggleHot = () => {
		setIsHot((v) => {
			const newV = !v;
			const tags = newV
				? Array.from(new Set([...(content.tags || []), "hot"]))
				: (content.tags || []).filter((t) => t !== "hot");
			updateContent(content.id, { tags });
			addNotification({
				title: newV ? "Marked hot" : "Unmarked hot",
				message: content.url,
				type: "info",
				read: false,
			});
			return newV;
		});
	};

	const changeColor = (grad: string) => {
		updateContent(content.id, { color: grad });
		addNotification({
			title: "Color updated",
			message: "Thumbnail color changed",
			type: "success",
			read: false,
		});
	};

	return (
		<div
			className={`group relative bg-white/60 dark:bg-gray-900/60 border border-sky-100 dark:border-sky-800 rounded-xl overflow-hidden shadow-sm transition-transform duration-150 ${
				mode === "grid"
					? "flex flex-col"
					: "flex items-center gap-4 p-3"
			}`}
		>
			{/* left / top media */}
			<div
				className={`${
					mode === "grid" ? "h-40 w-full" : "w-32 h-20 flex-shrink-0"
				} relative bg-gray-100 dark:bg-gray-800`}
				onMouseEnter={() => setHoverThumb(true)}
				onMouseLeave={() => setHoverThumb(false)}
				onFocus={() => setHoverThumb(true)}
				onBlur={() => setHoverThumb(false)}
				tabIndex={0}
			>
				{content.url_data?.thumbnail ? (
					<img
						src={content.url_data.thumbnail}
						alt={content.url_data.site_name}
						className="w-full h-full object-cover"
					/>
				) : (
					<div
						className={`w-full h-full bg-gradient-to-br ${
							content.color ?? chosenGradient
						} flex items-center justify-center`}
					>
						<div className="text-white text-sm font-semibold px-3 truncate">
							{content.url_data?.site_name ??
								new URL(content.url).hostname}
						</div>
					</div>
				)}
				<div className="absolute top-2 right-2 flex items-center gap-2">
					<Icon
						onClick={toggleFav}
						ariaLabel={isFav ? "Remove favorite" : "Add favorite"}
					>
						<FiHeart />
					</Icon>
					<Icon
						onClick={toggleHot}
						ariaLabel={isHot ? "Unmark hot" : "Mark hot"}
					>
						<FiStar />
					</Icon>
					<div className="relative">
						<Icon
							onClick={() => setMenuOpen((v) => !v)}
							ariaLabel="More"
						>
							<FiMoreVertical />
						</Icon>
						{menuOpen && (
							<motion.div
								initial={{ opacity: 0, y: -6 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.12 }}
								className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-900 border border-sky-100 dark:border-sky-800 rounded-md shadow-lg z-30"
							>
								<button
									onClick={() => {
										setMenuOpen(false);
										handleAddChild();
									}}
									className="w-full text-left px-3 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 flex items-center gap-2"
								>
									<FiPlus /> <span>Add child</span>
								</button>
								<button
									onClick={() => {
										setMenuOpen(false);
										handleDelete();
									}}
									className="w-full text-left px-3 py-2 hover:bg-rose-50 dark:hover:bg-gray-800 text-rose-600 flex items-center gap-2"
								>
									<FiTrash2 /> <span>Delete</span>
								</button>
							</motion.div>
						)}
					</div>
				</div>

				{/* tooltip for copying id shown on hover over thumbnail */}
				{hoverThumb && (
					<motion.div
						initial={{ opacity: 0, y: 6 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.12 }}
						className="absolute left-2 bottom-2 z-40"
					>
						<button
							onClick={handleCopyId}
							aria-label="Copy content id"
							className="flex items-center gap-2 px-2 py-1 bg-white/90 dark:bg-gray-900/90 border border-sky-100 dark:border-sky-800 rounded-md shadow-sm text-xs"
						>
							<span className="truncate max-w-[10rem]">
								{content.id}
							</span>
							<FiCopy />
						</button>
					</motion.div>
				)}
			</div>

			{/* content body */}
			<div
				className={`flex-1 p-3 ${
					mode === "grid"
						? "flex flex-col gap-3"
						: "flex items-center justify-between w-full"
				}`}
			>
				<div className="flex-1">
					<div className="flex items-start gap-3">
						<div className="flex-1">
							<div className="flex items-center justify-between gap-2">
								<h3 className="text-sm font-semibold text-sky-900 dark:text-sky-100 truncate">
									{content.url_data?.site_name ??
										new URL(content.url).hostname}
								</h3>
								<div className="text-xs text-sky-500 dark:text-sky-300">
									{timeAgo(content.timestamp)}
								</div>
							</div>
							{content.description && (
								<p className="mt-1 text-xs text-sky-700 dark:text-sky-300 line-clamp-2">
									{content.description}
								</p>
							)}
							<div className="mt-2 flex flex-wrap gap-2">
								{(content.tags || []).slice(0, 5).map((t) => (
									<span
										key={t}
										className="text-xs bg-sky-50 dark:bg-gray-800 px-2 py-0.5 rounded-md text-sky-700 dark:text-sky-200"
									>
										{t}
									</span>
								))}
							</div>
						</div>
					</div>

					{/* color swatches */}
					<div className="mt-3 flex items-center gap-2">
						{COLORS.map((c) => (
							<button
								key={c}
								onClick={() => changeColor(c)}
								aria-label={`Choose color ${c}`}
								className={`w-7 h-7 rounded-md border border-white/30 shadow-sm transition-transform transform hover:scale-105 bg-gradient-to-br ${c}`}
							/>
						))}
					</div>
				</div>

				{/* actions (for list view show on right) */}
				<div
					className={`mt-3 ${
						mode === "grid" ? "" : "ml-4 flex items-center gap-2"
					}`}
				>
					<Button
						size="small"
						level="secondary"
						onClick={() => {
							navigator.clipboard?.writeText(content.url);
							addNotification({
								title: "Copied",
								message: content.url,
								type: "info",
								read: false,
							});
						}}
					>
						Copy
					</Button>
					<Button
						size="small"
						level="primary"
						onClick={() => {
							window.open(content.url, "_blank");
						}}
					>
						Open
					</Button>
				</div>
			</div>
		</div>
	);
}
