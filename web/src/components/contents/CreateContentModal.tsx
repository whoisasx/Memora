import { motion, AnimatePresence } from "motion/react";
import { useState, useEffect } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import { useDashboardStore } from "../../store/dashboardStore";
import type { ApiResponseData, Content } from "../../types/apiResponse";
import useDebounce from "../../hooks/debounceHook";
import axios from "axios";
import Icon from "../../ui/Icon";
import { Button } from "../../ui/Button";
import { v4 } from "uuid";
import { useNodeStore } from "../../store/nodeStore";

const colors = [
	"#3B82F6", // blue
	"#8B5CF6", // purple
	"#EC4899", // pink
	"#F59E0B", // amber
	"#EF4444", // red
	"#06B6D4", // cyan
	"#84CC16", // lime
];

// ✅ TagInput component
function TagInput({
	query,
	setQuery,
	onSelect,
	suggestions = [
		"Twitter",
		"LinkedIn",
		"Github",
		"Leetcode",
		"Youtube",
		"Instagram",
	],
	onSearch,
}: {
	query: string;
	setQuery: (v: string) => void;
	onSelect: (tag: string) => void;
	suggestions?: string[];
	onSearch?: (q: string) => Promise<string[]>;
}) {
	const debouncedQuery = useDebounce(query, 300);
	const [results, setResults] = useState<string[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		let mounted = true;
		if (!onSearch) {
			setResults([]);
			return;
		}

		if (!debouncedQuery.trim()) {
			setResults([]);
			return;
		}

		setLoading(true);
		onSearch(debouncedQuery)
			.then((res) => {
				if (!mounted) return;
				setResults(res || []);
			})
			.catch((e) => console.error(e))
			.finally(() => mounted && setLoading(false));

		return () => {
			mounted = false;
		};
	}, [debouncedQuery, onSearch]);

	const combined = Array.from(new Set([...(suggestions || []), ...results]));

	return (
		<div className="relative mt-2">
			<input
				type="text"
				value={query}
				onChange={(e) => setQuery(e.target.value)}
				onKeyDown={(e) => {
					if (e.key === "Enter") {
						e.preventDefault();
						if (combined.length > 0) onSelect(combined[0]);
						else if (query.trim()) onSelect(query.trim());
					}
				}}
				placeholder="Search tags or type a custom tag"
				className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl bg-white/90 dark:bg-gray-800/90 border border-sky-200 dark:border-sky-700 focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
			/>

			{/* show suggestions as quick picks */}
			<div className="flex gap-2 mt-3 flex-wrap">
				{suggestions.slice(0, 5).map((s) => (
					<motion.button
						key={s}
						type="button"
						onClick={() => onSelect(s)}
						className="px-3 py-1.5 rounded-full bg-sky-100/80 dark:bg-sky-800/50 text-sky-700 dark:text-sky-300 text-sm font-medium hover:bg-sky-200/80 dark:hover:bg-sky-700/50 transition-colors duration-200"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						{s}
					</motion.button>
				))}
			</div>

			{/* show results returned from DB (if any) */}
			{loading && (
				<motion.div
					className="text-sm text-sky-500 mt-3 flex items-center gap-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
				>
					<div className="w-4 h-4 border-2 border-sky-500/30 border-t-sky-500 rounded-full animate-spin"></div>
					Searching…
				</motion.div>
			)}
			{!loading && results.length > 0 && (
				<motion.div
					className="mt-3 bg-white/80 dark:bg-gray-900/80 border border-sky-200/80 dark:border-sky-700/80 rounded-xl shadow-lg overflow-hidden backdrop-blur-sm"
					initial={{ opacity: 0, y: -10 }}
					animate={{ opacity: 1, y: 0 }}
				>
					{results.map((r) => (
						<motion.button
							key={r}
							type="button"
							onClick={() => onSelect(r)}
							className="w-full text-left px-4 py-3 hover:bg-sky-50/80 dark:hover:bg-sky-800/30 flex items-center justify-between transition-colors duration-200"
							whileHover={{ x: 4 }}
						>
							<span className="text-sky-900 dark:text-sky-100">
								{r}
							</span>
							<small className="text-xs text-sky-500 bg-sky-100/50 dark:bg-sky-800/50 px-2 py-1 rounded-full">
								DB
							</small>
						</motion.button>
					))}
				</motion.div>
			)}

			{/* allow custom use */}
			{!loading && query.trim() && results.length === 0 && (
				<motion.div
					className="mt-3"
					initial={{ opacity: 0, y: -5 }}
					animate={{ opacity: 1, y: 0 }}
				>
					<motion.button
						type="button"
						onClick={() => onSelect(query.trim())}
						className="px-4 py-2 rounded-xl bg-sky-100/80 dark:bg-sky-800/50 border border-sky-200/80 dark:border-sky-700/80 text-sm font-medium text-sky-700 dark:text-sky-300 hover:bg-sky-200/80 dark:hover:bg-sky-700/50 transition-all duration-200"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						✨ Use "{query.trim()}"
					</motion.button>
				</motion.div>
			)}
		</div>
	);
}

export default function CreateContentModal() {
	const createModelOpen = useDashboardStore((s) => s.createModelOpen);
	const setCreateModelOpen = useDashboardStore((s) => s.setCreateModelOpen);
	const addContent = useDashboardStore((s) => s.addContent);
	const addNotification = useDashboardStore((s) => s.addNotification);
	const { addNode } = useNodeStore();

	type FormData = {
		url: string;
		description: string;
		color: string;
		tag: string; // single tag
	};

	const [formData, setFormData] = useState<FormData>({
		url: "",
		description: "",
		color: colors[0],
		tag: "",
	});

	const [tagQuery, setTagQuery] = useState("");

	// URL validation: only allow valid URLs before enabling submit
	const [isUrlValid, setIsUrlValid] = useState(false);

	function isValidUrl(url: string) {
		if (!url || !url.trim()) return false;

		// Attempt to parse the provided string, first as-is then with https:// prefix
		let parsed: URL | null = null;
		try {
			parsed = new URL(url);
		} catch {
			try {
				parsed = new URL(`https://${url}`);
			} catch {
				return false;
			}
		}

		if (!parsed) return false;

		// Only allow http and https schemes
		if (parsed.protocol !== "http:" && parsed.protocol !== "https:")
			return false;

		const hostname = parsed.hostname || "";

		// Allow explicit localhost
		if (hostname === "localhost") return true;

		// Allow IPv4 addresses (with basic range check)
		const ipv4 = /^\d{1,3}(?:\.\d{1,3}){3}$/.test(hostname);
		if (ipv4) {
			const parts = hostname.split(".").map((p) => Number(p));
			if (parts.every((n) => !Number.isNaN(n) && n >= 0 && n <= 255))
				return true;
		}

		// Finally require a dot in hostname (e.g. example.com). This rejects bare words like "foobar"
		if (hostname.includes(".")) return true;

		return false;
	}

	// keep validation in sync if url is changed elsewhere
	useEffect(() => {
		setIsUrlValid(isValidUrl(formData.url));
	}, [formData.url]);

	// Build a compact preview (hostname + short path) to avoid showing the full raw URL
	function formatPreviewUrl(url?: string) {
		if (!url) return { title: "Content URL", short: "" };
		let parsed: URL | null = null;
		try {
			parsed = new URL(url);
		} catch {
			try {
				parsed = new URL(`https://${url}`);
			} catch {
				return { title: url, short: "" };
			}
		}

		const hostname = parsed.hostname;
		let path = parsed.pathname === "/" ? "" : parsed.pathname;
		if (parsed.search) path += parsed.search;
		// truncate long paths
		if (path.length > 36) path = path.slice(0, 32) + "…";
		const title = path ? `${hostname}${path}` : hostname;
		return { title, short: hostname };
	}

	const handleClose = () => {
		setCreateModelOpen(false);
		setFormData({
			url: "",
			description: "",
			color: colors[0],
			tag: "",
		});
		setTagQuery("");
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!formData.url.trim()) return toast.error("Please enter a URL");

		// Close modal immediately when user clicks submit
		handleClose();

		try {
			// validate/parse URL
			toast("Adding Content.");
			const urlStr = formData.url.trim();
			let hostname = urlStr;
			try {
				hostname = new URL(urlStr).hostname;
			} catch {
				try {
					hostname = new URL(`https://${urlStr}`).hostname;
				} catch {
					toast.error("Invalid URL");
					return;
				}
			}

			const c: Content = {
				id: v4(),
				url: urlStr,
				description: formData.description.trim() || undefined,
				color: formData.color,
				timestamp: Date.now(),
				tags: formData.tag ? [formData.tag] : [],
				url_data: {
					domain: hostname,
					site_name: hostname,
				},
				"all-children": [],
			};
			try {
				const backendUrl = import.meta.env.VITE_BACKEND_URL;
				const response = await axios.post(
					`${backendUrl}/api/contents/`,
					{
						id: c.id,
						url: c.url,
						description: c.description,
						color: c.color,
						timestamp: c.timestamp,
						tags: c.tags,
					},
					{
						headers: {
							Authorization: `Bearer ${localStorage.getItem(
								"access-token"
							)}`,
						},
					}
				);

				const responseData = response.data as ApiResponseData;
				if (response.status === 201) {
					const content = { ...responseData.content! };
					addContent(content);
					addNode(content.id);
					addNotification({
						title: "Content added",
						message: `${content.id} added`,
						type: "success",
						read: false,
					});
					toast.success("Content added");
				} else {
					toast.error("Error adding content");
				}
			} catch (error) {
				toast.error("Error adding content");
			} finally {
			}
		} catch (err) {
			console.error(err);
			toast.error("Error adding content");
		}
	};

	// Optional: replace with a real API call to search tags in your DB
	const onSearchTag = async (q: string) => {
		// Example stub: return some matches based on q
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(`${backendUrl}/api/tags/search`, {
				tagname: q,
			});
			const responseData = response.data as ApiResponseData;
			return responseData.tags!.map((t) => t.tagname);
		} catch (error) {
			console.log(error);
			return [];
		} finally {
		}
	};

	return (
		<AnimatePresence>
			{createModelOpen && (
				<motion.div
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-4"
					onClick={handleClose}
				>
					<motion.div
						initial={{ opacity: 0, scale: 0.95, y: 20 }}
						animate={{ opacity: 1, scale: 1, y: 0 }}
						exit={{ opacity: 0, scale: 0.95, y: 20 }}
						transition={{
							type: "spring",
							damping: 25,
							stiffness: 300,
						}}
						className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg rounded-2xl shadow-2xl w-full max-w-lg border border-sky-200/50 dark:border-sky-700/50 max-h-[90vh] overflow-hidden flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between p-4 sm:p-6 border-b border-sky-200/50 dark:border-sky-700/50 bg-gradient-to-r from-sky-50/50 to-blue-50/50 dark:from-sky-900/20 dark:to-blue-900/20">
							<h2 className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100 bg-gradient-to-r from-sky-800 to-blue-700 dark:from-sky-200 dark:to-blue-300 bg-clip-text">
								Create New Content
							</h2>
							<motion.div
								whileHover={{ scale: 1.1 }}
								whileTap={{ scale: 0.9 }}
							>
								<Icon
									onClick={handleClose}
									ariaLabel="Close"
									className="p-2 rounded-full hover:bg-sky-100/80 dark:hover:bg-sky-800/50 transition-colors duration-200"
								>
									<XMarkIcon className="w-5 h-5 text-sky-700 dark:text-sky-300" />
								</Icon>
							</motion.div>
						</div>

						<div className="flex-1 overflow-y-auto">
							<form
								onSubmit={handleSubmit}
								className="p-4 sm:p-6 space-y-4 sm:space-y-6"
							>
								{/* URL */}
								<div>
									<label className="block text-sm font-medium text-sky-700 dark:text-sky-300 mb-2">
										URL
									</label>
									<input
										type="url"
										value={formData.url}
										onChange={(e) => {
											const v = e.target.value;
											setFormData({
												...formData,
												url: v,
											});
											setIsUrlValid(isValidUrl(v));
										}}
										placeholder="https://example.com or domain.com"
										className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 dark:bg-gray-800/90 border border-sky-200 dark:border-sky-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
										required
										autoFocus
									/>
									{formData.url && !isUrlValid && (
										<motion.div
											initial={{ opacity: 0, y: -5 }}
											animate={{ opacity: 1, y: 0 }}
											className="text-xs text-rose-500 mt-2 flex items-center gap-1"
										>
											<span>⚠️</span>
											Please enter a valid URL (include
											protocol or hostname)
										</motion.div>
									)}
								</div>

								{/* Description */}
								<div>
									<label className="block text-sm font-medium text-sky-700 dark:text-sky-300 mb-2">
										Description (Optional)
									</label>
									<textarea
										value={formData.description}
										onChange={(e) =>
											setFormData({
												...formData,
												description: e.target.value,
											})
										}
										placeholder="Add a short description..."
										rows={3}
										className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-white/90 dark:bg-gray-800/90 border border-sky-200 dark:border-sky-700 rounded-xl focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all duration-200 resize-none text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
									/>
								</div>

								{/* Color */}
								<div>
									<label className="block text-sm font-medium text-sky-700 dark:text-sky-300 mb-3">
										Theme Color
									</label>
									<div className="flex flex-wrap gap-2 sm:gap-3 items-center">
										{colors.map((color, index) => (
											<motion.button
												key={color}
												type="button"
												onClick={() =>
													setFormData({
														...formData,
														color,
													})
												}
												className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-all duration-200 ${
													formData.color === color
														? "border-sky-500 scale-110 shadow-lg"
														: "border-sky-200/50 dark:border-sky-700/50 hover:scale-105"
												}`}
												style={{
													backgroundColor: color,
												}}
												whileHover={{ scale: 1.1 }}
												whileTap={{ scale: 0.95 }}
												initial={{
													opacity: 0,
													scale: 0,
												}}
												animate={{
													opacity: 1,
													scale: 1,
												}}
												transition={{
													delay: index * 0.05,
												}}
											/>
										))}
									</div>
								</div>

								{/* Tag (single) */}
								<div>
									<label className="block text-sm font-medium text-sky-700 dark:text-sky-300 mb-2">
										Tag
									</label>
									<div className="flex items-center gap-3">
										{formData.tag ? (
											<motion.span
												initial={{
													opacity: 0,
													scale: 0.8,
												}}
												animate={{
													opacity: 1,
													scale: 1,
												}}
												className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium text-white shadow-md"
												style={{
													backgroundColor:
														formData.color,
												}}
											>
												<span className="mr-2">
													#{formData.tag}
												</span>
												<motion.button
													type="button"
													onClick={() =>
														setFormData({
															...formData,
															tag: "",
														})
													}
													className="opacity-80 hover:opacity-100 transition-opacity"
													whileHover={{ scale: 1.1 }}
													whileTap={{ scale: 0.9 }}
												>
													×
												</motion.button>
											</motion.span>
										) : (
											<div className="flex-1">
												<TagInput
													query={tagQuery}
													setQuery={setTagQuery}
													onSelect={(t) =>
														setFormData({
															...formData,
															tag: t,
														})
													}
													onSearch={onSearchTag}
												/>
											</div>
										)}
									</div>
								</div>

								{/* Enhanced Preview */}
								<motion.div
									className="p-4 sm:p-5 bg-gradient-to-br from-sky-50/80 to-blue-50/80 dark:from-sky-900/40 dark:to-blue-900/40 rounded-xl border border-sky-200/50 dark:border-sky-700/50 shadow-inner"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.2 }}
								>
									<div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
										{(() => {
											const p = formatPreviewUrl(
												formData.url
											);
											return (
												<>
													<motion.div
														className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg flex-shrink-0"
														style={{
															backgroundColor:
																formData.color,
														}}
														whileHover={{
															scale: 1.05,
														}}
														initial={{ scale: 0 }}
														animate={{ scale: 1 }}
														transition={{
															delay: 0.3,
															type: "spring",
														}}
													>
														{(p.short || p.title)
															.charAt(0)
															?.toUpperCase() ||
															"C"}
													</motion.div>
													<div className="flex-1 min-w-0">
														<motion.h4
															className="font-bold text-sky-900 dark:text-sky-100 truncate text-sm sm:text-base"
															initial={{
																opacity: 0,
																x: -10,
															}}
															animate={{
																opacity: 1,
																x: 0,
															}}
															transition={{
																delay: 0.4,
															}}
														>
															{p.title ||
																"Your Content Title"}
														</motion.h4>
														<motion.p
															className="text-xs sm:text-sm text-sky-600 dark:text-sky-400 mt-1 line-clamp-2"
															initial={{
																opacity: 0,
																x: -10,
															}}
															animate={{
																opacity: 1,
																x: 0,
															}}
															transition={{
																delay: 0.5,
															}}
														>
															{formData.description ||
																"No description provided"}
														</motion.p>
														{formData.tag && (
															<motion.div
																initial={{
																	opacity: 0,
																	scale: 0.8,
																}}
																animate={{
																	opacity: 1,
																	scale: 1,
																}}
																transition={{
																	delay: 0.6,
																}}
																className="mt-2"
															>
																<span
																	className="inline-block px-2 py-1 rounded-full text-xs font-medium text-white"
																	style={{
																		backgroundColor:
																			formData.color,
																	}}
																>
																	#
																	{
																		formData.tag
																	}
																</span>
															</motion.div>
														)}
													</div>
												</>
											);
										})()}
									</div>
								</motion.div>

								{/* Actions */}
								<div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-sky-200/50 dark:border-sky-700/50">
									<motion.div
										className="flex-1"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Button
											size="medium"
											level="secondary"
											onClick={handleClose}
											className="w-full shadow-md hover:shadow-lg transition-all duration-200 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/50 border-sky-200 dark:border-sky-700 hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-800/50 dark:hover:to-blue-800/50"
										>
											Cancel
										</Button>
									</motion.div>
									<motion.div
										className="flex-1"
										whileHover={{ scale: 1.02 }}
										whileTap={{ scale: 0.98 }}
									>
										<Button
											type="submit"
											size="medium"
											level="primary"
											disabled={!isUrlValid}
											className="w-full shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed transform hover:-translate-y-0.5 disabled:hover:transform-none"
										>
											{isUrlValid
												? "✨ Add Content"
												: "Invalid URL"}
										</Button>
									</motion.div>
								</div>
							</form>
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
