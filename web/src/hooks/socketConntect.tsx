import { useEffect } from "react";
import { io } from "socket.io-client";
import { toast } from "sonner";
import { playAudio } from "@/lib/audios";
import { GameState, type TypedSocket } from "@/lib/types";
import useGameStore from "@/store/gameStore";
import useSocketStore from "@/store/socketStore";

const ATTEMPTS = 2;
/**
 * makes connection to the socket server.
 *  and makes connection value globally available.
 */
const useConnectSocket = () => {
	const url = import.meta.env.VITE_SERVER_URL as string | undefined;
	const { setSocket, setIsConnected } = useSocketStore();
	const { setGameState, setEnterGame, setPlayers, setJoinGame } =
		useGameStore();

	useEffect(() => {
		if (!url) {
			throw new Error("VITE_SERVER_URL is not defined");
		}

		const socket = io(url, {
			autoConnect: false,
			reconnection: true,
			reconnectionAttempts: ATTEMPTS,
		}) as TypedSocket;

		let retry = 0;
		setSocket(socket);

		socket.on("connect", () => setIsConnected(true));

		socket.on("wsError", (err) => toast.error(err));

		socket.on("roomCreated", ({ roomId, players, hostId }) => {
			window.history.replaceState({}, document.title, window.location.origin);
			setEnterGame(roomId, players, hostId);
			playAudio("join");
		});

		// listen for room join confirmation
		socket.on(
			"roomJoined",
			(roomData) => {
				setJoinGame(roomData);
				playAudio("join");
			},
			// setEnterGame(GameState.WAITING, roomId, players, false, hostId),
		);

		socket.on("roomMembers", (data) => setPlayers(data));

		socket.on("disconnect", () => {
			console.log("disconnected");
			setIsConnected(false);
			setGameState(GameState.ONBOARDING);
		});

		socket.on("connect_error", () => {
			if (retry === ATTEMPTS) {
				toast.error("unable to connect to server");
				setGameState(GameState.ONBOARDING);
				retry = 0;
			} else retry++;
		});

		return () => {
			socket.off("connect");
			socket.off("wsError");
			socket.off("roomCreated");
			socket.off("roomJoined");
			socket.off("roomMembers");
			socket.off("disconnect");
			socket.off("connect_error");
			socket.close();
			setSocket(null);
			setIsConnected(false);
		};
	}, [
		setSocket,
		setIsConnected,
		setGameState,
		setEnterGame,
		setPlayers,
		setJoinGame,
	]);
};

export default useConnectSocket;
