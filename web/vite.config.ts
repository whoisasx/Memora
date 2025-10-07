import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import tailwindcss from "@tailwindcss/vite";

// https://vite.dev/config/
export default defineConfig({
	plugins: [react(), tailwindcss()],
	preview: {
		host: true,
		port: 4173,
		allowedHosts: ["memora.asxcode.com", "localhost", "127.0.0.1"],
	},
	server: {
		host: true,
		port: 5173,
	},
});
