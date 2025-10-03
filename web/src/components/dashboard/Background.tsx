export default function Background() {
	return (
		<div className="absolute inset-0 pointer pointer-events-none">
			{/* Grid SVG Layer */}
			<svg width="100%" height="100%" className="absolute inset-0">
				<defs>
					{/* Light mode grid pattern */}
					<pattern
						id="grid-light"
						width="80"
						height="80"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 80 0 L 0 0 0 80"
							fill="none"
							stroke="#0ea5e9"
							strokeWidth="0.5"
							opacity="0.25"
						/>
					</pattern>

					{/* Dark mode grid pattern */}
					<pattern
						id="grid-dark"
						width="80"
						height="80"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 80 0 L 0 0 0 80"
							fill="none"
							stroke="#64748b"
							strokeWidth="0.5"
							opacity="0.15"
						/>
					</pattern>
				</defs>

				{/* Grid rectangles for both modes */}
				<rect
					width="100%"
					height="100%"
					fill="url(#grid-light)"
					className="dark:hidden"
				/>
				<rect
					width="100%"
					height="100%"
					fill="url(#grid-dark)"
					className="hidden dark:block"
				/>
			</svg>

			{/* Lighting Effect Overlay - This creates the fade effect from top to bottom */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Light mode: Progressive fade overlay - grids visible at top, invisible at bottom */}
				<div
					className="absolute inset-0 dark:hidden"
					style={{
						background:
							"linear-gradient(to bottom, transparent 0%, rgba(248, 250, 252, 0.1) 15%, rgba(248, 250, 252, 0.3) 30%, rgba(248, 250, 252, 0.6) 50%, rgba(248, 250, 252, 0.85) 70%, rgba(248, 250, 252, 0.95) 85%, rgba(248, 250, 252, 1) 100%)",
					}}
				></div>

				{/* Dark mode: Progressive fade overlay - grids visible at top, invisible at bottom */}
				<div
					className="hidden dark:block absolute inset-0"
					style={{
						background:
							"linear-gradient(to bottom, rgba(15, 23, 42, 0.1) 0%, rgba(15, 23, 42, 0.3) 15%, rgba(15, 23, 42, 0.5) 30%, rgba(15, 23, 42, 0.7) 50%, rgba(15, 23, 42, 0.85) 70%, rgba(15, 23, 42, 0.95) 85%, rgba(15, 23, 42, 1) 100%)",
					}}
				></div>

				{/* Light mode: Subtle bottom ambient glow */}
				<div
					className="absolute bottom-0 left-0 right-0 dark:hidden"
					style={{
						height: "30%",
						background:
							"linear-gradient(to top, rgba(14, 165, 233, 0.03) 0%, rgba(56, 189, 248, 0.02) 50%, transparent 100%)",
					}}
				></div>

				{/* Light mode: Bottom light beam effect */}
				<div
					className="absolute bottom-0 left-1/2 transform -translate-x-1/2 dark:hidden"
					style={{
						width: "80%",
						height: "60%",
						background:
							"radial-gradient(ellipse 70% 100% at center bottom, rgba(14, 165, 233, 0.15) 0%, rgba(56, 189, 248, 0.08) 30%, transparent 60%)",
						clipPath: "ellipse(70% 100% at 50% 100%)",
					}}
				></div>

				{/* Light mode: Intense bottom glow */}
				<div
					className="absolute bottom-0 left-0 right-0 dark:hidden"
					style={{
						height: "40%",
						background:
							"linear-gradient(to top, rgba(14, 165, 233, 0.1) 0%, rgba(56, 189, 248, 0.05) 50%, transparent 100%)",
					}}
				></div>

				{/* Light mode: Overall radial gradient for balanced lighting */}
				<div
					className="absolute inset-0 dark:hidden"
					style={{
						background:
							"radial-gradient(ellipse 120% 80% at 50% 100%, rgba(14, 165, 233, 0.12) 0%, rgba(56, 189, 248, 0.08) 40%, rgba(240, 249, 255, 0.06) 70%, transparent 100%)",
					}}
				></div>

				{/* Light mode: Diagonal gradient from top-left to bottom-right */}
				<div
					className="absolute inset-0 dark:hidden"
					style={{
						background:
							"linear-gradient(135deg, rgba(14, 165, 233, 0.15) 0%, rgba(56, 189, 248, 0.1) 25%, transparent 50%, rgba(240, 249, 255, 0.12) 75%, rgba(186, 230, 253, 0.2) 100%)",
					}}
				></div>

				{/* Light mode: Middle-right radial gradient */}
				<div
					className="absolute inset-0 dark:hidden"
					style={{
						background:
							"radial-gradient(ellipse 80% 60% at 85% 30%, rgba(14, 165, 233, 0.12) 0%, rgba(56, 189, 248, 0.08) 30%, rgba(240, 249, 255, 0.05) 50%, transparent 70%)",
					}}
				></div>
			</div>
		</div>
	);
}
