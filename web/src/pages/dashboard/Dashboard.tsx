import { useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router";
import axios from "axios";
import { useDashboardStore } from "../../store/dashboardStore";
import type { ApiResponseData, User } from "../../types/apiResponse";
import Navbar from "../../components/dashboard/NavBar";
import SearchSection from "../../components/dashboard/SearchSection";
import ContentBox from "../../components/contents/ContentBox";

export default function Dashboard() {
	const { setContents } = useDashboardStore();
	const navigate = useNavigate();

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
				const backendUrl = import.meta.env.VITE_BACKEND_URL;
				const response = await axios.get(
					`${backendUrl}/contents?username=${user.username}`,
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
				} else if (response.status === 401) {
					toast.error("Invalid token.");
					navigate("/signin");
				} else {
					toast.error("Bad request.");
				}
			} catch (error) {
				toast.error(
					"Error occured while getting the data. Please reload."
				);
			} finally {
			}
		}
		fetchContents();
	}, []);

	return (
		<div className="min-w-screen min-h-screen px-20 py-10 dark:bg-gray-950 text-black dark:text-white font-firacode">
			<Navbar />
			<SearchSection />
			<ContentBox />
		</div>
	);
}
