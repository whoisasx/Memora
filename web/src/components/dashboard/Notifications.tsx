import { AnimatePresence, motion } from "motion/react";
import { useDashboardStore } from "../../store/dashboardStore";
import { FiX } from "react-icons/fi";

export default function Notifications() {
	const notifications = useDashboardStore((s) => s.notifications);
	const markAsRead = useDashboardStore((s) => s.markNotificationAsRead);
	const clearAll = useDashboardStore((s) => s.clearAllNotifications);

	return (
		<AnimatePresence>
			{notifications && notifications.length > 0 && (
				<motion.div
					initial={{ opacity: 0, y: -8, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -6, scale: 0.98 }}
					transition={{ duration: 0.18, ease: "easeOut" }}
					className="absolute right-2 top-full mt-2 z-30 w-80 bg-white dark:bg-gray-800 border border-sky-100 dark:border-sky-800 rounded-lg shadow-lg"
					role="dialog"
				>
					<div className="p-3 flex items-center justify-between">
						<h4 className="font-semibold text-sky-800 dark:text-sky-100">
							Notifications
						</h4>
						<button
							onClick={() => clearAll()}
							className="text-xs text-sky-600 dark:text-sky-300 hover:underline"
						>
							Clear all
						</button>
					</div>

					<div className="max-h-64 overflow-y-auto divide-y divide-sky-100 dark:divide-sky-800">
						{notifications.map((n) => (
							<div
								key={n.id}
								className={`p-3 flex items-start gap-3 ${
									n.read
										? "bg-transparent"
										: "bg-sky-50 dark:bg-sky-900/20"
								}`}
							>
								<div className="flex-1">
									<div className="flex items-center justify-between">
										<div className="font-medium text-sky-800 dark:text-sky-100">
											{n.title}
										</div>
										<div className="text-xs text-sky-500 dark:text-sky-300">
											{new Date(
												n.createdAt
											).toLocaleString()}
										</div>
									</div>
									<div className="text-sm text-sky-700 dark:text-sky-300 mt-1">
										{n.message}
									</div>
								</div>
								<div className="flex flex-col gap-2">
									{!n.read && (
										<button
											onClick={() => markAsRead(n.id)}
											className="text-xs text-emerald-600 dark:text-emerald-400"
										>
											Mark read
										</button>
									)}
									<button
										onClick={() => {}}
										className="text-xs text-sky-500 dark:text-sky-300"
									>
										<FiX />
									</button>
								</div>
							</div>
						))}
					</div>
				</motion.div>
			)}
			{notifications.length === 0 && (
				<motion.div
					initial={{ opacity: 0, y: -8, scale: 0.98 }}
					animate={{ opacity: 1, y: 0, scale: 1 }}
					exit={{ opacity: 0, y: -6, scale: 0.98 }}
					transition={{ duration: 0.18, ease: "easeOut" }}
					className="absolute right-2 top-full mt-2 z-30 w-60 bg-white dark:bg-gray-800 border border-sky-100 dark:border-sky-800 rounded-lg shadow-lg p-3"
				>
					<div className="text-sky-800 dark:text-sky-100">
						You're all caught up 🎉
					</div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
