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
		<div className="w-screen h-screen relative">
			<div className="flex h-10 w-40 md:w-60 px-2 justify-between py-2 border rounded-xl items-center absolute top-2 right-2">
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
						className="size-8"
					>
						<RiResetLeftFill />
					</Icon>
					{activeOptions ? (
						<Icon
							className="size-8"
							onClick={() => setActiveOptions(false)}
						>
							<AiOutlineClose />
						</Icon>
					) : (
						<Icon
							className="size-8"
							onClick={() => setActiveOptions((prev) => !prev)}
						>
							<LuSettings2 />
						</Icon>
					)}
				</div>

				<ThemeButton className="!w-8 !h-8" />
			</div>
			{activeOptions && <GraphOptions />}
			<svg width="100%" height="100%" className="absolute inset-0 -z-50">
				<defs>
					<pattern
						id="dots"
						x="0"
						y="0"
						width="50"
						height="50"
						patternUnits="userSpaceOnUse"
					>
						<circle cx="2" cy="2" r="1" fill="gray" />
					</pattern>
				</defs>
				<rect width="100%" height="100%" fill="url(#dots)" />
			</svg>
			<svg
				ref={svgRef}
				height={window.innerHeight}
				width={window.innerWidth}
			></svg>
		</div>
	);
}
