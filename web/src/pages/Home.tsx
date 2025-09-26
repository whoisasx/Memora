import { useThemeStore } from "../store/themeStore";
import { useNavigate } from "react-router";

export default function Home() {
	const { theme, setTheme } = useThemeStore();
	const navigate = useNavigate();

	return (
		<div className="min-h-screen min-w-screen bg-slate-4 dark:bg-slate-dark-4">
			<div>
				<button
					onClick={() =>
						setTheme(theme === "light" ? "dark" : "light")
					}
					className="h-10 px-5 rounded-2xl border m-5 bg-ruby-1 dark:bg-ruby-dark-3 text-slate-dark-1 dark:text-slate-1"
				>
					change to {theme === "dark" ? "light" : "dark"}
				</button>
			</div>
			<div className="mx-5 px-10 w-auto border rounded-xl">
				<button
					onClick={() => navigate("/signin")}
					className="h-10 px-5 rounded-2xl border m-5"
				>
					signin
				</button>
				<button
					onClick={() => navigate("/signup")}
					className="h-10 px-5 rounded-2xl border m-5"
				>
					signup
				</button>
				<button
					onClick={() => navigate("/dashboard")}
					className="h-10 px-5 rounded-2xl border m-5"
				>
					dashboard
				</button>
			</div>
		</div>
	);
}
