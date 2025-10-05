import { motion } from "motion/react";
import { Button } from "../../ui/Button";
import Icon from "../../ui/Icon";
import {
	FaGithub,
	FaTwitter,
	FaLinkedin,
	FaDiscord,
	FaHeart,
	FaArrowUp,
} from "react-icons/fa";
import { HiOutlineExternalLink } from "react-icons/hi";

export default function Footer() {
	const scrollToTop = () => {
		window.scrollTo({ top: 0, behavior: "smooth" });
	};

	const currentYear = new Date().getFullYear();

	const footerSections = [
		{
			title: "Product",
			links: [
				{ name: "Features", href: "#features" },
				{ name: "Pricing", href: "#pricing" },
				{ name: "Documentation", href: "#docs" },
				{ name: "API", href: "#api" },
				{ name: "Changelog", href: "#changelog" },
			],
		},
		{
			title: "Company",
			links: [
				{ name: "About", href: "#about" },
				{ name: "Blog", href: "#blog" },
				{ name: "Careers", href: "#careers" },
				{ name: "Contact", href: "#contact" },
				{ name: "Press Kit", href: "#press" },
			],
		},
		{
			title: "Resources",
			links: [
				{ name: "Community", href: "#community" },
				{ name: "Help Center", href: "#help" },
				{ name: "Privacy Policy", href: "#privacy" },
				{ name: "Terms of Service", href: "#terms" },
				{ name: "Status", href: "#status", external: true },
			],
		},
		{
			title: "Developers",
			links: [
				{
					name: "GitHub",
					href: "https://github.com/whoisasx/Memora",
					external: true,
				},
				{ name: "API Docs", href: "#api-docs" },
				{ name: "SDKs", href: "#sdks" },
				{ name: "Integrations", href: "#integrations" },
				{ name: "Open Source", href: "#opensource" },
			],
		},
	];

	return (
		<footer className="relative bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-t border-gray-200/50 dark:border-gray-700/50">
			{/* Background gradient */}
			<div className="absolute inset-0 bg-gradient-to-br from-sky-50/50 via-white to-indigo-50/50 dark:from-gray-900/50 dark:via-gray-900 dark:to-indigo-950/50" />

			<div className="relative max-w-7xl mx-auto px-6 md:px-12 lg:px-20">
				{/* Newsletter Section */}
				<motion.div
					className="py-12 border-b border-gray-200/50 dark:border-gray-700/50"
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6 }}
				>
					<div className="max-w-2xl mx-auto text-center">
						<h3 className="text-2xl md:text-3xl font-bold mb-4">
							<span className="bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-200 dark:to-white bg-clip-text text-transparent">
								Stay in the loop
							</span>
						</h3>
						<p className="text-gray-600 dark:text-gray-300 mb-6">
							Get the latest updates, tips, and insights about
							knowledge management and productivity.
						</p>
						<div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
							<input
								type="email"
								placeholder="Enter your email"
								className="flex-1 px-4 py-3 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500/50 focus:border-sky-500/50 transition-all duration-200"
							/>
							<Button
								size="medium"
								level="primary"
								className="sm:px-8"
							>
								Subscribe
							</Button>
						</div>
					</div>
				</motion.div>

				{/* Main Footer Content */}
				<div className="py-12">
					<div className="grid lg:grid-cols-6 gap-8">
						{/* Brand Section */}
						<motion.div
							className="lg:col-span-2"
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.6, delay: 0.1 }}
						>
							<div className="space-y-4">
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 bg-gradient-to-br from-sky-500 to-indigo-600 rounded-lg flex items-center justify-center">
										<span className="text-white font-bold text-sm">
											M
										</span>
									</div>
									<span className="text-xl font-bold text-gray-900 dark:text-white">
										Memora
									</span>
								</div>
								<p className="text-gray-600 dark:text-gray-300 max-w-md">
									Transform how you think, connect, and
									visualize your ideas. Build your connected
									knowledge space with AI assistance.
								</p>

								{/* Social Links */}
								<div className="flex items-center gap-3 pt-2">
									{[
										{
											icon: FaGithub,
											href: "https://github.com/whoisasx/Memora",
											label: "GitHub",
										},
										{
											icon: FaTwitter,
											href: "https://x.com/whoisasx",
											label: "Twitter",
										},
										{
											icon: FaLinkedin,
											href: "https://linkedin.com",
											label: "LinkedIn",
										},
										{
											icon: FaDiscord,
											href: "https://discord.com",
											label: "Discord",
										},
									].map((social) => (
										<motion.a
											key={social.label}
											href={social.href}
											target="_blank"
											rel="noopener noreferrer"
											className="p-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:border-sky-300/50 dark:hover:border-sky-600/50 transition-all duration-200 group"
											whileHover={{ scale: 1.05 }}
											whileTap={{ scale: 0.95 }}
											aria-label={social.label}
										>
											<Icon className="text-gray-600 dark:text-gray-400 group-hover:text-sky-600 dark:group-hover:text-sky-400 transition-colors">
												<social.icon />
											</Icon>
										</motion.a>
									))}
								</div>
							</div>
						</motion.div>

						{/* Links Sections */}
						{footerSections.map((section, sectionIndex) => (
							<motion.div
								key={section.title}
								className="space-y-4"
								initial={{ opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{
									duration: 0.6,
									delay: 0.1 + (sectionIndex + 1) * 0.1,
								}}
							>
								<h4 className="font-semibold text-gray-900 dark:text-white">
									{section.title}
								</h4>
								<ul className="space-y-3">
									{section.links.map((link) => (
										<li key={link.name}>
											<a
												href={link.href}
												target={
													link.external
														? "_blank"
														: undefined
												}
												rel={
													link.external
														? "noopener noreferrer"
														: undefined
												}
												className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400 transition-colors duration-200 group"
											>
												<span>{link.name}</span>
												{link.external && (
													<Icon
														className="text-xs opacity-0 group-hover:opacity-100 transition-opacity"
														size={12}
													>
														<HiOutlineExternalLink />
													</Icon>
												)}
											</a>
										</li>
									))}
								</ul>
							</motion.div>
						))}
					</div>
				</div>

				{/* Bottom Section */}
				<motion.div
					className="py-6 border-t border-gray-200/50 dark:border-gray-700/50 flex flex-col md:flex-row items-center justify-between gap-4"
					initial={{ opacity: 0 }}
					whileInView={{ opacity: 1 }}
					viewport={{ once: true }}
					transition={{ duration: 0.6, delay: 0.8 }}
				>
					<div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
						<p className="flex items-center gap-1">
							© {currentYear} Memora. Made with
							<Icon className="text-red-500 mx-1" size={12}>
								<FaHeart />
							</Icon>
							for better thinking.
						</p>
					</div>

					{/* Back to Top Button */}
					<motion.button
						onClick={scrollToTop}
						className="flex items-center gap-2 px-4 py-2 bg-gray-100/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-lg border border-gray-200/30 dark:border-gray-700/30 hover:border-sky-300/50 dark:hover:border-sky-600/50 transition-all duration-200 group text-sm text-gray-600 dark:text-gray-400 hover:text-sky-600 dark:hover:text-sky-400"
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
					>
						<span>Back to top</span>
						<Icon
							className="group-hover:-translate-y-0.5 transition-transform"
							size={12}
						>
							<FaArrowUp />
						</Icon>
					</motion.button>
				</motion.div>
			</div>
		</footer>
	);
}
