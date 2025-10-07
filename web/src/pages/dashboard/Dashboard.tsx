import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import axios from "axios";
import { useDashboardStore } from "../../store/dashboardStore";
import type { ApiResponseData, User } from "../../types/apiResponse";
import Navbar from "../../components/dashboard/NavBar";
import SearchSection from "../../components/dashboard/SearchSection";
import Background from "../../components/dashboard/Background";
import ContentBox from "../../components/contents/ContentBox";
import CreateContentModal from "../../components/contents/CreateContentModal";
import { useNodeStore } from "../../store/nodeStore";

export default function Dashboard() {
	const { setContents } = useDashboardStore();
	const { clear, addNode, addLink } = useNodeStore();
	const navigate = useNavigate();

	// Set document title for browser tab
	useEffect(() => {
		document.title = "Dashboard | Memora - Your Second Brain";
		return () => {
			document.title =
				"Memora | your second brain: tag, connect, visualize, and chat with your knowledge.";
		};
	}, []);

	useEffect(() => {
		const accessToken = localStorage.getItem("access-token");
		const userString = localStorage.getItem("user");

		if (!accessToken || !userString) {
			toast.error("User not logged in.");
			navigate("/signin");
			return;
		}

		const user = JSON.parse(userString) as User;

		async function fetchContents() {
			try {
				// First validate the token with the backend
				const backendUrl = import.meta.env.VITE_BACKEND_URL;
				try {
					const validateResp = await axios.get(
						`${backendUrl}/api/auth/validate`,
						{
							headers: { Authorization: `Bearer ${accessToken}` },
						}
					);
					if (
						validateResp.status !== 200 ||
						!validateResp.data?.valid
					) {
						toast.error("Session expired. Please sign in again.");
						localStorage.removeItem("access-token");
						localStorage.removeItem("user");
						navigate("/signin");
						return;
					}
				} catch (err) {
					// treat any error as invalid token
					console.error("Token validation error:", err);
					toast.error("Session expired. Please sign in again.");
					localStorage.removeItem("access-token");
					localStorage.removeItem("user");
					navigate("/signin");
					return;
				}

				const response = await axios.get(
					`/api/contents/?username=${user.username}`,
					{
						headers: {
							Authorization: `Bearer ${accessToken}`,
						},
					}
				);

				const responseData: ApiResponseData =
					response.data as ApiResponseData;
				if (response.status === 200) {
					const contents = responseData.contents!;
					setContents(contents);
					clear();
					contents.forEach((content) => {
						addNode(content.id);
						if (
							content["all-children"] &&
							content["all-children"].length > 0
						) {
							const children = content["all-children"];
							children.forEach((child) => {
								addLink({
									source: content.id,
									destination: child,
									target: child,
									value: Math.floor(Math.random() * 10) + 1,
								});
							});
						}
					});
				} else if (response.status === 401) {
					toast.error("Session expired. Please sign in again.");
					localStorage.removeItem("access-token");
					localStorage.removeItem("user");
					navigate("/signin");
				} else {
					toast.error("Bad request.");
				}
			} catch (error) {
				console.error("Fetch contents error:", error);
				// toast.error("Failed to load content. Please try again.");
				// Don't navigate to signin immediately for network errors
			}
		}

		fetchContents();
	}, [navigate, setContents, clear, addNode, addLink]);

	return (
		<div className="relative min-w-screen min-h-screen bg-gradient-to-br from-sky-100 via-slate-100 to-sky-150 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800">
			<Background />
			<Navbar />
			<main className="relative z-10 px-20 py-10 font-firacode scroll-none">
				<SearchSection />
				<ContentBox />
				<CreateContentModal />
			</main>
		</div>
	);
}
