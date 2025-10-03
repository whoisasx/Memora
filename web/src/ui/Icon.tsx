import React from "react";
import type { ReactElement } from "react";
import { motion } from "motion/react";

interface IconProps {
	children: ReactElement;
	size?: number | string; // px or tailwind size via string
	className?: string;
	onClick?: (e?: React.MouseEvent) => void;
	ariaLabel?: string;
	title?: string;
	interactive?: boolean; // enables hover/tap animations
}

/**
 * Icon wrapper: clones the child icon to inject sizing and className,
 * wraps with motion for subtle hover/tap animations and optional onClick.
 */
export const Icon = ({
	children,
	size = 20,
	className = "",
	onClick,
	ariaLabel,
	title,
	interactive = true,
}: IconProps) => {
	// Simple and predictable behavior:
	// - If the child is not a valid React element, render nothing.
	// - Force the child icon to inherit color via `text-current` so wrapper hover color works.
	if (!React.isValidElement(children)) return null;
	const childEl = children as React.ReactElement<any, any>;
	const child = React.cloneElement(childEl, {
		...childEl.props,
		className: `${(
			childEl.props.className ?? ""
		).toString()} text-current`.trim(),
		style: { ...(childEl.props.style || {}), width: size, height: size },
	});

	// Render a single motion element. If onClick is provided we make it interactive
	// (hover bg + text change) and keyboard-activatable; otherwise it's a passive span.
	const isClickable = typeof onClick === "function";
	const commonClass = `inline-flex items-center justify-center p-1 rounded-md transition-colors duration-150 ${className}`;
	const clickableClass = isClickable
		? `${commonClass} text-sky-800 dark:text-sky-200 hover:bg-sky-100 dark:hover:bg-sky-800 hover:text-sky-700 dark:hover:text-sky-100`
		: commonClass;

	const handleKeyDown = (e: React.KeyboardEvent) => {
		if (!isClickable) return;
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			onClick && onClick(e as unknown as React.MouseEvent);
		}
	};

	return (
		<motion.span
			role={isClickable ? "button" : undefined}
			tabIndex={isClickable ? 0 : undefined}
			onKeyDown={handleKeyDown}
			onClick={onClick}
			aria-label={ariaLabel}
			title={title}
			className={clickableClass}
			whileHover={interactive ? { scale: isClickable ? 1.04 : 1.02 } : {}}
			whileTap={interactive ? { scale: isClickable ? 0.97 : 0.98 } : {}}
			transition={{ duration: 0.12, ease: "easeOut" }}
		>
			{child}
		</motion.span>
	);
};

export default Icon;
