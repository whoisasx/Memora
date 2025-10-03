import React, { useRef, useState } from "react";
import type { ReactNode } from "react";
import { motion } from "motion/react";

type Size = "small" | "medium" | "large";
type Level = "primary" | "secondary" | "tertiary";

interface IButton {
	children: ReactNode;
	className?: string;
	size?: Size;
	level?: Level;
	onClick?: (e?: React.MouseEvent<HTMLButtonElement>) => void;
	type?: "button" | "submit" | "reset";
	disabled?: boolean;
	ariaLabel?: string;
}

// Use padding-based sizes for flexibility and reduced rounding
const sizeProps: Record<Size, string> = {
	small: "px-4 py-1 text-sm rounded-md",
	medium: "px-5 py-1.5 text-sm rounded-lg",
	large: "px-7 py-2 text-base rounded-lg",
};

// New color scheme using Tailwind 'sky' and 'blue' hues for a pleasing aesthetic
const levelProps: Record<Level, string> = {
	primary:
		"bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white shadow-md hover:shadow-lg border-transparent relative overflow-hidden",
	secondary:
		"bg-sky-50 dark:bg-sky-900 text-sky-700 dark:text-sky-200 border-sky-200 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-800 relative overflow-hidden",
	tertiary:
		"bg-white/70 dark:bg-transparent text-sky-700 dark:text-sky-200 border-sky-200 dark:border-sky-700 hover:bg-sky-50 dark:hover:bg-sky-900 shadow-sm hover:shadow-md relative overflow-hidden",
};

const disabledClass = "opacity-60 cursor-not-allowed pointer-events-none";

export const Button = ({
	children,
	className = "",
	size = "medium",
	level = "primary",
	onClick,
	type = "button",
	disabled = false,
	ariaLabel,
}: IButton) => {
	const base = `${sizeProps[size]} ${levelProps[level]} flex items-center justify-center transition-all duration-200 ease-in-out font-medium relative overflow-hidden`;

	// local hover flag to drive faster overlay animation
	const [isHover, setIsHover] = useState(false);

	// Ripples state for click-position ripple animation
	const [ripples, setRipples] = useState<
		{ id: number; x: number; y: number }[]
	>([]);
	const btnRef = useRef<HTMLButtonElement | null>(null);
	const nextId = useRef(0);

	const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
		if (disabled) return;
		// create ripple at click position
		const rect = btnRef.current?.getBoundingClientRect();
		const x = rect ? e.clientX - rect.left : 0;
		const y = rect ? e.clientY - rect.top : 0;
		const id = nextId.current++;
		setRipples((r) => [...r, { id, x, y }]);
		// cleanup after animation
		window.setTimeout(
			() => setRipples((r) => r.filter((p) => p.id !== id)),
			520
		);

		if (onClick) onClick(e);
	};

	return (
		<motion.button
			ref={btnRef}
			type={type}
			aria-label={ariaLabel}
			disabled={disabled}
			className={`${base} ${
				disabled ? disabledClass : "cursor-pointer"
			} ${className}`}
			onClick={handleClick}
			onHoverStart={() => setIsHover(true)}
			onHoverEnd={() => setIsHover(false)}
			whileHover={
				!disabled
					? {
							scale: 1.02,
							transition: { duration: 0.12, ease: "easeOut" },
					  }
					: {}
			}
			whileTap={
				!disabled
					? { scale: 0.985, transition: { duration: 0.06 } }
					: {}
			}
			initial={{ opacity: 0, y: 6 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{
				duration: 0.18,
				type: "spring",
				stiffness: 320,
				damping: 14,
			}}
		>
			{/* Animated subtle sheen overlay (driven by hover on itself) */}
			<motion.div
				className="absolute inset-0 bg-gradient-to-r from-white/8 via-white/4 to-white/8 opacity-0"
				initial={{ x: "-100%", opacity: 0 }}
				animate={
					isHover && !disabled
						? { x: "100%", opacity: 1 }
						: { x: "-100%", opacity: 0 }
				}
				transition={{ duration: 0.32, ease: "easeOut" }}
				style={{ pointerEvents: "none" }}
			/>

			{/* Sparkle / pulse for primary only (subtle) */}
			{level === "primary" && (
				<>
					<motion.div
						className="absolute top-2 right-3 w-1.5 h-1.5 bg-white rounded-full"
						initial={{ opacity: 0, scale: 0 }}
						animate={{ scale: [0, 1, 0], opacity: [0, 0.9, 0] }}
						transition={{
							duration: 1.6,
							repeat: Infinity,
							delay: 0.3,
						}}
						style={{ pointerEvents: "none" }}
					/>
					<motion.div
						className="absolute bottom-3 left-4 w-1.5 h-1.5 bg-white rounded-full"
						initial={{ opacity: 0, scale: 0 }}
						animate={{ scale: [0, 1, 0], opacity: [0, 0.9, 0] }}
						transition={{
							duration: 1.6,
							repeat: Infinity,
							delay: 0.9,
						}}
						style={{ pointerEvents: "none" }}
					/>
				</>
			)}

			{/* Content */}
			<motion.span
				className="relative z-10 select-none"
				transition={{ duration: 0.16 }}
			>
				{children}
			</motion.span>

			{/* Click ripples (rendered on demand) */}
			{ripples.map((r) => (
				<motion.span
					key={r.id}
					className="absolute bg-white/30 rounded-full"
					style={{
						left: r.x,
						top: r.y,
						width: 16,
						height: 16,
						translate: "-50% -50%",
						pointerEvents: "none",
						borderRadius: "inherit",
					}}
					initial={{ scale: 0, opacity: 0.35 }}
					animate={{ scale: 8, opacity: 0 }}
					transition={{ duration: 0.5, ease: "easeOut" }}
				/>
			))}
		</motion.button>
	);
};
