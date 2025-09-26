import { create } from "zustand";
import type { User } from "../types/apiResponse";

interface userStore {
	user: User | null;
	setUser: (val: User) => void;
}

export const useUserStore = create<userStore>()((set) => ({
	user: null,
	setUser: (val) => {
		set(() => ({
			user: val,
		}));
	},
}));
