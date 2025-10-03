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
				className="w-full px-3 py-2 rounded-md bg-white/50 dark:bg-gray-900/40 border border-sky-100 dark:border-sky-800"
			/>

			{/* show suggestions as quick picks */}
			<div className="flex gap-2 mt-2 flex-wrap">
				{suggestions.slice(0, 5).map((s) => (
					<button
						key={s}
						type="button"
						onClick={() => onSelect(s)}
						className="px-3 py-1 rounded-full bg-sky-50 dark:bg-gray-800 text-sm"
					>
						{s}
					</button>
				))}
			</div>

			{/* show results returned from DB (if any) */}
			{loading && (
				<div className="text-sm text-sky-500 mt-2">Searching…</div>
			)}
			{!loading && results.length > 0 && (
				<div className="mt-2 bg-white dark:bg-gray-900/60 border border-sky-100 dark:border-sky-800 rounded-md shadow-sm">
					{results.map((r) => (
						<button
							key={r}
							type="button"
							onClick={() => onSelect(r)}
							className="w-full text-left px-3 py-2 hover:bg-sky-50 dark:hover:bg-gray-800 flex items-center justify-between"
						>
							<span>{r}</span>
							<small className="text-xs text-sky-500">DB</small>
						</button>
					))}
				</div>
			)}

			{/* allow custom use */}
			{!loading && query.trim() && results.length === 0 && (
				<div className="mt-2">
					<button
						type="button"
						onClick={() => onSelect(query.trim())}
						className="px-3 py-2 rounded-md bg-transparent border border-sky-100 dark:border-sky-800 text-sm"
					>
						Use "{query.trim()}"
					</button>
				</div>
			)}
		</div>
	);
}

export default function CreateContentModal() {
	const createModelOpen = useDashboardStore((s) => s.createModelOpen);
	const setCreateModelOpen = useDashboardStore((s) => s.setCreateModelOpen);
	const addContent = useDashboardStore((s) => s.addContent);
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

		try {
			// validate/parse URL
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
					`${backendUrl}/contents`,
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
		} finally {
			handleClose();
		}
	};

	// Optional: replace with a real API call to search tags in your DB
	const onSearchTag = async (q: string) => {
		// Example stub: return some matches based on q
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(`${backendUrl}/tags/search`, {
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
					className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
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
						className="bg-white/60 dark:bg-gray-900/60 rounded-2xl shadow-2xl w-full max-w-md border border-sky-100 dark:border-sky-800"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-700">
							<h2 className="text-xl font-semibold text-slate-900 dark:text-white">
								Create New Content
							</h2>
							<Icon
								onClick={handleClose}
								ariaLabel="Close"
								className="p-2"
							>
								<XMarkIcon />
							</Icon>
						</div>

						<form onSubmit={handleSubmit} className="p-6 space-y-6">
							{/* URL */}
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									URL
								</label>
								<input
									type="url"
									value={formData.url}
									onChange={(e) => {
										const v = e.target.value;
										setFormData({ ...formData, url: v });
										setIsUrlValid(isValidUrl(v));
									}}
									placeholder="https://example.com"
									className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									required
									autoFocus
								/>
								{formData.url && !isUrlValid && (
									<div className="text-xs text-rose-500 mt-2">
										Please enter a valid URL (include
										protocol or hostname)
									</div>
								)}
							</div>

							{/* Description */}
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
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
									placeholder="Short description..."
									rows={3}
									className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
								/>
							</div>

							{/* Color */}
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									Color
								</label>
								<div className="flex space-x-2 items-center">
									{colors.map((color) => (
										<button
											key={color}
											type="button"
											onClick={() =>
												setFormData({
													...formData,
													color,
												})
											}
											className={`w-8 h-8 rounded-full border-2 transition-all ${
												formData.color === color
													? "border-slate-400 scale-110"
													: "border-slate-200 dark:border-slate-600 hover:scale-105"
											}`}
											style={{ backgroundColor: color }}
										/>
									))}
								</div>
							</div>

							{/* Tag (single) */}
							<div>
								<label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
									Tag
								</label>
								<div className="flex items-center gap-3">
									{formData.tag ? (
										<span
											className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium text-white"
											style={{
												backgroundColor: formData.color,
											}}
										>
											<span className="mr-2">
												{formData.tag}
											</span>
											<button
												type="button"
												onClick={() =>
													setFormData({
														...formData,
														tag: "",
													})
												}
												className="opacity-80 hover:opacity-100"
											>
												×
											</button>
										</span>
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

							{/* Preview */}
							<div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
								<div className="flex items-center space-x-3">
									{(() => {
										const p = formatPreviewUrl(
											formData.url
										);
										return (
											<>
												<div
													className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
													style={{
														backgroundColor:
															formData.color,
													}}
												>
													{(p.short || p.title)
														.charAt(0)
														?.toUpperCase() || "C"}
												</div>
												<div>
													<h4 className="font-medium text-slate-900 dark:text-white">
														{p.title}
													</h4>
													<p className="text-sm text-slate-500 dark:text-slate-400">
														{formData.description ||
															"No description"}
													</p>
												</div>
											</>
										);
									})()}
								</div>
							</div>

							{/* Actions */}
							<div className="flex space-x-3 pt-4">
								<Button
									size="medium"
									level="secondary"
									onClick={handleClose}
									className="flex-1"
								>
									Cancel
								</Button>
								<Button
									type="submit"
									size="medium"
									level="primary"
									disabled={!isUrlValid}
									className="flex-1"
								>
									Add content
								</Button>
							</div>

							{/* URL validation error message */}
							{!isUrlValid && (
								<div className="text-sm text-red-500 mt-2">
									Invalid URL format
								</div>
							)}
						</form>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
