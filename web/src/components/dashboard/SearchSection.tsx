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
				`${backendUrl}/contents/search`,
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
		if (!aiMode) {
			const ids = await findTopN(query);
			console.log("ids:", ids);
			setNormalResults(ids ?? []);
			setAiResults([]);
			setAiAnswer([]);
			setSearchedContents(ids ?? []);
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
				const res = await fetch(`${backendUrl}/contents/search`, {
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
									console.log("finalhits:", finalHits);
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
				return { ids: finalHits, aiAnswer: accStr };
			} catch (err: any) {
				if (err.name === "AbortError") {
					// aborted by user - ignore
					return { ids: [] };
				}
				console.error("AI search stream failed", err);
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
		<section className="w-full min-h-screen flex items-center justify-center py-6">
			<div className="w-full md:w-4/5 flex flex-col items-center">
				<Searchbar onSearch={handleSearch} />

				{/* controls: clear results / abort AI stream */}
				<div className="w-full flex justify-end mt-3">
					{(normalResults.length > 0 ||
						aiResults.length > 0 ||
						aiAnswer.length > 0) && (
						<button
							className="text-sm text-sky-600 dark:text-sky-300 px-3 py-1 border border-sky-200 dark:border-sky-800 rounded-md hover:bg-sky-50 dark:hover:bg-gray-800"
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
							}}
						>
							Clear results
						</button>
					)}
				</div>

				{/* placeholder spacing so the fixed arrow doesn't overlap */}
				<div className="h-6" />

				<div className="mt-6">
					{/* Normal results (top 5 ids) */}
					{normalResults.length > 0 ? (
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							{normalResults.map((id) => {
								const c = contents.find((x) => x.id === id);
								if (!c) return null;
								return <ContentCard key={id} content={c} />;
							})}
						</div>
					) : // only show "No results" after the user has performed a search
					// and there are no AI results to display
					hasSearched && aiResults.length === 0 ? (
						<div className="text-sm text-sky-500">No results</div>
					) : null}

					{/* AI results + streaming answer */}
					{aiResults.length > 0 && (
						<div className="mt-6">
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								{aiResults.map((id) => {
									const c = contents.find((x) => x.id === id);
									if (!c) return null;
									return <ContentCard key={id} content={c} />;
								})}
							</div>

							<div className="mt-4 p-4 bg-white/70 dark:bg-gray-900/60 border border-sky-100 dark:border-sky-800 rounded-md">
								<h4 className="font-semibold mb-2">
									AI Answer
								</h4>
								<div className="prose prose-sm dark:prose-invert">
									{aiAnswer.length === 0 ? (
										<div className="text-sky-500">
											Waiting for AI response...
										</div>
									) : (
										// render formatted answer (handles lists and paragraphs)
										renderFormattedAnswer(aiAnswer.join(""))
									)}
								</div>
							</div>
						</div>
					)}
				</div>
			</div>

			{/* fixed bottom-center arrow to scroll to content list — only visible when content is out of view */}
			{showArrow && (
				<div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 flex flex-col items-center">
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
						className="p-2 rounded-full bg-white/80 dark:bg-gray-800 shadow-md text-sky-700 dark:text-sky-200"
						initial={{ y: 0 }}
						animate={{ y: [0, 6, 0] }}
						transition={{
							repeat: Infinity,
							duration: 1.6,
							ease: "easeInOut",
						}}
					>
						<svg
							className="w-6 h-6"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
						>
							<path
								strokeWidth="2"
								strokeLinecap="round"
								strokeLinejoin="round"
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</motion.button>
					<div className="text-xs text-sky-600 dark:text-sky-200 mt-1">
						Scroll down to see content
					</div>
				</div>
			)}
		</section>
	);
}
