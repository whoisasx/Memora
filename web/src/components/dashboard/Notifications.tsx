import { AnimatePresence, motion } from "motion/react";
import { useDashboardStore } from "../../store/dashboardStore";
import { FiBell, FiCheck, FiTrash2 } from "react-icons/fi";
import { useState } from "react";
import Icon from "../../ui/Icon";

export default function Notifications() {
	const notifications = useDashboardStore((s) => s.notifications);
	const markAsRead = useDashboardStore((s) => s.markNotificationAsRead);
	const clearAll = useDashboardStore((s) => s.clearAllNotifications);

	const [hoveredNotification, setHoveredNotification] = useState<
		string | null
	>(null);

	const unreadCount = notifications.filter((n) => !n.read).length;

	const formatTimeAgo = (date: Date) => {
		const now = new Date();
		const notifDate = new Date(date);
		const diffInMinutes = Math.floor(
			(now.getTime() - notifDate.getTime()) / (1000 * 60)
		);

		if (diffInMinutes < 1) return "Just now";
		if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
		if (diffInMinutes < 1440)
			return `${Math.floor(diffInMinutes / 60)}h ago`;
		return `${Math.floor(diffInMinutes / 1440)}d ago`;
	};

	const getNotificationIcon = (type: string) => {
		switch (type) {
			case "success":
				return "✅";
			case "warning":
				return "⚠️";
			case "error":
				return "❌";
			case "info":
				return "ℹ️";
			default:
				return "🔔";
		}
	};

	return (
		<AnimatePresence>
			{notifications && notifications.length > 0 ? (
				<motion.div
					initial={{ opacity: 0, y: -12, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -8, scale: 0.96 }}
					transition={{
						duration: 0.25,
						ease: [0.16, 1, 0.3, 1],
					}}
					className="absolute right-2 sm:right-4 top-full mt-3 z-50 w-80 sm:w-96 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-sky-200/50 dark:border-sky-700/50 rounded-2xl shadow-2xl overflow-hidden"
					role="dialog"
					aria-label="Notifications panel"
				>
					{/* Header with glassmorphism effect */}
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-r from-sky-400/10 via-blue-400/5 to-indigo-400/10 dark:from-sky-600/20 dark:via-blue-600/10 dark:to-indigo-600/20" />
						<div className="relative px-6 py-4 flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="relative">
									<Icon
										size={20}
										className="text-sky-600 dark:text-sky-400"
									>
										<FiBell />
									</Icon>
									{unreadCount > 0 && (
										<motion.div
											initial={{ scale: 0 }}
											animate={{ scale: 1 }}
											className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-rose-500 to-pink-500 rounded-full"
										/>
									)}
								</div>
								<div>
									<h4 className="font-semibold text-sky-800 dark:text-sky-100">
										Notifications
									</h4>
									{unreadCount > 0 && (
										<p className="text-xs text-sky-600 dark:text-sky-400">
											{unreadCount} unread
										</p>
									)}
								</div>
							</div>
							<motion.button
								onClick={() => clearAll()}
								className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 hover:bg-sky-50 dark:hover:bg-sky-800/30 rounded-lg transition-all duration-200"
								whileHover={{ scale: 1.02 }}
								whileTap={{ scale: 0.98 }}
							>
								<Icon size={14} className="text-current">
									<FiTrash2 />
								</Icon>
								Clear all
							</motion.button>
						</div>
					</div>

					{/* Notifications List */}
					<div className="max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-sky-200 dark:scrollbar-thumb-sky-700 scrollbar-track-transparent">
						<div className="divide-y divide-sky-100/50 dark:divide-sky-800/50">
							{notifications.map((notification, index) => (
								<motion.div
									key={notification.id}
									initial={{ opacity: 0, x: -20 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: 20, scale: 0.95 }}
									transition={{ delay: index * 0.05 }}
									onHoverStart={() =>
										setHoveredNotification(notification.id)
									}
									onHoverEnd={() =>
										setHoveredNotification(null)
									}
									className={`relative px-6 py-4 transition-all duration-200 ${
										notification.read
											? "bg-transparent hover:bg-sky-25 dark:hover:bg-sky-900/10"
											: "bg-gradient-to-r from-sky-50/80 to-blue-50/50 dark:from-sky-900/30 dark:to-blue-900/20 hover:from-sky-100/80 hover:to-blue-100/60 dark:hover:from-sky-800/40 dark:hover:to-blue-800/30"
									}`}
								>
									{/* Unread indicator */}
									{!notification.read && (
										<div className="absolute left-2 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-sky-500 to-blue-500 rounded-full" />
									)}

									<div className="flex items-start gap-4">
										{/* Notification Icon */}
										<div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-800/50 dark:to-blue-800/50 flex items-center justify-center text-lg border border-sky-200/50 dark:border-sky-700/50">
											{getNotificationIcon(
												notification.type || "info"
											)}
										</div>

										{/* Content */}
										<div className="flex-1 min-w-0">
											<div className="flex items-start justify-between gap-2">
												<h5
													className={`font-medium text-sm leading-tight ${
														notification.read
															? "text-sky-700 dark:text-sky-300"
															: "text-sky-800 dark:text-sky-100"
													}`}
												>
													{notification.title}
												</h5>
												<span className="flex-shrink-0 text-xs text-sky-500 dark:text-sky-400 font-medium">
													{formatTimeAgo(
														notification.createdAt
													)}
												</span>
											</div>
											<p
												className={`text-sm mt-1 leading-relaxed ${
													notification.read
														? "text-sky-600 dark:text-sky-400"
														: "text-sky-700 dark:text-sky-200"
												}`}
											>
												{notification.message}
											</p>
										</div>
									</div>

									{/* Action Buttons */}
									<AnimatePresence>
										{hoveredNotification ===
											notification.id && (
											<motion.div
												initial={{ opacity: 0, y: 4 }}
												animate={{ opacity: 1, y: 0 }}
												exit={{ opacity: 0, y: 4 }}
												transition={{ duration: 0.15 }}
												className="flex items-center justify-end gap-2 mt-3"
											>
												{!notification.read && (
													<motion.button
														onClick={() =>
															markAsRead(
																notification.id
															)
														}
														className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-800/20 rounded-lg transition-all duration-200"
														whileHover={{
															scale: 1.02,
														}}
														whileTap={{
															scale: 0.98,
														}}
													>
														<Icon
															size={12}
															className="text-current"
														>
															<FiCheck />
														</Icon>
														Mark read
													</motion.button>
												)}
											</motion.div>
										)}
									</AnimatePresence>
								</motion.div>
							))}
						</div>
					</div>
				</motion.div>
			) : (
				<motion.div
					initial={{ opacity: 0, y: -12, scale: 0.96 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -8, scale: 0.96 }}
					transition={{
						duration: 0.25,
						ease: [0.16, 1, 0.3, 1],
					}}
					className="absolute right-2 sm:right-4 top-full mt-3 z-50 w-72 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg border border-sky-200/50 dark:border-sky-700/50 rounded-2xl shadow-2xl overflow-hidden"
				>
					{/* Empty State */}
					<div className="relative">
						<div className="absolute inset-0 bg-gradient-to-br from-sky-400/5 via-blue-400/5 to-indigo-400/10 dark:from-sky-600/10 dark:via-blue-600/5 dark:to-indigo-600/15" />
						<div className="relative px-6 py-8 text-center">
							<div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-sky-100 to-blue-100 dark:from-sky-800/50 dark:to-blue-800/50 flex items-center justify-center border border-sky-200/50 dark:border-sky-700/50">
								<motion.div
									animate={{
										rotate: [0, 10, -10, 0],
										scale: [1, 1.1, 1],
									}}
									transition={{
										duration: 2,
										repeat: Infinity,
										ease: "easeInOut",
									}}
									className="text-2xl"
								>
									🎉
								</motion.div>
							</div>
							<h4 className="font-semibold text-sky-800 dark:text-sky-100 mb-2">
								All caught up!
							</h4>
							<p className="text-sm text-sky-600 dark:text-sky-400">
								You have no new notifications
							</p>
						</div>
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
