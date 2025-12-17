import { create } from "zustand";
import type { TypedSocket } from "@/lib/types";

type ws = TypedSocket | null;
type Store = {
	socket: ws;
	setSocket: (socket: ws) => void;
	isConnected: boolean;
	setIsConnected: (status: boolean) => void;
	onlinePlayers: number;
	setOnlinePlayers: (count: number) => void;
};

const useSocketStore = create<Store>()((set) => ({
	socket: null,
	setSocket: (socket) => set({ socket }),
	isConnected: false,
	setIsConnected: (status) => set({ isConnected: status }),
	onlinePlayers: 0,
	setOnlinePlayers: (count) => set({ onlinePlayers: count }),
}));

export default useSocketStore;
