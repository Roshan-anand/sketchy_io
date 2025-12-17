import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import type { TypedSocket } from "@/lib/types";
import useSocketStore from "@/store/socketStore";

/**
 * makes connection to the socket server.
 *  and makes connection value globally available.
 */
const ConnectSocket = () => {
	const url = import.meta.env.VITE_SERVER_URL as string | undefined;
	const { setSocket, setIsConnected, setOnlinePlayers } = useSocketStore();

	useEffect(() => {
		if (!url) {
			throw new Error("VITE_SERVER_URL is not defined");
		}

		const socket = io(url) as TypedSocket;

		socket.on("connect", () => {
			setSocket(socket);
			setIsConnected(true);
		});

		socket.on("playersOnline", (data) => setOnlinePlayers(data));
		socket.on("wsError", (err) => toast.error(err));

		socket.on("disconnect", () => {
			setSocket(null);
			setIsConnected(false);
		});

		return () => {
			socket.off("connect");
			socket.off("disconnect");
			socket.off("playersOnline");
			socket.off("wsError");
			socket.close();
			setIsConnected(false);
		};
	}, [setSocket, setIsConnected, setOnlinePlayers]);
};

export default ConnectSocket;
