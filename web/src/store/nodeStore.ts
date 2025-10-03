import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
import * as d3 from "d3";

export interface Node extends d3.SimulationNodeDatum {
	id: string;
	label: string;
}
export interface Link extends d3.SimulationLinkDatum<d3.SimulationNodeDatum> {
	source: string;
	destination: string;
	value: number;
}
export interface NodeStore {
	data: {
		nodes: Node[];
		links: Link[];
		degrees: Map<string, { indeg: number; outdeg: number }>;
	};
	addNode: (node: string) => void;
	addLink: (link: Link) => void;
	deleteNode: (id: string) => void;
	deleteLinks: (id: string) => void;
	clear: () => void;
}

export const useNodeStore = create<NodeStore>()(
	persist(
		(set) => ({
			data: { nodes: [], links: [], degrees: new Map() },
			addNode: (node: string) => {
				set((state) => ({
					data: {
						...state.data,
						nodes: [...state.data.nodes, { id: node, label: node }],
						degrees: new Map([
							...state.data.degrees,
							[node, { indeg: 0, outdeg: 0 }],
						]),
					},
				}));
			},
			addLink: (link: Link) => {
				set((state) => {
					if (
						state.data.links.some(
							(l) =>
								l.source === link.source &&
								l.destination === link.destination
						)
					) {
						return state;
					}
					const nodes = [...state.data.nodes];
					const ensureNode = (id: string) => {
						if (!nodes.some((n) => n.id === id)) {
							nodes.push({ id, label: id });
							state.data.degrees.set(id, { indeg: 0, outdeg: 0 });
						}
					};
					ensureNode(link.source);
					ensureNode(link.destination);

					return {
						data: {
							nodes,
							links: [...state.data.links, link],
							degrees: new Map([
								...state.data.degrees,
								[
									link.source,
									{
										indeg: state.data.degrees.get(
											link.source
										)!.indeg,
										outdeg:
											state.data.degrees.get(link.source)!
												.outdeg + 1,
									},
								],
								[
									link.destination,
									{
										indeg:
											state.data.degrees.get(
												link.destination
											)!.indeg + 1,
										outdeg: state.data.degrees.get(
											link.destination
										)!.outdeg,
									},
								],
							]),
						},
					};
				});
			},
			deleteNode: (id: string) => {
				set((state) => ({
					data: {
						...state.data,
						nodes: state.data.nodes.filter((node) => node.id != id),
						degrees: (() => {
							const newDegrees = new Map(state.data.degrees);
							newDegrees.delete(id);
							return newDegrees;
						})(),
					},
				}));
			},
			deleteLinks: (id: string) => {
				set((state) => ({
					data: {
						...state.data,
						links: state.data.links.filter((link) => {
							if (link.source === id || link.destination === id) {
								return false;
							}
							return true;
						}),
					},
				}));
			},
			clear: () => {
				set(() => ({
					data: { nodes: [], links: [], degrees: new Map() },
				}));
			},
		}),
		{
			name: "node-storage",
			partialize: (state) => ({
				data: {
					...state.data,
					degrees: Object.fromEntries(state.data.degrees), // Convert Map to Object for serialization
				},
			}),
			onRehydrateStorage: () => (state) => {
				// Convert the deserialized Object back to Map
				if (
					state?.data?.degrees &&
					!(state.data.degrees instanceof Map)
				) {
					state.data.degrees = new Map(
						Object.entries(state.data.degrees as any)
					);
				}
			},
		}
	)
);

export interface attributeStore {
	textFade: number;
	nodeSize: number;
	lineThickness: number;
	centerForces: number;
	repelForces: number;
	linkForces: number;
	linkDistance: number;

	setTextFade: (fade: number) => void;
	setNodeSize: (size: number) => void;
	setLineThickness: (thickness: number) => void;
	setCenterForces: (force: number) => void;
	setRepelForces: (force: number) => void;
	setLinkForces: (force: number) => void;
	setLinkDistance: (distance: number) => void;
}

export const useAttributeStore = create<attributeStore>()(
	subscribeWithSelector((set) => ({
		textFade: 0.0,
		nodeSize: 1.5,
		lineThickness: 1.0,
		centerForces: 0.6,
		repelForces: 10,
		linkForces: 1.0,
		linkDistance: 250,

		setTextFade: (fade) => set({ textFade: fade }),
		setNodeSize: (size) => set({ nodeSize: size }),
		setLineThickness: (thickness) => set({ lineThickness: thickness }),
		setCenterForces: (force) => set({ centerForces: force }),
		setRepelForces: (force) => set({ repelForces: force }),
		setLinkForces: (force) => set({ linkForces: force }),
		setLinkDistance: (distance) => set({ linkDistance: distance }),
	}))
);

export interface animatedStore {
	hasanimated: boolean;
	setHasanimated: (animate: boolean) => void;
}
export const useAnimatedStore = create<animatedStore>()(
	subscribeWithSelector((set) => ({
		hasanimated: false,
		setHasanimated: (animate: boolean) => set({ hasanimated: animate }),
	}))
);
