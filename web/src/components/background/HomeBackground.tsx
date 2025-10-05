export default function HomeBackground() {
	return (
		<div className="absolute inset-0 -z-10 overflow-hidden">
			{/* Base background colors - always visible */}
			<div className="absolute inset-0 bg-gradient-to-br from-sky-50 via-slate-50 to-sky-100 dark:from-slate-950 dark:via-slate-900 dark:to-slate-800"></div>

			{/* Dashed Grid SVG Layer */}
			<svg width="100%" height="100%" className="absolute inset-0">
				<defs>
					{/* Light mode dashed grid pattern */}
					<pattern
						id="dashed-grid-light"
						width="60"
						height="60"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 60 0 L 0 0 0 60"
							fill="none"
							stroke="#64748b"
							strokeWidth="0.8"
							strokeDasharray="2,3"
							opacity="0.8"
						/>
					</pattern>

					{/* Dark mode dashed grid pattern */}
					<pattern
						id="dashed-grid-dark"
						width="60"
						height="60"
						patternUnits="userSpaceOnUse"
					>
						<path
							d="M 60 0 L 0 0 0 60"
							fill="none"
							stroke="#94a3b8"
							strokeWidth="0.8"
							strokeDasharray="2,3"
							opacity="0.6"
						/>
					</pattern>
				</defs>

				{/* Grid rectangles */}
				<rect
					width="100%"
					height="100%"
					fill="url(#dashed-grid-light)"
					className="dark:hidden"
				/>
				<rect
					width="100%"
					height="100%"
					fill="url(#dashed-grid-dark)"
					className="hidden dark:block"
				/>
			</svg>

			{/* Light Effect Overlay - realistic light falloff from top and bottom */}
			<div className="absolute inset-0 pointer-events-none">
				{/* Light mode: Realistic light falloff effect */}
				<div
					className="absolute inset-0 dark:hidden"
					style={{
						background: `
							radial-gradient(ellipse 60% 15% at 50% 0%, transparent 0%, transparent 40%, rgba(248, 250, 252, 0.15) 70%, rgba(248, 250, 252, 0.3) 85%, rgba(248, 250, 252, 0.5) 100%),
							radial-gradient(ellipse 60% 15% at 50% 100%, transparent 0%, transparent 40%, rgba(248, 250, 252, 0.15) 70%, rgba(248, 250, 252, 0.3) 85%, rgba(248, 250, 252, 0.5) 100%),
							linear-gradient(to bottom, rgba(248, 250, 252, 0.03) 0%, rgba(248, 250, 252, 0.15) 10%, rgba(248, 250, 252, 0.25) 20%, rgba(248, 250, 252, 0.4) 30%, rgba(248, 250, 252, 0.6) 35%, rgba(248, 250, 252, 0.6) 65%, rgba(248, 250, 252, 0.4) 70%, rgba(248, 250, 252, 0.25) 80%, rgba(248, 250, 252, 0.15) 90%, rgba(248, 250, 252, 0.03) 100%)
						`,
					}}
				></div>

				{/* Dark mode: Realistic light falloff effect */}
				<div
					className="hidden dark:block absolute inset-0"
					style={{
						background: `
							radial-gradient(ellipse 60% 15% at 50% 0%, transparent 0%, transparent 40%, rgba(15, 23, 42, 0.15) 70%, rgba(15, 23, 42, 0.3) 85%, rgba(15, 23, 42, 0.5) 100%),
							radial-gradient(ellipse 60% 15% at 50% 100%, transparent 0%, transparent 40%, rgba(15, 23, 42, 0.15) 70%, rgba(15, 23, 42, 0.3) 85%, rgba(15, 23, 42, 0.5) 100%),
							linear-gradient(to bottom, rgba(15, 23, 42, 0.03) 0%, rgba(15, 23, 42, 0.15) 10%, rgba(15, 23, 42, 0.25) 20%, rgba(15, 23, 42, 0.4) 30%, rgba(15, 23, 42, 0.6) 35%, rgba(15, 23, 42, 0.6) 65%, rgba(15, 23, 42, 0.4) 70%, rgba(15, 23, 42, 0.25) 80%, rgba(15, 23, 42, 0.15) 90%, rgba(15, 23, 42, 0.03) 100%)
						`,
					}}
				></div>

				{/* Subtle ambient light glows */}
				<div
					className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/4 dark:hidden"
					style={{
						background:
							"radial-gradient(ellipse 100% 100% at center top, rgba(14, 165, 233, 0.04) 0%, transparent 70%)",
					}}
				></div>

				<div
					className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/4 dark:hidden"
					style={{
						background:
							"radial-gradient(ellipse 100% 100% at center bottom, rgba(14, 165, 233, 0.04) 0%, transparent 70%)",
					}}
				></div>

				<div
					className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/4 hidden dark:block"
					style={{
						background:
							"radial-gradient(ellipse 100% 100% at center top, rgba(100, 116, 139, 0.03) 0%, transparent 70%)",
					}}
				></div>

				<div
					className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1/2 h-1/4 hidden dark:block"
					style={{
						background:
							"radial-gradient(ellipse 100% 100% at center bottom, rgba(100, 116, 139, 0.03) 0%, transparent 70%)",
					}}
				></div>
			</div>
		</div>
	);
}
