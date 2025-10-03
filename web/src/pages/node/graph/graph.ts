import * as d3 from "d3";
import {
	useAnimatedStore,
	useAttributeStore,
	type Link,
	type Node,
} from "../../../store/nodeStore";
import { useThemeStore } from "../../../store/themeStore";
import { useDashboardStore } from "../../../store/dashboardStore";
import type { Content } from "../../../types/apiResponse";

export class Graph {
	private svg: d3.Selection<SVGSVGElement, unknown, null, undefined>;
	private nodes: Node[];
	private links: Link[];
	private degrees: Map<string, { indeg: number; outdeg: number }>;
	private width: number;
	private height: number;

	private contents: Content[] = useDashboardStore.getState().contents;

	private theme: "dark" | "light" = useThemeStore.getState().theme;

	private textFade: number =
		(1 - useAttributeStore.getState().textFade) * 100;
	private nodeSize: number = useAttributeStore.getState().nodeSize * 5;
	private lineThickness: number =
		useAttributeStore.getState().lineThickness * 1.5;
	private centerForces: number = useAttributeStore.getState().centerForces;
	private linkForces: number = useAttributeStore.getState().linkForces;
	private repelForces: number = useAttributeStore.getState().repelForces * 12;
	private linkDistance: number = useAttributeStore.getState().linkDistance;

	private nodeSelection: d3.Selection<any, Node, any, unknown> | null = null;
	private linkSelection: d3.Selection<any, Link, any, unknown> | null = null;
	private labelSelection: d3.Selection<any, Node, any, unknown> | null = null;

	private previewEl: HTMLDivElement | null = null;
	private isDragging: boolean = false;
	private hoverTimeout: number | null = null;
	private currentHoveredNode: string | null = null;
	private isHighlighting: boolean = false;
	private overlayEl: HTMLDivElement | null = null;
	private hasAnimated: boolean = useAnimatedStore.getState().hasanimated;
	private setHasAnimeted: (animate: boolean) => void =
		useAnimatedStore.getState().setHasanimated;

	// SVG panning properties
	private zoom: d3.ZoomBehavior<SVGSVGElement, unknown> | null = null;
	private g: d3.Selection<SVGGElement, unknown, null, undefined> | null =
		null;

	private unsubscribeTextFade: () => void;
	private unsubscribeNodeSize: () => void;
	private unsubscribeLineThickness: () => void;
	private unsubscribeCenterForces: () => void;
	private unsubscribeRepelForces: () => void;
	private unsubscribeLinkForces: () => void;
	private unsubscribeLinkDistance: () => void;
	private unsubscribeHasAnimated: () => void;

	private unsubscribeTheme: () => void;

	constructor(
		nodes: Node[],
		links: Link[],
		degrees: Map<string, { indeg: number; outdeg: number }>,
		width: number,
		height: number,
		svg: SVGSVGElement
	) {
		this.svg = d3.select(svg);
		this.nodes = nodes;
		this.links = links;
		this.degrees =
			degrees instanceof Map
				? degrees
				: new Map(Object.entries(degrees || {}));
		this.width = width;
		this.height = height;

		this.unsubscribeTextFade = useAttributeStore.subscribe(
			(state) => state.textFade,
			(newVal) => {
				this.textFade = (1 - newVal) * 100;
				if (this.labelSelection) {
					this.labelSelection.attr("opacity", this.textFade);
				}
			}
		);
		this.unsubscribeNodeSize = useAttributeStore.subscribe(
			(state) => state.nodeSize,
			(newVal) => {
				this.nodeSize = newVal * 4;
				if (this.nodeSelection) {
					this.nodeSelection.attr("r", this.nodeSize);
				}
			}
		);
		this.unsubscribeLineThickness = useAttributeStore.subscribe(
			(state) => state.lineThickness,
			(newVal) => {
				this.lineThickness = newVal * 1.25;
				if (this.linkSelection) {
					this.linkSelection.attr("stroke-width", this.lineThickness);
				}
			}
		);
		this.unsubscribeCenterForces = useAttributeStore.subscribe(
			(state) => state.centerForces,
			(newVal) => {
				this.centerForces = newVal;
				this.drawGraph();
			}
		);
		this.unsubscribeRepelForces = useAttributeStore.subscribe(
			(state) => state.repelForces,
			(newVal) => {
				this.repelForces = newVal * 10;
				this.drawGraph();
			}
		);
		this.unsubscribeLinkForces = useAttributeStore.subscribe(
			(state) => state.linkForces,
			(newVal) => {
				this.linkForces = newVal;
				this.drawGraph();
			}
		);
		this.unsubscribeLinkDistance = useAttributeStore.subscribe(
			(state) => state.linkDistance,
			(newVal) => {
				this.linkDistance = newVal;
				this.drawGraph();
			}
		);

		this.unsubscribeTheme = useThemeStore.subscribe(
			(state) => state.theme,
			(newVal) => {
				this.theme = newVal;
				if (this.nodeSelection) {
					this.nodeSelection.attr("fill", (d) =>
						this.getNodeColor(d.id)
					);
				}
				this.drawGraph();
			}
		);

		this.unsubscribeHasAnimated = useAnimatedStore.subscribe(
			(state) => state.hasanimated,
			(newVal) => {
				this.hasAnimated = newVal;
				if (newVal === false) {
					this.drawGraph();
				}
			}
		);

		this.drawGraph();
	}

	destructor() {
		this.unsubscribeTextFade();
		this.unsubscribeNodeSize();
		this.unsubscribeLineThickness();
		this.unsubscribeCenterForces();
		this.unsubscribeRepelForces();
		this.unsubscribeLinkForces();
		this.unsubscribeLinkDistance();

		this.unsubscribeTheme();
		this.unsubscribeHasAnimated();

		// Clear any pending timeouts
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
		}

		if (this.previewEl && this.previewEl.parentElement) {
			this.previewEl.parentElement.removeChild(this.previewEl);
			this.previewEl = null;
		}

		if (this.overlayEl && this.overlayEl.parentElement) {
			this.overlayEl.parentElement.removeChild(this.overlayEl);
			this.overlayEl = null;
		}
	}

	updateDimensions(width: number, height: number) {
		const oldWidth = this.width;
		const oldHeight = this.height;

		// Update internal dimensions
		this.width = width;
		this.height = height;

		// Update SVG dimensions
		this.svg.attr("width", width).attr("height", height);

		// Reset pan position when dimensions change to keep graph centered
		if (this.zoom && this.g) {
			const transform = d3.zoomIdentity;
			this.svg.call(this.zoom.transform, transform);
		}

		// Scale existing node positions to maintain relative positioning
		if (this.nodeSelection && oldWidth > 0 && oldHeight > 0) {
			const scaleX = width / oldWidth;
			const scaleY = height / oldHeight;

			// Update node positions proportionally
			this.nodes.forEach((node) => {
				if (node.x !== undefined && node.y !== undefined) {
					node.x = node.x * scaleX;
					node.y = node.y * scaleY;

					// Update fixed positions if they exist
					if (node.fx !== undefined && node.fx !== null) {
						node.fx = node.fx * scaleX;
					}
					if (node.fy !== undefined && node.fy !== null) {
						node.fy = node.fy * scaleY;
					}
				}
			});
		}

		// Redraw the graph with new dimensions
		// This will restart the simulation with updated forces
		this.drawGraph();
	}

	private getNodeColor(nodeId: string): string {
		if (!this.degrees || typeof this.degrees.get !== "function") {
			console.warn("Degrees is not a proper Map, using default color");
			return this.theme === "dark" ? "#64748b" : "#64748b"; // Default gray
		}

		const nodeDegree = this.degrees.get(nodeId);
		if (!nodeDegree) {
			return this.theme === "dark" ? "#64748b" : "#64748b"; // Default gray
		}

		const { indeg, outdeg } = nodeDegree;

		if (indeg === 0 && outdeg === 0) {
			// Isolated node (no connections) - Enhanced with subtle gradient colors
			return this.theme === "dark" ? "#64748b" : "#94a3b8"; // Refined gray
		} else if (indeg === 0 && outdeg > 0) {
			// Source node (only outgoing connections) - Vibrant emerald/teal
			return this.theme === "dark" ? "#059669" : "#0d9488"; // Enhanced teal
		} else if (indeg > 0 && outdeg === 0) {
			// Sink node (only incoming connections) - Warm amber/orange
			return this.theme === "dark" ? "#ea580c" : "#dc2626"; // Enhanced orange/red
		} else {
			// Hub node (both incoming and outgoing connections) - Sky blue theme
			return this.theme === "dark" ? "#0ea5e9" : "#2563eb"; // Enhanced sky blue
		}
	}

	drawGraph() {
		this.svg.selectAll("*").remove();

		// Create a group element for all graph content that can be transformed
		this.g = this.svg.append("g").attr("class", "graph-container");

		// Set up zoom and pan behavior for the graph
		this.zoom = d3
			.zoom<SVGSVGElement, unknown>()
			.scaleExtent([0.1, 4]) // Allow zoom from 10% to 400%
			.on("zoom", (event) => {
				if (this.g) {
					// Apply both translation and scaling
					this.g.attr("transform", event.transform);
				}
			});

		// Apply zoom and pan behavior to SVG
		this.svg.call(this.zoom).on("dblclick.zoom", null); // Disable double-click zoom to avoid conflicts with node interactions

		const simulation = d3
			.forceSimulation(this.nodes)
			.force(
				"link",
				d3
					.forceLink(this.links)
					.id((d: d3.SimulationNodeDatum) => (d as Node).id)
					.distance(this.linkDistance - 100 * this.linkForces)
			)
			.force("charge", d3.forceManyBody().strength(-this.repelForces))
			.force(
				"center",
				d3
					.forceCenter(this.width / 2, this.height / 2)
					.strength(this.centerForces)
			)
			.force(
				"radial",
				d3.forceRadial(
					80 * (1 - this.centerForces) + this.repelForces,
					this.width / 2,
					this.height / 2
				)
			);

		// Enhanced link styling with better colors and gradients
		this.linkSelection = this.g
			.append("g")
			.selectAll("line")
			.data(this.links)
			.join("line")
			.attr("stroke", this.theme === "dark" ? "#334155" : "#cbd5e1") // Better contrast
			.attr("stroke-width", this.lineThickness)
			.attr("stroke-opacity", 0.7)
			.attr("stroke-linecap", "round") // Rounded line caps for smoother appearance
			.style("filter", "drop-shadow(0 1px 2px rgba(0, 0, 0, 0.1))"); // Subtle shadow

		// Enhanced node styling with gradients and better shadows
		this.nodeSelection = this.g
			.append("g")
			.selectAll<SVGCircleElement, Node>("circle")
			.data(this.nodes)
			.join("circle")
			.attr("r", 0)
			.attr("fill", (d) => this.getNodeColor(d.id))
			.attr("stroke", this.theme === "dark" ? "#1e293b" : "#ffffff") // Border color
			.attr("stroke-width", 2)
			.style("cursor", "pointer")
			.style("opacity", 0)
			.style(
				"filter",
				this.theme === "dark"
					? "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 0 1px rgba(255, 255, 255, 0.05))"
					: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 0 1px rgba(0, 0, 0, 0.05))"
			) // Enhanced shadows and subtle inner border
			.call(
				d3
					.drag<SVGCircleElement, Node>()
					.on("start", (event, d) => {
						this.isDragging = true;
						this.hidePreviewCard();
						this.clearHoverTimeout();
						this.highlightConnectedNodes(d.id);
						if (!event.active)
							simulation.alphaTarget(0.3).restart();
						d.fx = d.x;
						d.fy = d.y;
					})
					.on("drag", (event, d) => {
						d.fx = event.x;
						d.fy = event.y;
						// Don't re-highlight during drag to avoid performance issues
					})
					.on("end", (event, d) => {
						this.isDragging = false;
						this.clearHighlighting();
						if (!event.active) simulation.alphaTarget(0);
						d.fx = null;
						d.fy = null;
					})
			)
			.on("mouseover", (event: MouseEvent, d) => {
				this.handleMouseEnter(event, d);
			})
			.on("mousemove", (event: MouseEvent, d) => {
				this.handleMouseMove(event, d);
			})
			.on("mouseout", (event: MouseEvent, d) => {
				this.handleMouseOut(event, d);
			});

		// Enhanced label styling with better typography and contrast
		this.labelSelection = this.g
			.append("g")
			.selectAll("text")
			.data(this.nodes)
			.join("text")
			.text((d: d3.SimulationNodeDatum) => {
				const node = d as Node;
				const content = this.contents.find((c) => c.id === node.id);
				if (content) {
					if (content.url) {
						try {
							const url = new URL(content.url);
							return url.hostname.replace("www.", "");
						} catch {}
					}
					if (content.description) {
						return (
							content.description.slice(0, 12) +
							(content.description.length > 12 ? "..." : "")
						);
					}
				}
				return node.id.slice(0, 8) + (node.id.length > 8 ? "..." : "");
			})
			.attr("font-size", 11)
			.attr("font-weight", 500)
			.attr("font-family", "system-ui, -apple-system, sans-serif")
			.attr("text-anchor", "middle")
			.attr("dy", -18)
			.attr("fill", this.theme === "dark" ? "#e2e8f0" : "#334155")
			.attr("opacity", 0)
			.style("pointer-events", "none")
			.style(
				"text-shadow",
				this.theme === "dark"
					? "0 1px 2px rgba(0, 0, 0, 0.8), 0 0 4px rgba(0, 0, 0, 0.4)"
					: "0 1px 2px rgba(255, 255, 255, 0.9), 0 0 4px rgba(255, 255, 255, 0.6)"
			); // Enhanced text shadow for better readability

		if (!this.hasAnimated) {
			this.animateEntrance();
		} else {
			this.nodeSelection.attr("r", this.nodeSize).style("opacity", 1);
			this.labelSelection.attr("opacity", this.textFade);
		}

		simulation.on("tick", () => {
			this.linkSelection!.attr("x1", (d) =>
				typeof d.source === "object" && "x" in d.source
					? (d.source as any).x
					: null
			)
				.attr("y1", (d) =>
					typeof d.source === "object" && "y" in d.source
						? (d.source as any).y
						: null
				)
				.attr("x2", (d) =>
					typeof d.target === "object" && "x" in d.target
						? (d.target as any).x
						: null
				)
				.attr("y2", (d) =>
					typeof d.target === "object" && "y" in d.target
						? (d.target as any).y
						: null
				);

			this.nodeSelection!.attr("cx", (d) => d.x ?? 0).attr(
				"cy",
				(d) => d.y ?? 0
			);

			this.labelSelection!.attr("x", (d) => d.x ?? 0).attr(
				"y",
				(d) => d.y ?? 0
			);
		});
	}

	handleMouseEnter(event: MouseEvent, d: Node) {
		if (this.isDragging) return;

		this.currentHoveredNode = d.id;
		this.clearHoverTimeout();
		this.hoverTimeout = window.setTimeout(() => {
			if (this.currentHoveredNode === d.id && !this.isDragging) {
				this.highlightConnectedNodes(d.id);
			}
		}, 300); // Reduced timeout for more responsive interaction

		// Enhanced hover animation with scale and glow effect
		d3.select(event.currentTarget as SVGCircleElement)
			.transition()
			.duration(200)
			.ease(d3.easeBackOut.overshoot(1.2))
			.attr("r", this.nodeSize * 1.3)
			.style(
				"filter",
				this.theme === "dark"
					? "drop-shadow(0 6px 16px rgba(0, 0, 0, 0.4)) drop-shadow(0 0 12px rgba(14, 165, 233, 0.4))"
					: "drop-shadow(0 6px 20px rgba(0, 0, 0, 0.2)) drop-shadow(0 0 16px rgba(37, 99, 235, 0.3))"
			);

		this.showPreviewCard(event as MouseEvent, d.id);
	}

	handleMouseMove(event: MouseEvent, _d: Node) {
		if (this.isDragging) return;
		this.updatePreviewCardPosition(event);
	}

	handleMouseOut(event: MouseEvent, _d: Node) {
		this.currentHoveredNode = null;
		this.clearHoverTimeout();

		// Don't clear highlighting if we're dragging
		if (!this.isDragging) {
			this.clearHighlighting();
		}

		// Smooth return to original state
		d3.select(event.currentTarget as SVGCircleElement)
			.transition()
			.duration(200)
			.ease(d3.easeBackIn.overshoot(1.1))
			.attr("r", this.nodeSize)
			.style(
				"filter",
				this.theme === "dark"
					? "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 0 1px rgba(255, 255, 255, 0.05))"
					: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 0 1px rgba(0, 0, 0, 0.05))"
			);

		setTimeout(() => {
			this.hidePreviewCard();
		}, 2500); // Reduced timeout for snappier feel
	}

	private ensurePreviewEl() {
		if (this.previewEl) return;
		const el = document.createElement("div");
		el.style.position = "absolute";
		el.style.pointerEvents = "auto";
		el.style.width = "240px"; // Slightly wider for better content display
		el.style.height = "140px"; // Taller for better proportions
		el.style.borderRadius = "12px"; // More rounded corners
		el.style.boxShadow =
			this.theme === "dark"
				? "0 8px 32px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.1)"
				: "0 8px 32px rgba(0, 0, 0, 0.2), 0 0 0 1px rgba(0, 0, 0, 0.05)"; // Enhanced shadows
		el.style.zIndex = "9999";
		el.style.display = "none";
		el.style.backgroundSize = "cover";
		el.style.backgroundPosition = "center";
		el.style.backgroundRepeat = "no-repeat";
		el.style.overflow = "hidden";
		el.style.backdropFilter = "blur(8px)"; // Add backdrop blur
		el.style.border =
			this.theme === "dark"
				? "1px solid rgba(148, 163, 184, 0.2)"
				: "1px solid rgba(148, 163, 184, 0.3)"; // Subtle border

		if (this.theme === "dark") {
			el.style.backgroundColor = "rgba(15, 23, 36, 0.95)"; // More transparent
		} else {
			el.style.backgroundColor = "rgba(255, 255, 255, 0.95)"; // More transparent
		}

		// Remove mouse event listeners that were causing issues
		el.addEventListener("mouseenter", (e) => {
			e.stopPropagation();
		});

		el.addEventListener("mouseleave", () => {
			this.hidePreviewCard();
		});

		const overlay = document.createElement("div");
		overlay.style.position = "absolute";
		overlay.style.bottom = "0";
		overlay.style.left = "0";
		overlay.style.right = "0";
		overlay.style.background =
			this.theme === "dark"
				? "linear-gradient(to top, rgba(15, 23, 36, 0.98) 0%, rgba(15, 23, 36, 0.8) 70%, transparent 100%)"
				: "linear-gradient(to top, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.8) 70%, transparent 100%)"; // Gradient overlay
		overlay.style.padding = "12px"; // More padding
		overlay.style.backdropFilter = "blur(4px)";
		overlay.style.display = "flex";
		overlay.style.justifyContent = "space-between";
		overlay.style.alignItems = "center";
		overlay.style.gap = "10px";
		el.appendChild(overlay);

		const desc = document.createElement("div");
		desc.className = "preview-desc";
		desc.style.fontSize = "12px"; // Slightly larger text
		desc.style.lineHeight = "1.4"; // Better line height
		desc.style.flex = "1";
		desc.style.overflow = "hidden";
		desc.style.textOverflow = "ellipsis";
		desc.style.whiteSpace = "nowrap";
		desc.style.color = this.theme === "dark" ? "#e2e8f0" : "#1e293b"; // Better contrast
		desc.style.fontWeight = "500"; // Medium weight
		desc.style.fontFamily = "system-ui, -apple-system, sans-serif"; // Better font
		overlay.appendChild(desc);

		const openBtn = document.createElement("button");
		openBtn.innerHTML = "🔗"; // Link icon
		openBtn.style.width = "28px"; // Slightly larger
		openBtn.style.height = "28px";
		openBtn.style.borderRadius = "6px"; // More rounded
		openBtn.style.border = "none";
		openBtn.style.cursor = "pointer";
		openBtn.style.fontSize = "13px";
		openBtn.style.display = "flex";
		openBtn.style.alignItems = "center";
		openBtn.style.justifyContent = "center";
		openBtn.style.flexShrink = "0";
		openBtn.style.transition = "all 0.2s ease";
		openBtn.className = "preview-open-btn";

		if (this.theme === "dark") {
			openBtn.style.background =
				"linear-gradient(135deg, #0ea5e9, #3b82f6)"; // Sky gradient
			openBtn.style.color = "#fff";
			openBtn.style.boxShadow = "0 2px 8px rgba(14, 165, 233, 0.3)";
		} else {
			openBtn.style.background =
				"linear-gradient(135deg, #2563eb, #1d4ed8)"; // Blue gradient
			openBtn.style.color = "#fff";
			openBtn.style.boxShadow = "0 2px 8px rgba(37, 99, 235, 0.3)";
		}

		// Add hover effect for button
		openBtn.addEventListener("mouseenter", () => {
			openBtn.style.transform = "scale(1.05)";
			openBtn.style.boxShadow =
				this.theme === "dark"
					? "0 4px 12px rgba(14, 165, 233, 0.4)"
					: "0 4px 12px rgba(37, 99, 235, 0.4)";
		});

		openBtn.addEventListener("mouseleave", () => {
			openBtn.style.transform = "scale(1)";
			openBtn.style.boxShadow =
				this.theme === "dark"
					? "0 2px 8px rgba(14, 165, 233, 0.3)"
					: "0 2px 8px rgba(37, 99, 235, 0.3)";
		});

		overlay.appendChild(openBtn);
		document.body.appendChild(el);
		this.previewEl = el;
	}

	private showPreviewCard(event: MouseEvent, id: string) {
		this.ensurePreviewEl();
		if (!this.previewEl) return;

		const content = this.contents.find((c) => c.id === id);
		const descEl = this.previewEl.querySelector(
			".preview-desc"
		) as HTMLDivElement;
		const openBtn = this.previewEl.querySelector(
			".preview-open-btn"
		) as HTMLButtonElement;

		// Enhanced description display
		if (content?.description) {
			descEl.textContent =
				content.description.length > 45
					? content.description.slice(0, 45) + "..."
					: content.description;
		} else if (content?.url) {
			try {
				const url = new URL(content.url);
				descEl.textContent = url.hostname.replace("www.", "");
			} catch {
				descEl.textContent = "External Link";
			}
		} else {
			descEl.textContent = "No description available";
		}

		openBtn.onclick = (ev) => {
			ev.stopPropagation();
			if (content && content.url) {
				window.open(content.url, "_blank");
			}
		};

		// Enhanced background styling
		this.previewEl.style.backgroundImage = "";
		this.previewEl.style.backgroundColor = "";

		if (content && content.url_data && content.url_data.thumbnail) {
			this.previewEl.style.backgroundImage = `url(${content.url_data.thumbnail})`;
			// Add subtle overlay for better text readability
			this.previewEl.style.backgroundBlendMode = "overlay";
		} else {
			// Enhanced gradient backgrounds based on node type
			const nodeColor = this.getNodeColor(id);
			const gradientColors = this.generateGradientFromColor(nodeColor);
			this.previewEl.style.backgroundImage = `linear-gradient(135deg, ${gradientColors.start}, ${gradientColors.end})`;
		}

		// Add entrance animation
		this.previewEl.style.display = "block";
		this.previewEl.style.opacity = "0";
		this.previewEl.style.transform = "scale(0.9) translateY(10px)";

		setTimeout(() => {
			if (this.previewEl) {
				this.previewEl.style.transition =
					"all 0.2s cubic-bezier(0.16, 1, 0.3, 1)";
				this.previewEl.style.opacity = "1";
				this.previewEl.style.transform = "scale(1) translateY(0)";
			}
		}, 10);

		this.updatePreviewCardPosition(event);
	}

	private generateGradientFromColor(color: string): {
		start: string;
		end: string;
	} {
		// Generate complementary gradient colors based on the node color
		const colorMap: { [key: string]: { start: string; end: string } } = {
			"#64748b": {
				// Gray
				start:
					this.theme === "dark"
						? "rgba(100, 116, 139, 0.4)"
						: "rgba(148, 163, 184, 0.3)",
				end:
					this.theme === "dark"
						? "rgba(51, 65, 85, 0.6)"
						: "rgba(203, 213, 225, 0.5)",
			},
			"#94a3b8": {
				// Light gray
				start:
					this.theme === "dark"
						? "rgba(148, 163, 184, 0.4)"
						: "rgba(203, 213, 225, 0.3)",
				end:
					this.theme === "dark"
						? "rgba(100, 116, 139, 0.6)"
						: "rgba(148, 163, 184, 0.5)",
			},
			"#059669": {
				// Dark teal
				start:
					this.theme === "dark"
						? "rgba(5, 150, 105, 0.4)"
						: "rgba(13, 148, 136, 0.3)",
				end:
					this.theme === "dark"
						? "rgba(4, 120, 87, 0.6)"
						: "rgba(15, 118, 110, 0.5)",
			},
			"#0d9488": {
				// Teal
				start:
					this.theme === "dark"
						? "rgba(13, 148, 136, 0.4)"
						: "rgba(20, 184, 166, 0.3)",
				end:
					this.theme === "dark"
						? "rgba(15, 118, 110, 0.6)"
						: "rgba(13, 148, 136, 0.5)",
			},
			"#ea580c": {
				// Orange
				start:
					this.theme === "dark"
						? "rgba(234, 88, 12, 0.4)"
						: "rgba(220, 38, 38, 0.3)",
				end:
					this.theme === "dark"
						? "rgba(194, 65, 12, 0.6)"
						: "rgba(185, 28, 28, 0.5)",
			},
			"#dc2626": {
				// Red
				start:
					this.theme === "dark"
						? "rgba(220, 38, 38, 0.4)"
						: "rgba(239, 68, 68, 0.3)",
				end:
					this.theme === "dark"
						? "rgba(185, 28, 28, 0.6)"
						: "rgba(220, 38, 38, 0.5)",
			},
			"#0ea5e9": {
				// Sky blue
				start:
					this.theme === "dark"
						? "rgba(14, 165, 233, 0.4)"
						: "rgba(37, 99, 235, 0.3)",
				end:
					this.theme === "dark"
						? "rgba(2, 132, 199, 0.6)"
						: "rgba(29, 78, 216, 0.5)",
			},
			"#2563eb": {
				// Blue
				start:
					this.theme === "dark"
						? "rgba(37, 99, 235, 0.4)"
						: "rgba(59, 130, 246, 0.3)",
				end:
					this.theme === "dark"
						? "rgba(29, 78, 216, 0.6)"
						: "rgba(37, 99, 235, 0.5)",
			},
		};

		return colorMap[color] || colorMap["#64748b"]; // Default to gray
	}

	private updatePreviewCardPosition(event: MouseEvent) {
		if (!this.previewEl) return;
		const offsetX = 12;
		const offsetY = 12;
		let left = event.pageX + offsetX;
		let top = event.pageY + offsetY;
		const rect = this.previewEl.getBoundingClientRect();
		if (left + rect.width > window.innerWidth - 8) {
			left = window.innerWidth - rect.width - 8;
		}
		if (top + rect.height > window.innerHeight - 8) {
			top = window.innerHeight - rect.height - 8;
		}
		this.previewEl.style.left = `${left}px`;
		this.previewEl.style.top = `${top}px`;
	}

	private hidePreviewCard() {
		if (!this.previewEl) return;

		// Add exit animation
		this.previewEl.style.transition =
			"all 0.15s cubic-bezier(0.4, 0, 1, 1)";
		this.previewEl.style.opacity = "0";
		this.previewEl.style.transform = "scale(0.95) translateY(5px)";

		setTimeout(() => {
			if (this.previewEl) {
				this.previewEl.style.display = "none";
				this.previewEl.style.transition = "";
			}
		}, 150);
	}

	private clearHoverTimeout() {
		if (this.hoverTimeout) {
			clearTimeout(this.hoverTimeout);
			this.hoverTimeout = null;
		}
	}

	private getConnectedElements(nodeId: string) {
		const connectedNodes = new Set<string>();
		const connectedLinks: Link[] = [];

		this.links.forEach((link) => {
			const sourceId =
				typeof link.source === "object"
					? (link.source as Node).id
					: String(link.source);
			const targetId =
				typeof link.target === "object"
					? (link.target as Node).id
					: String(link.target);

			if (sourceId === nodeId || targetId === nodeId) {
				connectedLinks.push(link);
				connectedNodes.add(sourceId);
				connectedNodes.add(targetId);
			}
		});

		return { connectedNodes, connectedLinks };
	}

	private highlightConnectedNodes(nodeId: string) {
		this.isHighlighting = true;

		const { connectedNodes } = this.getConnectedElements(nodeId);
		// Always include the hovered node itself in the connected nodes
		connectedNodes.add(nodeId);
		this.createOverlay();

		// Enhanced node highlighting with better visual feedback
		this.nodeSelection
			?.interrupt() // Stop any ongoing transitions
			.style("opacity", (d) => {
				const isConnected = connectedNodes.has(d.id);
				return isConnected ? 1 : 0.15; // More contrast
			})
			.style("filter", (d) => {
				const isConnected = connectedNodes.has(d.id);
				if (isConnected) {
					const nodeColor = this.getNodeColor(d.id);
					return this.theme === "dark"
						? `drop-shadow(0 0 16px ${nodeColor}88) drop-shadow(0 4px 12px rgba(0, 0, 0, 0.4))`
						: `drop-shadow(0 0 20px ${nodeColor}66) drop-shadow(0 4px 16px rgba(0, 0, 0, 0.2))`;
				}
				return "none";
			})
			.transition()
			.duration(200)
			.attr("r", (d) => {
				const isConnected = connectedNodes.has(d.id);
				return isConnected ? this.nodeSize * 1.1 : this.nodeSize * 0.9;
			});

		// Enhanced link highlighting with dynamic colors and thickness
		this.linkSelection
			?.interrupt() // Stop any ongoing transitions
			.style("opacity", (d) => {
				const sourceId =
					typeof d.source === "object"
						? (d.source as Node).id
						: String(d.source);
				const targetId =
					typeof d.target === "object"
						? (d.target as Node).id
						: String(d.target);
				const isConnected = sourceId === nodeId || targetId === nodeId;
				return isConnected ? 0.9 : 0.08; // More dramatic contrast
			})
			.style("stroke", (d) => {
				const sourceId =
					typeof d.source === "object"
						? (d.source as Node).id
						: String(d.source);
				const targetId =
					typeof d.target === "object"
						? (d.target as Node).id
						: String(d.target);
				const isConnected = sourceId === nodeId || targetId === nodeId;

				if (isConnected) {
					// Use the source node color for the link
					const sourceColor = this.getNodeColor(sourceId);
					return sourceColor;
				}
				return this.theme === "dark" ? "#334155" : "#cbd5e1";
			})
			.style("stroke-width", (d) => {
				const sourceId =
					typeof d.source === "object"
						? (d.source as Node).id
						: String(d.source);
				const targetId =
					typeof d.target === "object"
						? (d.target as Node).id
						: String(d.target);
				const isConnected = sourceId === nodeId || targetId === nodeId;
				return isConnected
					? this.lineThickness * 2 // More dramatic thickness
					: this.lineThickness * 0.5;
			})
			.style("filter", (d) => {
				const sourceId =
					typeof d.source === "object"
						? (d.source as Node).id
						: String(d.source);
				const targetId =
					typeof d.target === "object"
						? (d.target as Node).id
						: String(d.target);
				const isConnected = sourceId === nodeId || targetId === nodeId;

				if (isConnected) {
					const sourceColor = this.getNodeColor(sourceId);
					return `drop-shadow(0 0 6px ${sourceColor}44)`;
				}
				return "none";
			});

		// Enhanced label highlighting
		this.labelSelection
			?.interrupt() // Stop any ongoing transitions
			.style("opacity", (d) =>
				connectedNodes.has(d.id) ? this.textFade : this.textFade * 0.15
			)
			.style("font-weight", (d) =>
				connectedNodes.has(d.id) ? "600" : "400"
			)
			.style("font-size", (d) =>
				connectedNodes.has(d.id) ? "12px" : "11px"
			)
			.style("filter", (d) => {
				const isConnected = connectedNodes.has(d.id);
				if (isConnected) {
					// Enhanced text shadow for connected labels (including hovered node)
					return this.theme === "dark"
						? "drop-shadow(0 0 4px rgba(255, 255, 255, 0.4))"
						: "drop-shadow(0 0 4px rgba(0, 0, 0, 0.3))";
				} else {
					// Blur effect for non-connected labels
					return "blur(1px) opacity(0.5)";
				}
			});
	}

	private clearHighlighting() {
		if (!this.isHighlighting) return;
		this.isHighlighting = false;
		this.removeOverlay();

		// Smooth transition back to normal state
		this.nodeSelection
			?.interrupt() // Stop any ongoing transitions
			.transition()
			.duration(300)
			.style("opacity", 1)
			.style(
				"filter",
				this.theme === "dark"
					? "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) drop-shadow(0 0 0 1px rgba(255, 255, 255, 0.05))"
					: "drop-shadow(0 4px 12px rgba(0, 0, 0, 0.15)) drop-shadow(0 0 0 1px rgba(0, 0, 0, 0.05))"
			)
			.attr("r", this.nodeSize);

		this.linkSelection
			?.interrupt() // Stop any ongoing transitions
			.transition()
			.duration(250)
			.style("opacity", 0.7)
			.style("stroke", this.theme === "dark" ? "#334155" : "#cbd5e1")
			.style("stroke-width", this.lineThickness)
			.style("filter", "none");

		this.labelSelection
			?.interrupt() // Stop any ongoing transitions
			.transition()
			.duration(250)
			.style("opacity", this.textFade)
			.style("font-weight", "500")
			.style("font-size", "11px")
			.style("filter", "none"); // Remove any blur effects
	}

	private createOverlay() {
		if (this.overlayEl) return;

		const overlay = document.createElement("div");
		overlay.style.position = "fixed";
		overlay.style.top = "0";
		overlay.style.left = "0";
		overlay.style.width = "100vw";
		overlay.style.height = "100vh";
		overlay.style.backgroundColor =
			this.theme === "dark" ? "rgba(0, 0, 0, 0.7)" : "rgba(0, 0, 0, 0.6)"; // Slightly stronger overlay
		overlay.style.pointerEvents = "none";
		overlay.style.zIndex = "1";
		overlay.style.transition = "opacity 0.3s ease-in-out";
		overlay.style.backdropFilter = "blur(2px)"; // Add subtle blur

		document.body.appendChild(overlay);
		this.overlayEl = overlay;
	}

	private removeOverlay() {
		if (this.overlayEl && this.overlayEl.parentElement) {
			this.overlayEl.parentElement.removeChild(this.overlayEl);
			this.overlayEl = null;
		}
	}

	private animateEntrance() {
		this.setHasAnimeted(true);

		// Enhanced link entrance animation with staggered timing
		this.linkSelection
			?.style("opacity", 0)
			.style("stroke-dasharray", "5,5")
			.style("stroke-dashoffset", "10")
			.transition()
			.duration(1800)
			.delay((_d, i) => i * 80)
			.ease(d3.easeBackOut.overshoot(1.2))
			.style("opacity", 0.7)
			.style("stroke-dasharray", "0,0")
			.style("stroke-dashoffset", "0");

		// Enhanced node entrance animation with elastic effect
		this.nodeSelection
			?.style("opacity", 0)
			.transition()
			.duration(2200)
			.delay((_d, i) => i * 120)
			.ease(d3.easeElasticOut.amplitude(1.8).period(0.5))
			.attr("r", this.nodeSize)
			.style("opacity", 1);

		// Enhanced label entrance animation with bounce effect
		this.labelSelection
			?.style("opacity", 0)
			.style("transform", "translateY(10px)")
			.transition()
			.duration(2000)
			.delay((_d, i) => i * 120 + 400)
			.ease(d3.easeBounceOut)
			.style("opacity", this.textFade)
			.style("transform", "translateY(0px)");
	}
}
