import { create } from "zustand";

interface themeStore {
	theme: "light" | "dark";
	setTheme: (val: "light" | "dark") => void;
}

function getInitialTheme(): "dark" | "light" {
	const storedTheme = localStorage.getItem("theme");
	const prefersDark = window.matchMedia(
		"(prefers-color-scheme: dark)"
	).matches;

	let theme: "dark" | "light";
	if (storedTheme === "dark" || storedTheme === "light") {
		theme = storedTheme;
	} else {
		theme = prefersDark ? "dark" : "light";
	}
	if (theme === "dark") {
		document.documentElement.classList.add("dark");
	} else {
		document.documentElement.classList.remove("dark");
	}
	localStorage.setItem("theme", theme);
	return theme;
}

export const useThemeStore = create<themeStore>()((set) => ({
	theme: getInitialTheme(),
	setTheme: (val) => {
		localStorage.setItem("theme", val);
		document.documentElement.classList.toggle("dark", val === "dark");
		set(() => ({
			theme: val,
		}));
	},
}));
