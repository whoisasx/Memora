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
import AnimatedBackground from "../../components/background/AnimatedBackground";

export default function Graphview() {
	const { setContents } = useDashboardStore();
	const { addLink, addNode, clear, data } = useNodeStore();
	const attributeStore = useAttributeStore();

	const [activeOptions, setActiveOptions] = useState(false);

	const navigate = useNavigate();
	const svgRef = useRef<null | SVGSVGElement>(null);

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

		const graph = new Graph(
			data.nodes,
			data.links,
			data.degrees,
			window.innerWidth,
			window.innerHeight,
			svgRef.current
		);

		return () => {
			graph.destructor();
		};
	}, [svgRef.current, data]);

	return (
		<div className="w-screen h-screen relative bg-gradient-to-br from-sky-50 to-sky-100 dark:from-slate-900 dark:to-slate-800">
			<AnimatedBackground />
			<div className="flex h-10 w-40 md:w-60 px-2 justify-between py-2 border border-sky-200 dark:border-sky-700 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl items-center absolute top-2 right-2 shadow-lg shadow-sky-500/20 dark:shadow-sky-400/10 z-50">
				<div className="flex h-full gap-2 items-center">
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
						className="size-8 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
					>
						<RiResetLeftFill />
					</Icon>
					{activeOptions ? (
						<Icon
							className="size-8 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
							onClick={() => setActiveOptions(false)}
						>
							<AiOutlineClose />
						</Icon>
					) : (
						<Icon
							className="size-8 text-sky-600 hover:text-sky-700 dark:text-sky-400 dark:hover:text-sky-300 transition-colors"
							onClick={() => setActiveOptions((prev) => !prev)}
						>
							<LuSettings2 />
						</Icon>
					)}
				</div>

				<ThemeButton className="!w-8 !h-8" />
			</div>
			{activeOptions && <GraphOptions />}
			<svg
				ref={svgRef}
				height={window.innerHeight}
				width={window.innerWidth}
				className="relative z-20"
			></svg>
		</div>
	);
}
