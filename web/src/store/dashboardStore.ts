import { create } from "zustand";
import type { Content } from "../types/apiResponse";
import { persist } from "zustand/middleware";

interface DashBoardStore {
	contents: Content[];
	setContents: (contents: Content[]) => void;
	addContent: (content: Content) => void;
	updateContent: (id: string, updates: Partial<Content>) => void;
	deleteContent: (id: string) => void;

	children: string[];
	setChildren: (children: string[]) => void;
	addChild: (child: string) => void;
	deleteChild: (child: string) => void;

	selectedFilter: "all" | "favorits" | "recent" | "trash" | "hot";
	setSelectedFilter: (
		filter: "all" | "favorits" | "recent" | "trash" | "hot"
	) => void;

	viewMode: "grid" | "list";
	setViewMode: (mode: "grid" | "list") => void;

	createModelOpen: boolean;
	setCreateModelOpen: (open: boolean) => void;
	addChildModelOpen: boolean;
	setAddChildModelOpen: (open: boolean) => void;

	searchQuery: string;
	setSearchQuery: (query: string) => void;
	aiEnabled: boolean;
	setAiEnabled: (enable: boolean) => void;
	searchedContents: string[];
	setSearchedContents: (contents: string[]) => void;
	contentsFound: boolean;
	setContentsFound: (found: boolean) => void;

	notifications: Array<{
		id: string;
		title: string;
		message: string;
		type: "info" | "success" | "warning" | "error";
		read: boolean;
		createdAt: Date;
	}>;
	addNotification: (
		notification: Omit<
			DashBoardStore["notifications"][0],
			"id" | "createdAt"
		>
	) => void;
	markNotificationAsRead: (id: string) => void;
	clearAllNotifications: () => void;
}

export const useDashboardStore = create<DashBoardStore>()(
	persist(
		(set) => ({
			contents: [],
			setContents: (contents: Content[]) => set({ contents }),
			addContent: (content: Content) =>
				set((state: { contents: Content[] }) => ({
					contents: [...state.contents, content],
				})),
			updateContent: (id: string, updates: Partial<Content>) =>
				set((state: { contents: Content[] }) => ({
					contents: state.contents.map((content: Content) =>
						content.id === id ? { ...content, ...updates } : content
					),
				})),
			deleteContent: (id: string) =>
				set((state: { contents: Content[] }) => ({
					contents: state.contents.filter(
						(content: Content) => content.id !== id
					),
				})),

			children: [],
			setChildren: (children: string[]) => set({ children }),
			addChild: (child: string) =>
				set((state: { children: string[] }) => ({
					children: [...state.children, child],
				})),
			deleteChild: (child: string) =>
				set((state: { children: string[] }) => ({
					children: state.children.filter((c: string) => c !== child),
				})),

			selectedFilter: "all",
			setSelectedFilter: (
				filter: "all" | "favorits" | "recent" | "trash" | "hot"
			) => set({ selectedFilter: filter }),

			viewMode: "grid",
			setViewMode: (mode: "grid" | "list") => set({ viewMode: mode }),

			createModelOpen: false,
			setCreateModelOpen: (open: boolean) =>
				set({ createModelOpen: open }),
			addChildModelOpen: false,
			setAddChildModelOpen: (open: boolean) =>
				set({ addChildModelOpen: open }),

			searchQuery: "",
			setSearchQuery: (query: string) => set({ searchQuery: query }),
			aiEnabled: false,
			setAiEnabled: (enable: boolean) => set({ aiEnabled: enable }),
			searchedContents: [],
			setSearchedContents: (contents: string[]) =>
				set({ searchedContents: contents }),
			contentsFound: false,
			setContentsFound: (found: boolean) => set({ contentsFound: found }),

			notifications: [],
			addNotification: (
				notification: Omit<
					DashBoardStore["notifications"][0],
					"id" | "createdAt"
				>
			) =>
				set(
					(state: {
						notifications: DashBoardStore["notifications"];
					}) => ({
						notifications: [
							{
								...notification,
								id: Math.random().toString(36).slice(2, 11),
								createdAt: new Date(),
							},
							...state.notifications,
						],
					})
				),
			markNotificationAsRead: (id: string) =>
				set(
					(state: {
						notifications: DashBoardStore["notifications"];
					}) => ({
						notifications: state.notifications.map((notification) =>
							notification.id === id
								? { ...notification, read: true }
								: notification
						),
					})
				),
			clearAllNotifications: () => set({ notifications: [] }),
		}),
		{
			name: "dashboard-storage",
		}
	)
);
