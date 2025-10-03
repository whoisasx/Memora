import { useEffect, useRef } from "react";
import { useThemeStore } from "../../store/themeStore";
import { useDebouncedCallback } from "../../hooks/debounceHook";

interface AnimatedNode {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	opacity: number;
	color: string;
}

interface FloatingParticle {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	opacity: number;
	life: number;
	maxLife: number;
}

export default function AnimatedBackground() {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const animationRef = useRef<number | null>(null);
	const nodesRef = useRef<AnimatedNode[]>([]);
	const particlesRef = useRef<FloatingParticle[]>([]);
	const { theme } = useThemeStore();

	// Debounced resize handler for better performance - must be at component level
	const [debouncedResize] = useDebouncedCallback(
		(canvas: HTMLCanvasElement, initNodes: () => void) => {
			const newWidth = window.innerWidth;
			const newHeight = window.innerHeight;

			// Store previous dimensions to check for significant changes
			const prevWidth = canvas.width;
			const prevHeight = canvas.height;

			// Only resize if dimensions actually changed
			if (canvas.width !== newWidth || canvas.height !== newHeight) {
				canvas.width = newWidth;
				canvas.height = newHeight;

				// Reinitialize nodes when canvas size changes significantly
				if (prevWidth > 0 && prevHeight > 0) {
					const sizeChangeRatio = Math.abs(
						(newWidth * newHeight) / (prevWidth * prevHeight) - 1
					);
					if (sizeChangeRatio > 0.1) {
						initNodes();
					}
				}
			}
		},
		150
	);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		// Define colors based on theme
		const colors = {
			light: {
				primary: "rgba(14, 165, 233, 0.3)", // sky-500 with higher opacity
				secondary: "rgba(56, 189, 248, 0.2)", // sky-400 with higher opacity
				tertiary: "rgba(125, 211, 252, 0.1)", // sky-300 with higher opacity
				dots: "rgba(2, 132, 199, 0.3)", // sky-600 - dark shade of sky
				gradient1: "rgba(240, 249, 255, 0.95)", // sky-50 with opacity
				gradient2: "rgba(224, 242, 254, 0.8)", // sky-100 with opacity
			},
			dark: {
				primary: "rgba(14, 165, 233, 0.3)", // sky-500 with higher opacity
				secondary: "rgba(56, 189, 248, 0.2)", // sky-400 with higher opacity
				tertiary: "rgba(125, 211, 252, 0.1)", // sky-300 with higher opacity
				dots: "rgba(186, 230, 253, 0.3)", // sky-200 - light shade of sky
				gradient1: "rgba(15, 23, 42, 0.95)", // slate-900 with opacity
				gradient2: "rgba(30, 41, 59, 0.8)", // slate-800 with opacity
			},
		};

		const currentColors = colors[theme];

		// Initialize animated nodes function
		const initNodes = () => {
			nodesRef.current = [];
			particlesRef.current = [];
			const nodeCount = Math.floor(
				(canvas.width * canvas.height) / 30000
			); // More nodes for better visibility

			for (let i = 0; i < nodeCount; i++) {
				nodesRef.current.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					vx: (Math.random() - 0.5) * 1.0, // Faster movement
					vy: (Math.random() - 0.5) * 1.0,
					size: Math.random() * 5 + 2, // Larger nodes
					opacity: Math.random() * 0.8 + 0.3, // Higher opacity
					color: [
						currentColors.primary,
						currentColors.secondary,
						currentColors.tertiary,
					][Math.floor(Math.random() * 3)],
				});
			}

			// Initialize floating particles
			const particleCount = Math.floor(nodeCount / 3);
			for (let i = 0; i < particleCount; i++) {
				const life = Math.random() * 200 + 100;
				particlesRef.current.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					vx: (Math.random() - 0.5) * 0.2,
					vy: (Math.random() - 0.5) * 0.2,
					size: Math.random() * 1.5 + 0.5,
					opacity: Math.random() * 0.4 + 0.1,
					life: life,
					maxLife: life,
				});
			}
		};

		// Create resize handler that uses the debounced callback
		const handleResize = () => {
			debouncedResize(canvas, initNodes);
		};

		// Initial setup
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Initialize nodes after canvas is set up
		initNodes();

		window.addEventListener("resize", handleResize);

		// Animation loop
		const animate = () => {
			ctx.clearRect(0, 0, canvas.width, canvas.height);

			// Draw gradient background
			const gradient = ctx.createRadialGradient(
				canvas.width / 2,
				canvas.height / 2,
				0,
				canvas.width / 2,
				canvas.height / 2,
				Math.max(canvas.width, canvas.height) / 2
			);
			gradient.addColorStop(0, currentColors.gradient1);
			gradient.addColorStop(1, currentColors.gradient2);

			ctx.fillStyle = gradient;
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Draw dot pattern
			const dotSize = 1;
			const dotSpacing = 50;
			ctx.fillStyle = currentColors.dots;

			for (let x = 0; x < canvas.width; x += dotSpacing) {
				for (let y = 0; y < canvas.height; y += dotSpacing) {
					ctx.beginPath();
					ctx.arc(x, y, dotSize, 0, Math.PI * 2);
					ctx.fill();
				}
			}

			// Update and draw animated nodes
			nodesRef.current.forEach((node, index) => {
				// Update position
				node.x += node.vx;
				node.y += node.vy;

				// Wrap around edges
				if (node.x < 0) node.x = canvas.width;
				if (node.x > canvas.width) node.x = 0;
				if (node.y < 0) node.y = canvas.height;
				if (node.y > canvas.height) node.y = 0;

				// Draw connections to nearby nodes
				nodesRef.current.slice(index + 1).forEach((otherNode) => {
					const dx = node.x - otherNode.x;
					const dy = node.y - otherNode.y;
					const distance = Math.sqrt(dx * dx + dy * dy);

					if (distance < 150) {
						const opacity = ((150 - distance) / 150) * 0.1;
						ctx.save();
						ctx.globalAlpha = opacity;
						ctx.strokeStyle = currentColors.primary;
						ctx.lineWidth = 0.5;
						ctx.beginPath();
						ctx.moveTo(node.x, node.y);
						ctx.lineTo(otherNode.x, otherNode.y);
						ctx.stroke();
						ctx.restore();
					}
				});

				// Draw node with glow effect
				ctx.save();
				ctx.globalAlpha = node.opacity;

				// Outer glow
				ctx.shadowColor = node.color;
				ctx.shadowBlur = 10;
				ctx.fillStyle = node.color;
				ctx.beginPath();
				ctx.arc(node.x, node.y, node.size, 0, Math.PI * 2);
				ctx.fill();

				// Inner bright core
				ctx.shadowBlur = 0;
				ctx.fillStyle = node.color.replace(/[\d.]+\)$/g, "0.8)");
				ctx.beginPath();
				ctx.arc(node.x, node.y, node.size * 0.5, 0, Math.PI * 2);
				ctx.fill();

				ctx.restore();
			});

			// Update and draw floating particles
			particlesRef.current = particlesRef.current.filter((particle) => {
				// Update particle
				particle.x += particle.vx;
				particle.y += particle.vy;
				particle.life--;

				// Calculate fade based on life remaining
				const lifeFactor = particle.life / particle.maxLife;
				const currentOpacity = particle.opacity * lifeFactor;

				if (particle.life <= 0) return false;

				// Wrap around edges
				if (particle.x < 0) particle.x = canvas.width;
				if (particle.x > canvas.width) particle.x = 0;
				if (particle.y < 0) particle.y = canvas.height;
				if (particle.y > canvas.height) particle.y = 0;

				// Draw particle
				ctx.save();
				ctx.globalAlpha = currentOpacity;
				ctx.fillStyle = currentColors.tertiary;
				ctx.beginPath();
				ctx.arc(
					particle.x,
					particle.y,
					particle.size * lifeFactor,
					0,
					Math.PI * 2
				);
				ctx.fill();
				ctx.restore();

				return true;
			});

			// Spawn new particles occasionally
			if (Math.random() < 0.02 && particlesRef.current.length < 50) {
				const life = Math.random() * 200 + 100;
				particlesRef.current.push({
					x: Math.random() * canvas.width,
					y: Math.random() * canvas.height,
					vx: (Math.random() - 0.5) * 0.2,
					vy: (Math.random() - 0.5) * 0.2,
					size: Math.random() * 1.5 + 0.5,
					opacity: Math.random() * 0.4 + 0.1,
					life: life,
					maxLife: life,
				});
			}

			animationRef.current = requestAnimationFrame(animate);
		};

		animate();

		return () => {
			window.removeEventListener("resize", handleResize);
			if (animationRef.current) {
				cancelAnimationFrame(animationRef.current);
			}
		};
	}, [theme]);

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 w-full h-full pointer-events-none"
			style={{ background: "transparent" }}
		/>
	);
}
