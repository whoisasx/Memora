import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import Searchbar from "./Searchbar";
import ContentCard from "../contents/ContentCard";
import { useDashboardStore } from "../../store/dashboardStore";
import axios from "axios";
import type { ApiResponseData } from "../../types/apiResponse";

export default function SearchSection() {
	const contents = useDashboardStore((s) => s.contents);
	const setSearchedContents = useDashboardStore((s) => s.setSearchedContents);
	const [normalResults, setNormalResults] = useState<string[]>([]);
	const [aiResults, setAiResults] = useState<string[]>([]);
	const [aiAnswer, setAiAnswer] = useState<string[]>([]); // streaming pieces
	const [showArrow, setShowArrow] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const [isSearching, setIsSearching] = useState(false);

	// show the arrow when the content list is present but not in the viewport
	useEffect(() => {
		const el = document.getElementById("content-list");
		if (!el) {
			setShowArrow(false);
			return;
		}

		const obs = new IntersectionObserver(
			(entries) => {
				const e = entries[0];
				// show arrow only when the element is NOT intersecting (i.e., out of view)
				setShowArrow(!e.isIntersecting);
			},
			{ threshold: 0.1 }
		);

		obs.observe(el);
		return () => obs.disconnect();
	}, [normalResults, aiResults, contents]);

	// Abort any active AI stream on unmount
	useEffect(() => {
		return () => {
			if (aiAbortRef.current) {
				aiAbortRef.current.abort();
				aiAbortRef.current = null;
			}
		};
	}, []);

	const findTopN = async (q: string) => {
		if (!q.trim()) return [] as string[];
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(
				`${backendUrl}/api/contents/search`,
				{
					input: q,
					isVector: false,
				},
				{
					headers: {
						Authorization: `Bearer ${localStorage.getItem(
							"access-token"
						)}`,
					},
				}
			);
			if (response.status === 200) {
				const responseData = response.data as ApiResponseData;
				// Normalize hits to an array of string ids. API may return
				// [{ id: '...' }, ...] or ['id1','id2']
				const hits = responseData.hits ?? [];
				const ids = hits.map((h: any) =>
					typeof h === "string" ? h : h && h.id ? h.id : String(h)
				);
				return ids as string[];
			} else {
				return [] as string[];
			}
		} catch (error) {
			console.error(error);
			return [] as string[];
		} finally {
		}
	};

	const aiAbortRef = useRef<AbortController | null>(null);

	const handleSearch = async (query: string, aiMode: boolean) => {
		if (!query.trim()) return;
		// mark that the user has performed a search with a non-empty query
		setHasSearched(true);
		setIsSearching(true);
		if (!aiMode) {
			const ids = await findTopN(query);
			setNormalResults(ids ?? []);
			setAiResults([]);
			setAiAnswer([]);
			setSearchedContents(ids ?? []);
			setIsSearching(false);
			return { ids };
		} else {
			// abort any previous AI stream
			if (aiAbortRef.current) {
				aiAbortRef.current.abort();
			}
			const controller = new AbortController();
			aiAbortRef.current = controller;

			setAiAnswer([]);
			setNormalResults([]);
			setAiResults([]);

			try {
				const backendUrl = import.meta.env.VITE_BACKEND_URL;
				const res = await fetch(`${backendUrl}/api/contents/search`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
						Accept: "text/event-stream",
						Authorization: `Bearer ${localStorage.getItem(
							"access-token"
						)}`,
					},
					body: JSON.stringify({ input: query, isVector: true }),
					signal: controller.signal,
				});

				if (!res.ok || !res.body) {
					console.error("AI search request failed", res.statusText);
					return { ids: [] };
				}

				const reader = res.body.getReader();
				const decoder = new TextDecoder();
				let buffer = "";
				let finalHits: string[] = [];
				let accStr = ""; // local accumulator for streamed text

				while (true) {
					const { done, value } = await reader.read();
					if (done) break;
					buffer += decoder.decode(value, { stream: true });

					// split complete SSE events using CRLF or LF double-newline separators
					const events = buffer.split(/\r?\n\r?\n/);
					// the last chunk might be an incomplete event - keep it in buffer
					buffer = events.pop() ?? "";

					for (const event of events) {
						const trimmed = event.trim();
						if (!trimmed) continue;

						// each event may contain multiple lines; collect 'data:' lines
						// and also include comment lines starting with ':' (don't drop them)
						const lines = event.split(/\r?\n/);
						const dataLines = lines
							.filter((l) => l.trim().startsWith("data:"))
							.map((l) => l.replace(/^data:\s?/, ""));
						const commentLines = lines
							.filter((l) => l.trim().startsWith(":"))
							.map((l) => l.replace(/^:\s?/, ""));
						// if there are no data: or comment lines, skip
						if (dataLines.length === 0 && commentLines.length === 0)
							continue;

						// prefer dataLines but append commentLines so comments are not ignored
						const dataStr = [...dataLines, ...commentLines]
							.join("\n")
							.trim();

						// handle sentinel values like [DONE] or plain 'done'
						if (
							dataStr === "[DONE]" ||
							dataStr.toLowerCase() === "done"
						) {
							// server indicated completion; continue until stream closes
							continue;
						}

						// Only attempt to parse JSON when the payload looks like JSON
						const looksLikeJSON =
							dataStr.startsWith("{") || dataStr.startsWith("[");
						if (looksLikeJSON) {
							try {
								const payload = JSON.parse(dataStr);
								if (payload?.type === "top_hits") {
									const hits = payload.hits ?? [];
									finalHits = hits.map((h: any) =>
										typeof h === "string"
											? h
											: h && h.id
											? h.id
											: String(h)
									);
									setAiResults(finalHits);
									setSearchedContents(finalHits);
								} else if (
									payload?.type === "chunk" ||
									payload?.text
								) {
									const text =
										payload.text ?? String(payload);
									accStr += text;
									setAiAnswer((prev) => [...prev, text]);
								} else if (payload?.type === "error") {
									console.error(
										"AI stream error",
										payload.detail
									);
								} else if (payload?.type === "done") {
									// server signalled done for this message
								}
							} catch (err) {
								// Failed to parse even though it looked like JSON — fall back to raw text
								const text = dataStr;
								accStr += text;
								setAiAnswer((prev) => [...prev, text]);
							}
						} else {
							// Not JSON — treat as raw streamed text (e.g., plain paragraphs)
							const text = dataStr;
							accStr += text;
							setAiAnswer((prev) => [...prev, text]);
						}
					}
				}

				// finished reading stream; if we have finalHits ensure state is set
				if (finalHits.length > 0) {
					setAiResults(finalHits);
					setSearchedContents(finalHits);
				}

				// return the ids and assembled answer (use local accumulator)
				setIsSearching(false);
				return { ids: finalHits, aiAnswer: accStr };
			} catch (err: any) {
				if (err.name === "AbortError") {
					// aborted by user - ignore
					setIsSearching(false);
					return { ids: [] };
				}
				console.error("AI search stream failed", err);
				setIsSearching(false);
				return { ids: [] };
			} finally {
				aiAbortRef.current = null;
			}
		}
	};

	// Helper: render streamed plain text into paragraphs and lists
	const renderFormattedAnswer = (text: string) => {
		if (!text) return <></>;

		// simple inline parser for **bold** segments
		const renderInline = (s: string) => {
			const nodes: any[] = [];
			let lastIndex = 0;
			const re = /\*\*(.+?)\*\*/g;
			let m: RegExpExecArray | null;
			let idx = 0;
			while ((m = re.exec(s)) !== null) {
				if (m.index > lastIndex)
					nodes.push(s.slice(lastIndex, m.index));
				nodes.push(<strong key={`b-${idx++}`}>{m[1]}</strong>);
				lastIndex = m.index + m[0].length;
			}
			if (lastIndex < s.length) nodes.push(s.slice(lastIndex));
			return nodes;
		};
		const lines = text.split(/\r?\n/);
		const blocks: Array<
			| { type: "p"; text: string }
			| { type: "ul"; items: string[] }
			| { type: "ol"; items: string[] }
		> = [];

		let cur: any = null;
		for (let raw of lines) {
			const line = raw.trim();
			if (line === "") {
				cur = null;
				continue;
			}

			const ulMatch = line.match(/^[*-]\s+(.+)$/);
			const olMatch = line.match(/^\d+\.\s+(.+)$/);

			if (ulMatch) {
				if (!cur || cur.type !== "ul") {
					cur = { type: "ul", items: [] };
					blocks.push(cur);
				}
				cur.items.push(ulMatch[1]);
				continue;
			} else if (olMatch) {
				if (!cur || cur.type !== "ol") {
					cur = { type: "ol", items: [] };
					blocks.push(cur);
				}
				cur.items.push(olMatch[1]);
				continue;
			} else {
				if (!cur || cur.type !== "p") {
					cur = { type: "p", text: line };
					blocks.push(cur);
				} else {
					cur.text += " " + line;
				}
			}
		}

		return (
			<>
				{blocks.map((b, i) => {
					if (b.type === "p")
						return <p key={i}>{renderInline(b.text)}</p>;
					if (b.type === "ul")
						return (
							<ul key={i}>
								{b.items.map((it: string, j: number) => (
									<li key={j}>{renderInline(it)}</li>
								))}
							</ul>
						);
					return (
						<ol key={i}>
							{b.items.map((it: string, j: number) => (
								<li key={j}>{renderInline(it)}</li>
							))}
						</ol>
					);
				})}
			</>
		);
	};

	return (
		<section className="w-full min-h-screen flex items-center justify-center py-8 px-4 sm:px-6">
			<div className="w-full max-w-7xl flex flex-col items-center">
				{/* Enhanced Searchbar Container */}
				<motion.div
					className="max-w-7xl w-full"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
				>
					<Searchbar onSearch={handleSearch} />
				</motion.div>

				{/* Enhanced Controls Section */}
				{(normalResults.length > 0 ||
					aiResults.length > 0 ||
					aiAnswer.length > 0) && (
					<motion.div
						className="w-full max-w-3xl flex justify-end mt-6"
						initial={{ opacity: 0, x: 20 }}
						animate={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.4, delay: 0.2 }}
					>
						<motion.button
							className="px-4 py-2 text-sm font-medium text-sky-600 dark:text-sky-300 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm border border-sky-200/60 dark:border-sky-700/60 rounded-xl shadow-md hover:shadow-lg hover:bg-sky-50/80 dark:hover:bg-gray-800/80 transition-all duration-200"
							onClick={() => {
								// abort any running AI request and clear UI
								if (aiAbortRef.current) {
									aiAbortRef.current.abort();
									aiAbortRef.current = null;
								}
								setNormalResults([]);
								setAiResults([]);
								setAiAnswer([]);
								setSearchedContents([]);
								setHasSearched(false);
								setIsSearching(false);
							}}
							whileHover={{ scale: 1.02 }}
							whileTap={{ scale: 0.98 }}
						>
							✨ Clear Results
						</motion.button>
					</motion.div>
				)}

				{/* Enhanced Results Section */}
				<motion.div
					className="w-full mt-8 sm:mt-12"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					{/* Loading State - only show when searching and no AI results yet */}
					{isSearching &&
						aiResults.length === 0 &&
						aiAnswer.length === 0 && (
							<motion.div
								className="w-full py-16 sm:py-20 rounded-2xl bg-gradient-to-br from-sky-50/80 to-blue-50/80 dark:from-sky-900/40 dark:to-blue-900/40 border border-sky-200/60 dark:border-sky-700/60 flex flex-col items-center justify-center text-center"
								initial={{ opacity: 0, scale: 0.95 }}
								animate={{ opacity: 1, scale: 1 }}
								transition={{ duration: 0.5 }}
							>
								<motion.div
									className="w-16 h-16 sm:w-20 sm:h-20 mb-6 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg"
									initial={{ scale: 0 }}
									animate={{ scale: 1 }}
									transition={{ delay: 0.2, type: "spring" }}
								>
									<motion.div
										className="w-8 h-8 border-3 border-white border-t-transparent rounded-full"
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Infinity,
											ease: "linear",
										}}
									/>
								</motion.div>
								<motion.div
									className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100 mb-3"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.3 }}
								>
									Searching...
								</motion.div>
								<motion.div
									className="max-w-md text-sm sm:text-base text-sky-700 dark:text-sky-300 px-4"
									initial={{ opacity: 0, y: 10 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ delay: 0.4 }}
								>
									Finding the best content for you
								</motion.div>
							</motion.div>
						)}

					{/* Enhanced Normal Results */}
					{!isSearching && normalResults.length > 0 ? (
						<motion.div
							className="w-full"
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
						>
							<motion.h3
								className="text-xl sm:text-2xl font-bold text-sky-900 dark:text-sky-100 mb-6 text-center"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
							>
								🔍 Search Results
							</motion.h3>
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
								{normalResults.map((id, index) => {
									const c = contents.find((x) => x.id === id);
									if (!c) return null;
									return (
										<motion.div
											key={id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												delay: index * 0.1,
												duration: 0.3,
											}}
										>
											<ContentCard content={c} />
										</motion.div>
									);
								})}
							</div>
						</motion.div>
					) : // Enhanced "No results" state - only show when search is complete
					!isSearching &&
					  hasSearched &&
					  normalResults.length === 0 &&
					  aiResults.length === 0 ? (
						<motion.div
							className="w-full py-16 sm:py-20 rounded-2xl bg-gradient-to-br from-sky-50/80 to-blue-50/80 dark:from-sky-900/40 dark:to-blue-900/40 border-2 border-dashed border-sky-200/60 dark:border-sky-700/60 flex flex-col items-center justify-center text-center shadow-inner"
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ duration: 0.5 }}
						>
							<motion.div
								className="w-16 h-16 sm:w-20 sm:h-20 mb-6 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg"
								initial={{ scale: 0 }}
								animate={{ scale: 1 }}
								transition={{ delay: 0.2, type: "spring" }}
							>
								<span className="text-2xl sm:text-3xl">🔍</span>
							</motion.div>
							<motion.div
								className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100 mb-3"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.3 }}
							>
								No results found
							</motion.div>
							<motion.div
								className="max-w-md text-sm sm:text-base text-sky-700 dark:text-sky-300 px-4"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.4 }}
							>
								Try adjusting your search terms or browse your
								saved content instead.
							</motion.div>
						</motion.div>
					) : null}

					{/* Enhanced AI Results + Streaming Answer - show immediately when AI starts responding */}
					{(aiResults.length > 0 || aiAnswer.length > 0) && (
						<motion.div
							className="w-full mt-8 sm:mt-12"
							initial={{ opacity: 0, y: 30 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6 }}
						>
							<motion.h3
								className="text-xl sm:text-2xl font-bold text-sky-900 dark:text-sky-100 mb-6 text-center"
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.1 }}
							>
								🤖 AI-Powered Results
							</motion.h3>

							{/* Enhanced AI Answer Box - Moved Above */}
							<motion.div
								className="p-6 sm:p-8 bg-gradient-to-br from-white/80 to-sky-50/80 dark:from-gray-900/80 dark:to-sky-900/40 backdrop-blur-sm border border-sky-200/60 dark:border-sky-700/60 rounded-2xl shadow-lg mb-8"
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ delay: 0.2 }}
							>
								<motion.div
									className="flex items-center gap-3 mb-4"
									initial={{ opacity: 0, x: -10 }}
									animate={{ opacity: 1, x: 0 }}
									transition={{ delay: 0.3 }}
								>
									<div className="w-8 h-8 rounded-full bg-gradient-to-r from-sky-500 to-blue-600 flex items-center justify-center shadow-md">
										<span className="text-white text-sm font-bold">
											AI
										</span>
									</div>
									<h4 className="text-lg sm:text-xl font-bold text-sky-900 dark:text-sky-100">
										AI Analysis
									</h4>
								</motion.div>

								<motion.div
									className="prose prose-sm sm:prose-base dark:prose-invert max-w-none text-gray-800 dark:text-gray-200"
									initial={{ opacity: 0 }}
									animate={{ opacity: 1 }}
									transition={{ delay: 0.4 }}
								>
									{aiAnswer.length === 0 ? (
										<motion.div
											className="flex items-center gap-3 text-sky-600 dark:text-sky-400"
											initial={{ opacity: 0 }}
											animate={{ opacity: 1 }}
										>
											<motion.div
												className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full"
												animate={{ rotate: 360 }}
												transition={{
													duration: 1,
													repeat: Infinity,
													ease: "linear",
												}}
											/>
											<span className="font-medium">
												AI is analyzing your content...
											</span>
										</motion.div>
									) : (
										// render formatted answer (handles lists and paragraphs)
										<div className="text-gray-800 dark:text-gray-200">
											{renderFormattedAnswer(
												aiAnswer.join("")
											)}
										</div>
									)}
								</motion.div>
							</motion.div>

							{/* AI Results Grid - Moved Below */}
							<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
								{aiResults.map((id, index) => {
									const c = contents.find((x) => x.id === id);
									if (!c) return null;
									return (
										<motion.div
											key={id}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{
												delay: index * 0.1,
												duration: 0.3,
											}}
										>
											<ContentCard content={c} />
										</motion.div>
									);
								})}
							</div>
						</motion.div>
					)}
				</motion.div>
			</div>

			{/* Enhanced Fixed Scroll Arrow */}
			{showArrow && (
				<motion.div
					className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					exit={{ opacity: 0, y: 20 }}
				>
					<motion.button
						aria-label="Show results"
						onClick={() => {
							const el = document.getElementById("content-list");
							if (el) {
								el.scrollIntoView({
									behavior: "smooth",
									block: "start",
								});
								// focus for a11y
								(el as HTMLElement).focus({
									preventScroll: true,
								});
							}
						}}
						className="p-3 rounded-full bg-gradient-to-br from-white/90 to-sky-50/90 dark:from-gray-800/90 dark:to-gray-900/90 backdrop-blur-sm shadow-lg border border-sky-200/50 dark:border-sky-700/50 text-sky-700 dark:text-sky-200 hover:shadow-xl transition-all duration-200"
						initial={{ y: 0 }}
						animate={{ y: [0, 8, 0] }}
						transition={{
							repeat: Infinity,
							duration: 2,
							ease: "easeInOut",
						}}
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						<svg
							className="w-6 h-6"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							strokeWidth="2"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</motion.button>
					<motion.div
						className="text-xs font-medium text-sky-600 dark:text-sky-300 mt-2 px-3 py-1 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full border border-sky-200/50 dark:border-sky-700/50 shadow-md"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.2 }}
					>
						📄 View contents
					</motion.div>
				</motion.div>
			)}
		</section>
	);
}
