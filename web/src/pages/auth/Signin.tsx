import { useEffect, useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import type { ApiResponseData, User } from "../../types/apiResponse";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router";

export default function Signin() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const setUser = useUserStore((state) => state.setUser);
	const navigate = useNavigate();

	useEffect(() => {
		const accessToken = localStorage.getItem("access-token");
		const userString = localStorage.getItem("user");
		if (accessToken && userString) {
			setUser(JSON.parse(userString));
			navigate("/dashboard");
		}
	}, []);

	const handleSignIn = async (e: FormEvent) => {
		e.preventDefault();
		setUsername("");
		setPassword("");
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(`${backendUrl}/auth/signin`, {
				username: username,
				email: email,
				password: password,
			});

			const responseData: ApiResponseData =
				response.data as ApiResponseData;
			if (response.status === 200) {
				const user: User = responseData.user as User;
				setUser(user);
				const token = responseData.access_token!;
				localStorage.setItem("access-token", token);
				localStorage.setItem("user", JSON.stringify(user));
				toast.success("User signed in.");
				navigate("/dashboard");
			} else {
				console.log("message:", responseData.message);
				toast.error("Error while signing in. Please try again.");
			}
		} catch (error) {
			console.error("error while signing: ", error);
			toast.error("Please try again.");
		} finally {
		}
	};

	const handleGoogleSignIn = (e: React.MouseEvent<HTMLButtonElement>) => {
		e.preventDefault();
		const backendUrl = import.meta.env.VITE_BACKEND_URL;
		window.location.href = `${backendUrl}/auth/google/login`;
	};

	return (
		<div className="min-h-screen min-w-screen dark:bg-slate-dark-1 bg-slate-8 text-slate-dark-1 dark:text-slate-1">
			<div>
				<div>
					<form onSubmit={handleSignIn}>
						<input
							type="text"
							placeholder="username"
							className="m-5 h-10 px-3"
							onChange={(e) => setUsername(e.target.value)}
						/>
						<input
							type="email"
							placeholder="email"
							className="m-5 h-10 px-3"
							onChange={(e) => setEmail(e.target.value)}
						/>
						<input
							type="password"
							placeholder="your password"
							className="m-5 h-10 px-3"
							onChange={(e) => setPassword(e.target.value)}
						/>
						<button type="submit">sign in</button>
					</form>
				</div>
				<div>
					<button
						onClick={handleGoogleSignIn}
						className="h-10 px-5 border rounded-xl"
					>
						sign in with google
					</button>
				</div>
			</div>
		</div>
	);
}
