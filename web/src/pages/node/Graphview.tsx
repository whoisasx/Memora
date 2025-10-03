import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import axios from "axios";
import { useDashboardStore } from "../../store/dashboardStore";
import { useAttributeStore, useNodeStore } from "../../store/nodeStore";
import { Graph } from "./graph/graph";
import GraphOptions from "./GraphOptions";
import type { Content } from "../../types/apiResponse";
import Icon from "../../ui/Icon";
import { RiResetLeftFill } from "react-icons/ri";
import { ThemeButton } from "../../components/dashboard/NavBar";
import { LuSettings2 } from "react-icons/lu";
import { AiOutlineClose } from "react-icons/ai";
import { AnimatePresence, motion } from "motion/react";
import AnimatedBackground from "../../components/background/AnimatedBackground";
import { useDebouncedCallback } from "../../hooks/debounceHook";

export default function Graphview() {
	const { setContents } = useDashboardStore();
	const { addLink, addNode, clear, data } = useNodeStore();
	const attributeStore = useAttributeStore();

	const [activeOptions, setActiveOptions] = useState(false);
	const [dimensions, setDimensions] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});

	const navigate = useNavigate();
	const svgRef = useRef<null | SVGSVGElement>(null);
	const graphRef = useRef<Graph | null>(null);

	// Debounced resize handler using custom hook
	const [debouncedResize] = useDebouncedCallback(() => {
		const newWidth = window.innerWidth;
		const newHeight = window.innerHeight;

		setDimensions((prev) => {
			// Only update if dimensions actually changed
			if (newWidth !== prev.width || newHeight !== prev.height) {
				// Update graph dimensions if graph exists
				if (graphRef.current) {
					graphRef.current.updateDimensions(newWidth, newHeight);
				}
				return { width: newWidth, height: newHeight };
			}
			return prev;
		});
	}, 300);

	useEffect(() => {
		window.addEventListener("resize", debouncedResize);
		return () => window.removeEventListener("resize", debouncedResize);
	}, [debouncedResize]);

	useEffect(() => {
		async function validateUser() {
			try {
				const accessToken = localStorage.getItem("access-token");

				const backendUrl = import.meta.env.VITE_BACKEND_URL;
				const validateResp = await axios.get(
					`${backendUrl}/auth/validate`,
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					}
				);
				if (validateResp.status !== 200 || !validateResp.data?.valid) {
					toast.error("Invalid token.");
					localStorage.removeItem("access-token");
					localStorage.removeItem("user");
					navigate("/signin");
					return;
				}
			} catch (err) {
				toast.error("Invalid token.");
				localStorage.removeItem("access-token");
				localStorage.removeItem("user");
				navigate("/signin");
				return;
			}
		}
		async function fetchContents() {
			const accessToken = localStorage.getItem("access-token");
			const userString = localStorage.getItem("user");

			if (!accessToken || !userString) {
				console.warn("No access token or user in localStorage");
				navigate("/signin");
				return;
			}

			const user = JSON.parse(userString);
			try {
				const backendUrl = import.meta.env.VITE_BACKEND_URL;
				const response = await axios.get(
					`${backendUrl}/contents?username=${user.username}`,
					{
						headers: { Authorization: `Bearer ${accessToken}` },
					}
				);

				if (response.status === 200) {
					const data = response.data;
					const serverContents: Content[] = data.contents || [];
					setContents(serverContents);
					clear();
					serverContents.forEach((content: Content) => {
						addNode(content.id);
						if (
							content["all-children"] &&
							content["all-children"].length > 0
						) {
							const children = content["all-children"];
							children.forEach((child: string) => {
								addLink({
									source: content.id,
									destination: child,
									target: child,
									value: Math.floor(Math.random() * 10) + 1,
								});
							});
						}
					});
				} else {
					console.warn("Unable to fetch contents", response.status);
				}
			} catch (err) {
				console.error(err);
			}
		}
		validateUser();
		fetchContents(); // Always fetch fresh contents
	}, [navigate, setContents, clear, addNode, addLink]);

	useEffect(() => {
		if (!svgRef.current || !data.nodes.length) return;

		// Clean up previous graph instance
		if (graphRef.current) {
			graphRef.current.destructor();
		}

		const graph = new Graph(
			data.nodes,
			data.links,
			data.degrees,
			dimensions.width,
			dimensions.height,
			svgRef.current
		);

		graphRef.current = graph;

		return () => {
			if (graphRef.current) {
				graphRef.current.destructor();
				graphRef.current = null;
			}
		};
	}, [data, dimensions]);

	return (
		<div className="w-screen h-screen relative bg-gradient-to-br from-sky-50 via-slate-50 to-sky-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-700 overflow-hidden">
			<AnimatedBackground />
			<div className="flex h-10 w-40 md:w-60 px-2 justify-between py-2 border border-sky-200 dark:border-sky-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl items-center absolute top-2 right-2 shadow-lg shadow-sky-500/20 dark:shadow-sky-400/10 z-50">
				<div className="flex h-full gap-2 items-center">
					<motion.div
						whileTap={{ scale: 0.9 }}
						whileHover={{ scale: 1.05 }}
						transition={{ duration: 0.1 }}
					>
						<Icon
							onClick={() => {
								attributeStore.setTextFade(0);
								attributeStore.setNodeSize(1.5);
								attributeStore.setLineThickness(1.0);
								attributeStore.setCenterForces(0.6);
								attributeStore.setRepelForces(10);
								attributeStore.setLinkForces(1.0);
								attributeStore.setLinkDistance(250);
							}}
							className="size-8 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-all duration-200 rounded-lg hover:bg-sky-100/50 dark:hover:bg-sky-800/30 p-1"
						>
							<RiResetLeftFill />
						</Icon>
					</motion.div>

					{/* Settings toggle with enhanced animation */}
					<AnimatePresence mode="wait">
						{activeOptions ? (
							<motion.div
								key="close"
								initial={{
									opacity: 0,
									scale: 0.8,
									rotate: -90,
								}}
								animate={{ opacity: 1, scale: 1, rotate: 0 }}
								exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
								transition={{ duration: 0.2, ease: "backOut" }}
							>
								<Icon
									className="size-8 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-all duration-200 rounded-lg hover:bg-sky-100/50 dark:hover:bg-sky-800/30 p-1"
									onClick={() => setActiveOptions(false)}
								>
									<AiOutlineClose />
								</Icon>
							</motion.div>
						) : (
							<motion.div
								key="settings"
								initial={{
									opacity: 0,
									scale: 0.8,
									rotate: -90,
								}}
								animate={{ opacity: 1, scale: 1, rotate: 0 }}
								exit={{ opacity: 0, scale: 0.8, rotate: 90 }}
								transition={{ duration: 0.2, ease: "backOut" }}
							>
								<Icon
									className="size-8 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-all duration-200 rounded-lg hover:bg-sky-100/50 dark:hover:bg-sky-800/30 p-1"
									onClick={() =>
										setActiveOptions((prev) => !prev)
									}
								>
									<LuSettings2 />
								</Icon>
							</motion.div>
						)}
					</AnimatePresence>
				</div>

				<ThemeButton className="!w-8 !h-8" />
			</div>

			{/* Enhanced options panel */}
			<AnimatePresence>
				{activeOptions && (
					<motion.div
						initial={{ opacity: 0, y: -10, scale: 0.95 }}
						animate={{ opacity: 1, y: 0, scale: 1 }}
						exit={{ opacity: 0, y: -10, scale: 0.95 }}
						transition={{ duration: 0.2, ease: "backOut" }}
					>
						<GraphOptions />
					</motion.div>
				)}
			</AnimatePresence>

			{/* Enhanced SVG container */}
			<div className="relative z-20 overflow-hidden rounded-lg">
				<svg
					ref={svgRef}
					height={dimensions.height}
					width={dimensions.width}
					className="relative z-20"
					style={{
						filter: "drop-shadow(0 0 20px rgba(14, 165, 233, 0.1))",
					}}
				></svg>
			</div>
		</div>
	);
}
