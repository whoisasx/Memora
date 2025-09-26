// src/pages/auth/Callback.tsx
import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUserStore } from "../../store/userStore";
import type { User } from "../../types/apiResponse";

export default function Callback() {
	const navigate = useNavigate();
	const setUser = useUserStore((state) => state.setUser);

	useEffect(() => {
		const params = new URLSearchParams(window.location.search);
		console.log(params);
		const token = params.get("token");
		const username = params.get("username");
		const email = params.get("email");
		const fullname = params.get("fullname");

		if (token) {
			localStorage.setItem("access-token", token);
			const user: User = {
				username: username!,
				email: email ?? undefined,
				fullname: fullname ?? undefined,
				authenticated: true,
			};
			setUser(user);
			localStorage.setItem("user", JSON.stringify(user));
			navigate("/dashboard");
		} else {
			if (localStorage.getItem("access-token")) navigate("/dashboard");
			else navigate("/");
		}
	}, [navigate]);

	return <div>Signing you in...</div>;
}
