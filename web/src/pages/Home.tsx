import HomeBackground from "../components/background/HomeBackground";
import Footer from "../components/home/Footer";
import HeroSection from "../components/home/HeroSection";
import Navbar from "../components/home/Navbar";
import { useThemeStore } from "../store/themeStore";
import { motion } from "motion/react";
import Icon from "../ui/Icon";
import { HiSun, HiMoon } from "react-icons/hi";

export default function Home() {
	const { theme, setTheme } = useThemeStore();

	return (
		<div className="min-h-screen min-w-screen relative text-black dark:text-white">
			<HomeBackground />
			<Navbar />
			<HeroSection />
			<div id="contact"></div>
			<Footer />
			{/* Theme Toggle - Fixed in top right corner */}
			<motion.div
				className="fixed top-11 right-4 z-[999]"
				initial={{ opacity: 0, scale: 0.8 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5, delay: 0.5 }}
			>
				<motion.button
					onClick={() =>
						setTheme(theme === "light" ? "dark" : "light")
					}
					className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center group"
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.95 }}
					transition={{ type: "spring", stiffness: 400, damping: 17 }}
				>
					<motion.div
						animate={{
							rotate: theme === "light" ? 0 : 180,
						}}
						transition={{
							duration: 0.5,
							ease: [0.4, 0, 0.2, 1],
						}}
					>
						{theme === "light" ? (
							<Icon className="text-orange-500 group-hover:text-orange-600 transition-colors duration-200">
								<HiSun />
							</Icon>
						) : (
							<Icon className="text-blue-400 group-hover:text-blue-500 transition-colors duration-200">
								<HiMoon />
							</Icon>
						)}
					</motion.div>
				</motion.button>
			</motion.div>
		</div>
	);
}
