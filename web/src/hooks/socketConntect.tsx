import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { GameState, type TypedSocket } from "@/lib/types";
import useRoomStore from "@/store/roomStore";
import useSocketStore from "@/store/socketStore";

/**
 * makes connection to the socket server.
 *  and makes connection value globally available.
 */
const useConnectSocket = () => {
	const url = import.meta.env.VITE_SERVER_URL as string | undefined;
	const { setSocket, setIsConnected } = useSocketStore();
	const { setGameState, setEnterGame } = useRoomStore();

	useEffect(() => {
		if (!url) {
			throw new Error("VITE_SERVER_URL is not defined");
		}

		const socket = io(url, {
			autoConnect: false,
			reconnection: true,
			reconnectionDelay: 1000,
		}) as TypedSocket;

		setSocket(socket);

		socket.on("connect", () => setIsConnected(true));

		socket.on("wsError", (err) => toast.error(err));

		socket.on("roomCreated", (roomId, players) => {
			window.history.replaceState({}, document.title, window.location.origin);
			setEnterGame(GameState.WAITING, roomId, true, players);
		});

		// listen for room join confirmation
		socket.on("roomJoined", (roomId, players) =>
			setEnterGame(GameState.WAITING, roomId, false, players),
		);

		socket.on("disconnect", () => {
			setSocket(null);
			setIsConnected(false);
			setGameState(GameState.ONBOARDING);
		});

		return () => {
			socket.off("connect");
			socket.off("wsError");
			socket.off("roomCreated");
			socket.off("roomJoined");
			socket.off("disconnect");
			socket.close();
			setSocket(null);
			setIsConnected(false);
		};
	}, [setSocket, setIsConnected, setGameState, setEnterGame]);
};

export default useConnectSocket;
