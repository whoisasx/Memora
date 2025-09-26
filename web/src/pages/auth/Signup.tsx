import { useState, type FormEvent } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import type { ApiResponseData, User } from "../../types/apiResponse";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router";

export default function Signup() {
	const [username, setUsername] = useState("");
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [fullname, setFullname] = useState("");

	const setUser = useUserStore((state) => state.setUser);
	const navigate = useNavigate();

	const handleSignIn = async (e: FormEvent) => {
		e.preventDefault();
		setUsername("");
		setPassword("");
		setEmail("");
		setFullname("");
		try {
			const backendUrl = import.meta.env.VITE_BACKEND_URL;
			const response = await axios.post(`${backendUrl}/auth/signup`, {
				username: username,
				email: email.length > 0 ? email : undefined,
				password: password,
				fullname: fullname.length > 0 ? fullname : undefined,
			});

			const responseData: ApiResponseData =
				response.data as ApiResponseData;
			if (response.status === 201) {
				const user: User = responseData.user as User;
				setUser(user);
				const token = responseData.access_token!;
				localStorage.setItem("access-token", token);
				localStorage.setItem("user", JSON.stringify(user));
				toast.success("User signed up.");
				navigate("/dashboard");
			} else if (response.status === 400) {
				toast.error("user already registered. please sign in.");
			} else {
				console.log("message:", responseData.message);
				toast.error("Error while signing up. Please try again.");
			}
		} catch (error) {
			console.error("error while signing up: ", error);
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
							placeholder="fullname"
							className="m-5 h-10 px-3"
							onChange={(e) => setFullname(e.target.value)}
						/>
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
						<button type="submit">sign up</button>
					</form>
				</div>
				<div>
					<button
						onClick={handleGoogleSignIn}
						className="h-10 px-5 border rounded-xl"
					>
						sign up with google
					</button>
				</div>
			</div>
		</div>
	);
}
