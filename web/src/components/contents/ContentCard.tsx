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
import { createPortal } from "react-dom";

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
	// Handle invalid timestamps
	if (!ts || isNaN(ts) || ts <= 0) return "just now";

	// Convert timestamp to milliseconds if it's in seconds
	const timestamp = ts < 1e12 ? ts * 1000 : ts;
	const now = Date.now();
	const diff = Math.floor((now - timestamp) / 1000);

	// Handle invalid calculations
	if (isNaN(diff) || diff < 0) return "just now";
	if (diff < 60) return `${diff}s ago`;

	const minutes = Math.floor(diff / 60);
	if (isNaN(minutes) || minutes < 60) return `${minutes}m ago`;

	const hours = Math.floor(minutes / 60);
	if (isNaN(hours) || hours < 24) return `${hours}h ago`;

	const days = Math.floor(hours / 24);
	if (isNaN(days) || days < 7) return `${days}d ago`;

	const weeks = Math.floor(days / 7);
	if (isNaN(weeks) || weeks < 4) return `${weeks}w ago`;

	const months = Math.floor(days / 30);
	if (isNaN(months) || months < 12) return `${months}mo ago`;

	const years = Math.floor(days / 365);
	if (isNaN(years)) return "just now";
	return `${years}y ago`;
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
	const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
	const [showAddChildModal, setShowAddChildModal] = useState(false);
	const [childId, setChildId] = useState("");
	const [isFav, setIsFav] = useState(
		() => content.tags?.includes("favorite") ?? false
	);
	const [isHot, setIsHot] = useState(
		() => content.tags?.includes("hot") ?? false
	);
	const [menuPosition, setMenuPosition] = useState({ x: 0, y: 0 });

	const chosenGradient = useMemo(() => {
		// pick gradient by color string if provided otherwise first
		if (content.color) return content.color;
		return COLORS[parseInt(content.id.slice(-1), 36) % COLORS.length];
	}, [content]);

	const handleAddChild = async () => {
		if (!childId.trim()) {
			toast.error("Please enter a valid child ID");
			return;
		}

		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(
				`${backendUrl}/api/contents/connect-to/${content.id}`,
				childId.trim(),
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"access-token"
						)}`,
					},
				}
			);
			if (response.status === 200) {
				toast.success("Child added successfully!");
				const newChildren = [
					...content["all-children"],
					childId.trim(),
				];
				updateContent(content.id, { "all-children": newChildren });
				addLink({
					source: content.id,
					target: childId.trim(),
					destination: childId.trim(),
					value: Math.floor(Math.random() * 10) + 1,
				});
				addNotification({
					title: "Child added",
					message: `${childId.trim()} added`,
					type: "success",
					read: false,
				});
				setShowAddChildModal(false);
				setChildId("");
			} else {
				toast.error("Failed to add child");
			}
		} catch (error) {
			console.log(error);
			toast.error("Failed to add child");
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
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.delete(
				`${backendUrl}/api/contents/${content.id}`,
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
					title: "Content deleted",
					message: `Content deleted successfully`,
					type: "info",
					read: false,
				});
				toast.success("Content deleted successfully");
				setShowDeleteConfirm(false);
			} else {
				toast.error("Failed to delete content");
			}
		} catch (error) {
			console.log(error);
			toast.error("Failed to delete content");
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
		<motion.div
			className={`group relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-sky-200/50 dark:border-sky-700/50 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 ${
				mode === "grid"
					? "flex flex-col"
					: "flex items-center gap-4 p-4"
			}`}
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			whileHover={{ scale: 1.02 }}
		>
			{/* Gradient border effect */}
			<div className="absolute inset-0 bg-gradient-to-r from-sky-400/20 via-blue-500/20 to-indigo-500/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

			{/* left / top media */}
			<div
				className={`${
					mode === "grid"
						? content.url_data?.thumbnail
							? "aspect-[16/8] w-full max-h-72"
							: "h-48 w-full"
						: content.url_data?.thumbnail
						? "w-52 aspect-[16/8] flex-shrink-0"
						: "w-44 h-28 flex-shrink-0"
				} relative bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 overflow-hidden`}
				onMouseEnter={() => setHoverThumb(true)}
				onMouseLeave={() => setHoverThumb(false)}
				onFocus={() => setHoverThumb(true)}
				onBlur={() => setHoverThumb(false)}
				tabIndex={0}
			>
				{content.url_data?.thumbnail ? (
					<motion.img
						src={content.url_data.thumbnail}
						alt={content.url_data.site_name}
						className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
						whileHover={{ scale: 1.05 }}
					/>
				) : (
					<div
						className={`w-full h-full bg-gradient-to-br ${
							content.color ?? chosenGradient
						} flex items-center justify-center relative overflow-hidden`}
					>
						{/* Animated background pattern */}
						<div className="absolute inset-0 opacity-20">
							<motion.div
								className="absolute inset-0 bg-white/10"
								animate={{
									background: [
										"radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
										"radial-gradient(circle at 80% 50%, white 1px, transparent 1px)",
										"radial-gradient(circle at 20% 50%, white 1px, transparent 1px)",
									],
								}}
								transition={{ duration: 4, repeat: Infinity }}
							/>
						</div>
						<div className="text-white text-sm font-bold px-3 truncate relative z-10 text-center">
							{content.url_data?.site_name ??
								new URL(content.url).hostname}
						</div>
					</div>
				)}

				{/* Enhanced action buttons with better visibility */}
				<div className="absolute top-3 right-3 flex items-center gap-2">
					<motion.div
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						className="relative"
					>
						<div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-full" />
						<Icon
							onClick={toggleFav}
							ariaLabel={
								isFav ? "Remove favorite" : "Add favorite"
							}
							className={`relative z-10 p-2 rounded-full transition-all duration-200 ${
								isFav
									? "text-rose-500 bg-white/90 shadow-lg"
									: "text-white hover:text-rose-400 hover:bg-white/20"
							}`}
							size={16}
						>
							<FiHeart className={isFav ? "fill-current" : ""} />
						</Icon>
					</motion.div>

					<motion.div
						whileHover={{ scale: 1.1 }}
						whileTap={{ scale: 0.9 }}
						className="relative"
					>
						<div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-full" />
						<Icon
							onClick={toggleHot}
							ariaLabel={isHot ? "Unmark hot" : "Mark hot"}
							className={`relative z-10 p-2 rounded-full transition-all duration-200 ${
								isHot
									? "text-yellow-500 bg-white/90 shadow-lg"
									: "text-white hover:text-yellow-400 hover:bg-white/20"
							}`}
							size={16}
						>
							<FiStar className={isHot ? "fill-current" : ""} />
						</Icon>
					</motion.div>

					<div className="relative">
						<motion.div
							whileHover={{ scale: 1.1 }}
							whileTap={{ scale: 0.9 }}
							className="relative"
						>
							<div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-full" />
							<Icon
								onClick={(e?: React.MouseEvent) => {
									if (e) {
										const rect = (
											e.currentTarget as HTMLElement
										).getBoundingClientRect();
										setMenuPosition({
											x: rect.right,
											y: rect.bottom,
										});
									}
									setMenuOpen((v) => !v);
								}}
								ariaLabel="More"
								className="relative z-10 p-2 rounded-full text-white hover:bg-white/20 transition-all duration-200"
								size={16}
							>
								<FiMoreVertical />
							</Icon>
						</motion.div>
					</div>
				</div>

				{/* Enhanced tooltip for copying id */}
				{hoverThumb && (
					<motion.div
						initial={{ opacity: 0, y: 10, scale: 0.9 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: 10, scale: 0.9 }}
						transition={{ duration: 0.2 }}
						className="absolute left-3 bottom-3 z-50"
					>
						<motion.button
							onClick={handleCopyId}
							aria-label="Copy content id"
							className="flex items-center gap-2 px-3 py-2 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-sky-200/50 dark:border-sky-700/50 rounded-lg shadow-lg text-xs font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-50/90 dark:hover:bg-sky-800/50 transition-all duration-200"
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
						>
							<span className="truncate max-w-[8rem]">
								{content.id}
							</span>
							<FiCopy className="text-sky-500" />
						</motion.button>
					</motion.div>
				)}
			</div>

			{/* content body */}
			<div
				className={`flex-1 ${
					mode === "grid"
						? "p-2 sm:p-3 md:p-4 flex flex-col gap-1.5 sm:gap-2"
						: "flex items-center justify-between w-full p-2 sm:p-4"
				}`}
			>
				<div className="flex-1">
					<div className="flex items-start gap-2 sm:gap-3">
						<div className="flex-1 min-w-0">
							<div className="flex items-center justify-between gap-2 sm:gap-3">
								<h3 className="text-sm sm:text-base font-bold text-sky-900 dark:text-sky-100 truncate bg-gradient-to-r from-sky-800 to-blue-700 dark:from-sky-200 dark:to-blue-300 bg-clip-text">
									{content.url_data?.site_name ??
										new URL(content.url).hostname}
								</h3>
								<motion.div
									className="flex items-center gap-1 px-1.5 sm:px-2 py-1 bg-sky-100/80 dark:bg-sky-800/40 rounded-full flex-shrink-0"
									whileHover={{ scale: 1.05 }}
								>
									<div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
									<div className="text-xs font-medium text-sky-600 dark:text-sky-300 whitespace-nowrap">
										{timeAgo(content.timestamp)}
									</div>
								</motion.div>
							</div>
							{content.description && (
								<p className="mt-1 text-xs sm:text-sm text-sky-700 dark:text-sky-300 line-clamp-2 leading-relaxed">
									{content.description}
								</p>
							)}

							{/* Enhanced tags */}
							<div className="mt-1.5 flex flex-wrap gap-1">
								{(content.tags || [])
									.slice(0, mode === "grid" ? 5 : 3)
									.map((tag) => (
										<motion.span
											key={tag}
											className="text-xs bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/50 border border-sky-200/50 dark:border-sky-700/50 px-2 sm:px-3 py-1 rounded-full text-sky-700 dark:text-sky-200 font-medium hover:shadow-md transition-all duration-200"
											whileHover={{ scale: 1.05, y: -1 }}
											initial={{ opacity: 0, scale: 0.8 }}
											animate={{ opacity: 1, scale: 1 }}
											transition={{ delay: 0.1 }}
										>
											#{tag}
										</motion.span>
									))}
							</div>
						</div>
					</div>

					{/* Enhanced color swatches */}
					<div className="mt-2 flex items-start sm:items-center justify-between gap-2 flex-col sm:flex-row py-1">
						<div className="flex items-center gap-2 min-w-0">
							<span className="text-xs font-medium text-sky-600 dark:text-sky-400 flex-shrink-0">
								Themes:
							</span>
							<div className="flex gap-1 sm:gap-1.5 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
								{COLORS.map((colorGradient, index) => (
									<motion.button
										key={colorGradient}
										onClick={() =>
											changeColor(colorGradient)
										}
										aria-label={`Choose color theme ${
											index + 1
										}`}
										className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 transition-all duration-200 bg-gradient-to-br ${colorGradient} flex-shrink-0 ${
											(content.color ??
												chosenGradient) ===
											colorGradient
												? " shadow-lg scale-110"
												: "border-white/50 dark:border-gray-600/50 hover:scale-105"
										}`}
										whileHover={{ scale: 1.15 }}
										whileTap={{ scale: 0.95 }}
										initial={{ opacity: 0, scale: 0 }}
										animate={{ opacity: 1, scale: 1 }}
										transition={{
											delay: 0.05 + index * 0.05,
										}}
									/>
								))}
							</div>
						</div>

						{/* Enhanced action buttons - responsive stacking */}
						<div className="flex flex-row sm:flex-col gap-2 sm:gap-1.5 w-full sm:w-auto">
							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="flex-1 sm:flex-none"
							>
								<Button
									size="small"
									level="secondary"
									onClick={() => {
										navigator.clipboard?.writeText(
											content.url
										);
										addNotification({
											title: "Copied",
											message: content.url,
											type: "info",
											read: false,
										});
										toast.success("URL copied!");
									}}
									className="w-full shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/50 border-sky-200 dark:border-sky-700 hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-800/50 dark:hover:to-blue-800/50"
								>
									<div className="flex items-center gap-1 justify-center">
										<FiCopy className="text-sky-600 dark:text-sky-400" />
										<span className="font-medium text-xs sm:text-sm">
											Copy
										</span>
									</div>
								</Button>
							</motion.div>

							<motion.div
								whileHover={{ scale: 1.05 }}
								whileTap={{ scale: 0.95 }}
								className="flex-1 sm:flex-none"
							>
								<Button
									size="small"
									level="primary"
									onClick={() => {
										window.open(content.url, "_blank");
									}}
									className="w-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 transform hover:-translate-y-0.5"
								>
									<div className="flex items-center gap-1 sm:gap-2 justify-center">
										<span className="font-bold text-xs sm:text-sm">
											{"Open"}
										</span>
										<motion.div
											initial={{ x: 0 }}
											whileHover={{ x: 2 }}
											transition={{ duration: 0.2 }}
											className="text-xs sm:text-sm"
										>
											{" →"}
										</motion.div>
									</div>
								</Button>
							</motion.div>
						</div>
					</div>
				</div>
			</div>

			{/* Add Child Modal */}
			{showAddChildModal && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
					onClick={() => setShowAddChildModal(false)}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-sky-200/50 dark:border-sky-700/50"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-6">
							<h3 className="text-lg font-bold text-sky-900 dark:text-sky-100 mb-4">
								Add Child Content
							</h3>
							<div className="mb-4">
								<label className="block text-sm font-medium text-sky-700 dark:text-sky-300 mb-2">
									Child Content ID
								</label>
								<input
									type="text"
									value={childId}
									onChange={(e) => setChildId(e.target.value)}
									placeholder="Enter child content ID"
									className="w-full px-3 py-2 bg-white/90 dark:bg-gray-800/90 border border-sky-200 dark:border-sky-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-gray-900 dark:text-gray-100"
									autoFocus
								/>
							</div>
							<div className="flex gap-3">
								<motion.button
									onClick={() => {
										setShowAddChildModal(false);
										setChildId("");
									}}
									className="flex-1 px-4 py-2 text-sm font-medium text-sky-600 dark:text-sky-300 bg-sky-50/80 dark:bg-sky-900/50 border border-sky-200/60 dark:border-sky-700/60 rounded-xl hover:bg-sky-100/80 dark:hover:bg-sky-800/50 transition-all duration-200"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									Cancel
								</motion.button>
								<motion.button
									onClick={handleAddChild}
									disabled={!childId.trim()}
									className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-sky-500 to-blue-600 rounded-xl hover:from-sky-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transition-all duration-200"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									Add Child
								</motion.button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}

			{/* Dropdown Menu Portal */}
			{menuOpen &&
				createPortal(
					<>
						{/* Backdrop */}
						<div
							className="fixed inset-0 z-[9998]"
							onClick={() => setMenuOpen(false)}
						/>
						{/* Menu */}
						<motion.div
							initial={{ opacity: 0, y: -10, scale: 0.95 }}
							animate={{ opacity: 1, y: 0, scale: 1 }}
							exit={{ opacity: 0, y: -10, scale: 0.95 }}
							transition={{ duration: 0.15 }}
							className="fixed w-44 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-sky-200/50 dark:border-sky-700/50 rounded-xl shadow-xl z-[9999] overflow-hidden"
							style={{
								top: menuPosition.y + 8,
								left: menuPosition.x - 176, // 44 * 4 = 176px (width of menu)
							}}
						>
							<motion.button
								onClick={() => {
									setMenuOpen(false);
									setShowAddChildModal(true);
								}}
								className="w-full text-left px-4 py-3 hover:bg-sky-50/80 dark:hover:bg-sky-800/30 flex items-center gap-3 text-sky-700 dark:text-sky-300 font-medium transition-colors duration-150"
								whileHover={{ x: 4 }}
							>
								<FiPlus className="text-emerald-500" />
								<span>Add child</span>
							</motion.button>
							<motion.button
								onClick={() => {
									setMenuOpen(false);
									handleCopyId();
								}}
								className="w-full text-left px-4 py-3 hover:bg-sky-50/80 dark:hover:bg-sky-800/30 flex items-center gap-3 text-sky-700 dark:text-sky-300 font-medium transition-colors duration-150"
								whileHover={{ x: 4 }}
							>
								<FiCopy className="text-blue-500" />
								<span>Copy ID</span>
							</motion.button>
							<motion.button
								onClick={() => {
									setMenuOpen(false);
									setShowDeleteConfirm(true);
								}}
								className="w-full text-left px-4 py-3 hover:bg-rose-50/80 dark:hover:bg-rose-900/30 text-rose-600 dark:text-rose-400 flex items-center gap-3 font-medium transition-colors duration-150"
								whileHover={{ x: 4 }}
							>
								<FiTrash2 />
								<span>Delete</span>
							</motion.button>
						</motion.div>
					</>,
					document.body
				)}

			{/* Delete Confirmation Modal */}
			{showDeleteConfirm && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
					onClick={() => setShowDeleteConfirm(false)}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-md border border-sky-200/50 dark:border-sky-700/50"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="p-6">
							<div className="flex items-center gap-4 mb-4">
								<div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/50 flex items-center justify-center">
									<FiTrash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />
								</div>
								<div>
									<h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">
										Delete Content
									</h3>
									<p className="text-sm text-gray-600 dark:text-gray-400">
										This action cannot be undone
									</p>
								</div>
							</div>
							<p className="text-sm text-gray-700 dark:text-gray-300 mb-6">
								Are you sure you want to delete this content?
								This will also remove all associated links and
								references.
							</p>
							<div className="flex gap-3">
								<motion.button
									onClick={() => setShowDeleteConfirm(false)}
									className="flex-1 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50/80 dark:bg-gray-800/50 border border-gray-200/60 dark:border-gray-700/60 rounded-xl hover:bg-gray-100/80 dark:hover:bg-gray-700/50 transition-all duration-200"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									Cancel
								</motion.button>
								<motion.button
									onClick={handleDelete}
									className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-rose-500 to-red-600 rounded-xl hover:from-rose-600 hover:to-red-700 transition-all duration-200"
									whileHover={{ scale: 1.02 }}
									whileTap={{ scale: 0.98 }}
								>
									Delete
								</motion.button>
							</div>
						</div>
					</motion.div>
				</motion.div>
			)}
		</motion.div>
	);
}
