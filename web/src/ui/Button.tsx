import React, { useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

type Size = "small" | "medium" | "large";
type Level = "primary" | "secondary" | "tertiary" | "danger" | "success";
type ButtonState = "idle" | "loading" | "success" | "error";

interface IButton {
	children: ReactNode;
	className?: string;
	size?: Size;
	level?: Level;
	onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
	ariaLabel?: string;
	loading?: boolean;
	state?: ButtonState;
	icon?: ReactNode;
	iconPosition?: "left" | "right";
}

const sizeProps: Record<Size, string> = {
	small: "px-4 py-1.5 text-sm rounded-lg min-h-[32px]",
	medium: "px-6 py-2 text-sm rounded-xl min-h-[40px]",
	large: "px-8 py-2.5 text-base rounded-xl min-h-[48px]",
};

const levelProps: Record<Level, string> = {
	primary:
		"bg-gradient-to-br from-sky-500 via-blue-600 to-indigo-700 hover:from-sky-600 hover:via-blue-700 hover:to-indigo-800 text-white shadow-lg hover:shadow-xl border-transparent relative overflow-hidden",
	secondary:
		"bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-900/50 dark:to-blue-900/50 text-sky-700 dark:text-sky-200 border border-sky-200/50 dark:border-sky-700/50 hover:from-sky-100 hover:to-blue-100 dark:hover:from-sky-800/50 dark:hover:to-blue-800/50 shadow-md hover:shadow-lg relative overflow-hidden backdrop-blur-sm",
	tertiary:
		"bg-white/60 dark:bg-gray-900/60 text-sky-700 dark:text-sky-200 border border-sky-200/30 dark:border-sky-700/30 hover:bg-white/80 dark:hover:bg-gray-800/80 shadow-sm hover:shadow-md relative overflow-hidden backdrop-blur-sm",
	danger: "bg-gradient-to-br from-red-500 via-red-600 to-red-700 hover:from-red-600 hover:via-red-700 hover:to-red-800 text-white shadow-lg hover:shadow-xl border-transparent relative overflow-hidden",
	success:
		"bg-gradient-to-br from-green-500 via-emerald-600 to-green-700 hover:from-green-600 hover:via-emerald-700 hover:to-green-800 text-white shadow-lg hover:shadow-xl border-transparent relative overflow-hidden",
};

const disabledClass = "opacity-50 cursor-not-allowed pointer-events-none";

const LoadingSpinner = ({ size }: { size: Size }) => {
	const spinnerSize =
		size === "small"
			? "w-4 h-4"
			: size === "medium"
			? "w-5 h-5"
			: "w-6 h-6";

	return (
		<motion.div
			className={`${spinnerSize} border-2 border-current border-t-transparent rounded-full`}
			animate={{ rotate: 360 }}
			transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
		/>
	);
};

const SuccessIcon = ({ size }: { size: Size }) => {
	const iconSize =
		size === "small"
			? "w-4 h-4"
			: size === "medium"
			? "w-5 h-5"
			: "w-6 h-6";

	return (
		<motion.svg
			className={iconSize}
			fill="none"
			viewBox="0 0 24 24"
			stroke="currentColor"
			initial={{ scale: 0, rotate: -180 }}
			animate={{ scale: 1, rotate: 0 }}
			transition={{ type: "spring", stiffness: 300, damping: 20 }}
		>
			<path
				strokeLinecap="round"
				strokeLinejoin="round"
				strokeWidth={2}
				d="M5 13l4 4L19 7"
			/>
		</motion.svg>
	);
};

export const Button = ({
	children,
	className = "",
	size = "medium",
	level = "primary",
	onClick,
	type = "button",
	disabled = false,
	ariaLabel,
	loading = false,
	state = "idle",
	icon,
	iconPosition = "left",
}: IButton) => {
	const base = `${sizeProps[size]} ${levelProps[level]} flex items-center justify-center gap-2 transition-all duration-300 ease-out font-medium relative overflow-hidden focus:outline-none focus:ring-4 focus:ring-sky-500/20 dark:focus:ring-sky-400/20`;

	// Enhanced hover and interaction states
	const [isHover, setIsHover] = useState(false);

	// Enhanced ripples with better positioning and animation
	const [ripples, setRipples] = useState<
		{ id: number; x: number; y: number; size: number }[]
	>([]);
	const btnRef = useRef<HTMLButtonElement | null>(null);
	const nextId = useRef(0);

	// Handle state changes for success animation
	React.useEffect(() => {
		if (state === "success") {
			const timer = setTimeout(() => {
				// Reset state could be handled by parent component
			}, 2000);
			return () => clearTimeout(timer);
		}
	}, [state]);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (disabled || loading) return;

		// Enhanced ripple effect with dynamic sizing
		const rect = btnRef.current?.getBoundingClientRect();
		const x = rect ? e.clientX - rect.left : 0;
		const y = rect ? e.clientY - rect.top : 0;
		const size = rect ? Math.max(rect.width, rect.height) : 100;
		const id = nextId.current++;

		setRipples((r) => [...r, { id, x, y, size }]);

		// Enhanced cleanup timing
		window.setTimeout(
			() => setRipples((r) => r.filter((p) => p.id !== id)),
			600
		);

		if (onClick) onClick(e);
	};

	return (
		<motion.button
			ref={btnRef}
			type={type}
			aria-label={ariaLabel}
			disabled={disabled || loading}
			className={`${base} ${
				disabled || loading ? disabledClass : "cursor-pointer"
			} ${className}`}
			onClick={handleClick}
			onHoverStart={() => setIsHover(true)}
			onHoverEnd={() => setIsHover(false)}
			whileHover={
				!disabled && !loading
					? {
							scale: 1.02,
							y: -1,
							transition: { duration: 0.15, ease: "easeOut" },
					  }
					: {}
			}
			whileTap={
				!disabled && !loading
					? {
							scale: 0.98,
							y: 0,
							transition: { duration: 0.1, ease: "easeInOut" },
					  }
					: {}
			}
			initial={{ opacity: 0, y: 8, scale: 0.95 }}
			animate={{
				opacity: 1,
				y: 0,
				scale: 1,
				...(state === "success" && { scale: [1, 1.05, 1] }),
			}}
			transition={{
				duration: 0.25,
				type: "spring",
				stiffness: 260,
				damping: 20,
			}}
		>
			{/* Enhanced shimmer effect */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0"
				initial={{ x: "-100%", opacity: 0 }}
				animate={
					isHover && !disabled && !loading
						? { x: "100%", opacity: 1 }
						: { x: "-100%", opacity: 0 }
				}
				transition={{ duration: 0.6, ease: "easeInOut" }}
				style={{ pointerEvents: "none" }}
			/>

			{/* Enhanced glow effect for primary buttons */}
			{level === "primary" && !disabled && !loading && (
				<motion.div
					className="absolute inset-0 bg-gradient-to-r from-sky-400/0 via-blue-400/30 to-indigo-400/0 opacity-0 blur-xl"
					animate={
						isHover
							? { opacity: 1, scale: 1.1 }
							: { opacity: 0, scale: 1 }
					}
					transition={{ duration: 0.3 }}
					style={{ pointerEvents: "none" }}
				/>
			)}

			{/* Floating particles for primary buttons */}
			{level === "primary" && !disabled && !loading && (
				<>
					<motion.div
						className="absolute top-2 right-3 w-1 h-1 bg-white/80 rounded-full"
						initial={{ opacity: 0, scale: 0 }}
						animate={{
							scale: [0, 1, 0],
							opacity: [0, 1, 0],
							x: [0, 10, 0],
							y: [0, -5, 0],
						}}
						transition={{
							duration: 2.5,
							repeat: Infinity,
							delay: 0.5,
							ease: "easeInOut",
						}}
						style={{ pointerEvents: "none" }}
					/>
					<motion.div
						className="absolute bottom-3 left-4 w-1 h-1 bg-white/80 rounded-full"
						initial={{ opacity: 0, scale: 0 }}
						animate={{
							scale: [0, 1, 0],
							opacity: [0, 1, 0],
							x: [0, -8, 0],
							y: [0, 3, 0],
						}}
						transition={{
							duration: 2.5,
							repeat: Infinity,
							delay: 1.2,
							ease: "easeInOut",
						}}
						style={{ pointerEvents: "none" }}
					/>
					<motion.div
						className="absolute top-1/2 left-2 w-0.5 h-0.5 bg-white/60 rounded-full"
						initial={{ opacity: 0, scale: 0 }}
						animate={{
							scale: [0, 1, 0],
							opacity: [0, 1, 0],
							x: [0, 15, 0],
							y: [0, -10, 0],
						}}
						transition={{
							duration: 3,
							repeat: Infinity,
							delay: 2,
							ease: "easeInOut",
						}}
						style={{ pointerEvents: "none" }}
					/>
				</>
			)}

			{/* Content with enhanced layout */}
			<motion.div
				className="relative z-10 flex items-center justify-center gap-2"
				animate={
					loading
						? { opacity: 0.7 }
						: state === "success"
						? { scale: [1, 1.05, 1] }
						: { opacity: 1 }
				}
				transition={{ duration: 0.2 }}
			>
				{/* Icon support */}
				{icon &&
					iconPosition === "left" &&
					!loading &&
					state !== "success" && (
						<motion.span
							className="flex items-center"
							initial={{ opacity: 0, x: -10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
						>
							{icon}
						</motion.span>
					)}

				{/* Loading state */}
				{loading && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						animate={{ opacity: 1, scale: 1 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{ duration: 0.2 }}
					>
						<LoadingSpinner size={size} />
					</motion.div>
				)}

				{/* Success state */}
				{state === "success" && (
					<motion.div
						initial={{ opacity: 0, scale: 0.8, rotate: -90 }}
						animate={{ opacity: 1, scale: 1, rotate: 0 }}
						exit={{ opacity: 0, scale: 0.8 }}
						transition={{
							type: "spring",
							stiffness: 300,
							damping: 20,
						}}
					>
						<SuccessIcon size={size} />
					</motion.div>
				)}

				{/* Button text */}
				{!loading && state !== "success" && (
					<motion.span
						className="select-none font-medium"
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						transition={{ delay: 0.05 }}
					>
						{children}
					</motion.span>
				)}

				{/* Success text override */}
				{state === "success" && (
					<motion.span
						className="select-none font-medium"
						initial={{ opacity: 0, y: 10 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: 0.1 }}
					>
						Success!
					</motion.span>
				)}

				{/* Right icon */}
				{icon &&
					iconPosition === "right" &&
					!loading &&
					state !== "success" && (
						<motion.span
							className="flex items-center"
							initial={{ opacity: 0, x: 10 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: 0.1 }}
						>
							{icon}
						</motion.span>
					)}
			</motion.div>

			{/* Enhanced ripple effects */}
			{ripples.map((r) => (
				<motion.span
					key={r.id}
					className="absolute rounded-full pointer-events-none"
					style={{
						left: r.x,
						top: r.y,
						width: 8,
						height: 8,
						translate: "-50% -50%",
						background:
							level === "primary" ||
							level === "danger" ||
							level === "success"
								? "rgba(255, 255, 255, 0.4)"
								: "rgba(59, 130, 246, 0.3)",
					}}
					initial={{ scale: 0, opacity: 0.8 }}
					animate={{
						scale: r.size / 8,
						opacity: 0,
					}}
					transition={{
						duration: 0.6,
						ease: "easeOut",
						opacity: { duration: 0.4 },
					}}
				/>
			))}
		</motion.button>
	);
};
