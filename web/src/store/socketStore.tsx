import type { Socket } from "socket.io-client";
import { create } from "zustand";
import { socketConErr } from "@/lib/utils";

type ws = Socket | null;
type Store = {
	socket: ws;
	setSocket: (socket: ws) => void;
	isConnected: boolean;
	setIsConnected: (status: boolean) => void;
	onlinePlayers: number;
	setOnlinePlayers: (count: number) => void;
	wsEmit: (event: string, data: object | string) => void;
};

const useSocketStore = create<Store>()((set, get) => ({
	socket: null,
	setSocket: (socket) => set({ socket }),
	isConnected: false,
	setIsConnected: (status) => set({ isConnected: status }),
	onlinePlayers: 0,
	setOnlinePlayers: (count) => set({ onlinePlayers: count }),
	wsEmit: (event, data) => {
		const { socket } = get();
		if (!socket) socketConErr();
		else socket.emit(event, data);
	},
}));

export default useSocketStore;
