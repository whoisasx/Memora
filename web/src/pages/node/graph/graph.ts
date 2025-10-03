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
	private nodeSize: number = useAttributeStore.getState().nodeSize * 4;
	private lineThickness: number =
		useAttributeStore.getState().lineThickness * 1.25;
	private centerForces: number = useAttributeStore.getState().centerForces;
	private linkForces: number = useAttributeStore.getState().linkForces;
	private repelForces: number = useAttributeStore.getState().repelForces * 10;
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
			// Isolated node (no connections)
			return this.theme === "dark" ? "#6b7280" : "#9ca3af"; // Gray
		} else if (indeg === 0 && outdeg > 0) {
			// Source node (only outgoing connections)
			return this.theme === "dark" ? "#059669" : "#10b981"; // Green
		} else if (indeg > 0 && outdeg === 0) {
			// Sink node (only incoming connections)
			return this.theme === "dark" ? "#d97706" : "#f59e0b"; // Orange
		} else {
			// Hub node (both incoming and outgoing connections)
			return this.theme === "dark" ? "#2563eb" : "#3b82f6"; // Blue
		}
	}

	private hexToRgba(hex: string, alpha: number) {
		if (!hex) return `rgba(100,116,139,${alpha})`;
		let h = hex.replace("#", "").trim();
		if (h.length === 3) {
			h = h
				.split("")
				.map((c) => c + c)
				.join("");
		}
		if (h.length !== 6) return `rgba(100,116,139,${alpha})`;
		const r = parseInt(h.substring(0, 2), 16);
		const g = parseInt(h.substring(2, 4), 16);
		const b = parseInt(h.substring(4, 6), 16);
		return `rgba(${r},${g},${b},${alpha})`;
	}

	drawGraph() {
		this.svg.selectAll("*").remove();

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

		this.linkSelection = this.svg
			.append("g")
			.attr("stroke", "#aaa")
			.selectAll("line")
			.data(this.links)
			.join("line")
			.attr("stroke-width", this.lineThickness);

		this.nodeSelection = this.svg
			.append("g")
			.selectAll<SVGCircleElement, Node>("circle")
			.data(this.nodes)
			.join("circle")
			.attr("r", 0)
			.attr("fill", (d) => this.getNodeColor(d.id))
			.style("cursor", "pointer")
			.style("opacity", 0)
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
						this.highlightConnectedNodes(d.id);
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

		this.labelSelection = this.svg
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
							content.description.slice(0, 10) +
							(content.description.length > 10 ? "..." : "")
						);
					}
				}
				return node.id.slice(0, 8) + (node.id.length > 8 ? "..." : "");
			})
			.attr("font-size", 12)
			.attr("dy", -15)
			.attr("opacity", 0);
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
		}, 500);

		d3.select(event.currentTarget as SVGCircleElement)
			.transition()
			.duration(200)
			.attr("r", this.nodeSize * 1.25);
		this.showPreviewCard(event as MouseEvent, d.id);
	}
	handleMouseMove(event: MouseEvent, _d: Node) {
		if (this.isDragging) return;
		this.updatePreviewCardPosition(event);
	}
	handleMouseOut(event: MouseEvent, _d: Node) {
		this.currentHoveredNode = null;
		this.clearHoverTimeout();
		this.clearHighlighting();

		d3.select(event.currentTarget as SVGCircleElement)
			.transition()
			.duration(150)
			.attr("r", this.nodeSize);
		setTimeout(() => {
			this.hidePreviewCard();
		}, 2000);
	}

	private ensurePreviewEl() {
		if (this.previewEl) return;
		const el = document.createElement("div");
		el.style.position = "absolute";
		el.style.pointerEvents = "auto";
		el.style.width = "200px";
		el.style.height = "120px";
		el.style.borderRadius = "8px";
		el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.15)";
		el.style.zIndex = "9999";
		el.style.display = "none";
		el.style.backgroundSize = "cover";
		el.style.backgroundPosition = "center";
		el.style.backgroundRepeat = "no-repeat";
		el.style.overflow = "hidden";

		if (this.theme === "dark") {
			el.style.backgroundColor = "#0f1724";
		} else {
			el.style.backgroundColor = "#ffffff";
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
				? "rgba(15, 23, 36, 0.9)"
				: "rgba(255, 255, 255, 0.9)";
		overlay.style.padding = "8px";
		overlay.style.backdropFilter = "blur(4px)";
		overlay.style.display = "flex";
		overlay.style.justifyContent = "space-between";
		overlay.style.alignItems = "center";
		overlay.style.gap = "8px";
		el.appendChild(overlay);

		const desc = document.createElement("div");
		desc.className = "preview-desc";
		desc.style.fontSize = "11px";
		desc.style.lineHeight = "1.3";
		desc.style.flex = "1";
		desc.style.overflow = "hidden";
		desc.style.textOverflow = "ellipsis";
		desc.style.whiteSpace = "nowrap";
		desc.style.color = this.theme === "dark" ? "#e6edf3" : "#0f1724";
		overlay.appendChild(desc);

		const openBtn = document.createElement("button");
		openBtn.innerHTML = "🔗"; // Link icon
		openBtn.style.width = "24px";
		openBtn.style.height = "24px";
		openBtn.style.borderRadius = "4px";
		openBtn.style.border = "none";
		openBtn.style.cursor = "pointer";
		openBtn.style.fontSize = "12px";
		openBtn.style.display = "flex";
		openBtn.style.alignItems = "center";
		openBtn.style.justifyContent = "center";
		openBtn.style.flexShrink = "0";
		openBtn.className = "preview-open-btn";
		if (this.theme === "dark") {
			openBtn.style.background = "#1f6feb";
			openBtn.style.color = "#fff";
		} else {
			openBtn.style.background = "#2563eb";
			openBtn.style.color = "#fff";
		}
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
		descEl.textContent = content?.description || "No description";
		openBtn.onclick = (ev) => {
			ev.stopPropagation();
			if (content && content.url) {
				window.open(content.url, "_blank");
			}
		};

		this.previewEl.style.backgroundImage = "";
		this.previewEl.style.backgroundColor = "";
		if (content && content.url_data && content.url_data.thumbnail) {
			this.previewEl.style.backgroundImage = `url(${content.url_data.thumbnail})`;
		} else {
			const base =
				content && (content as any).color
					? (content as any).color
					: this.theme === "dark"
					? "#0f1724"
					: "#ffffff";
			const c1 = this.hexToRgba(base, 0.3);
			const c2 = this.hexToRgba(base, 0.8);
			this.previewEl.style.backgroundImage = `linear-gradient(135deg, ${c2}, ${c1})`;
		}
		this.previewEl.style.display = "block";
		this.updatePreviewCardPosition(event);
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
		this.previewEl.style.display = "none";
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
		this.createOverlay();
		this.nodeSelection
			?.style("opacity", (d) => {
				const isConnected = connectedNodes.has(d.id);
				return isConnected ? 1 : 0.2;
			})
			.style("filter", (d) => {
				const isConnected = connectedNodes.has(d.id);
				return isConnected
					? "drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))"
					: "none";
			});
		this.linkSelection
			?.style("opacity", (d) => {
				const sourceId =
					typeof d.source === "object"
						? (d.source as Node).id
						: String(d.source);
				const targetId =
					typeof d.target === "object"
						? (d.target as Node).id
						: String(d.target);
				const isConnected = sourceId === nodeId || targetId === nodeId;
				return isConnected ? 1 : 0.1;
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
				return isConnected
					? this.theme === "dark"
						? "#3b82f6"
						: "#2563eb"
					: "#aaa";
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
					? this.lineThickness * 1.5
					: this.lineThickness;
			});
		this.labelSelection
			?.style("opacity", (d) =>
				connectedNodes.has(d.id) ? this.textFade : this.textFade * 0.2
			)
			.style("font-weight", (d) =>
				connectedNodes.has(d.id) ? "600" : "400"
			);
	}

	private clearHighlighting() {
		if (!this.isHighlighting) return;
		this.isHighlighting = false;
		this.removeOverlay();
		this.nodeSelection?.style("opacity", 1).style("filter", "none");
		this.linkSelection
			?.style("opacity", 1)
			.style("stroke", "#aaa")
			.style("stroke-width", this.lineThickness);
		this.labelSelection
			?.style("opacity", this.textFade)
			.style("font-weight", "400");
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
			this.theme === "dark" ? "rgba(0, 0, 0, 0.6)" : "rgba(0, 0, 0, 0.5)";
		overlay.style.pointerEvents = "none";
		overlay.style.zIndex = "1";
		overlay.style.transition = "opacity 0.2s ease-in-out";

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
		this.linkSelection
			?.style("opacity", 0)
			.transition()
			.duration(2000)
			.delay((_d, i) => i * 100)
			.ease(d3.easeElasticOut.amplitude(1.7).period(0.3))
			.style("opacity", 1);

		this.nodeSelection
			?.transition()
			.duration(2000)
			.delay((_d, i) => i * 100)
			.ease(d3.easeElasticOut.amplitude(1.5).period(0.4))
			.attr("r", this.nodeSize)
			.style("opacity", 1);

		this.labelSelection
			?.style("opacity", 0)
			.transition()
			.duration(1800)
			.delay((_d, i) => i * 100 + 300)
			.ease(d3.easeBackOut.overshoot(1.7))
			.style("opacity", this.textFade);
	}
}
