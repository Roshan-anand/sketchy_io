import { useEffect } from "react";
import { GameState } from "@/lib/types";
import { socketConErr } from "@/lib/utils";
import useRoomStore from "@/store/roomStore";
import useSocketStore from "@/store/socketStore";

export const useRoomService = () => {
	const { socket } = useSocketStore();
	const { setEnterGame } = useRoomStore();

	useEffect(() => {
		if (!socket || socket.hasListeners("roomCreated")) return;

		// listen for room creation confirmation
		socket.on("roomCreated", (roomId, players) => {
			window.history.replaceState({}, document.title, window.location.origin);
			setEnterGame(GameState.WAITING, roomId, true, players);
		});

		// listen for room join confirmation
		socket.on("roomJoined", (roomId, players) =>
			setEnterGame(GameState.WAITING, roomId, false, players),
		);

		// listen for quick room join confirmation
		// socket.on("quick-room-joined", ({ roomId, players }: RoomJoinedData) =>
		// 	setEnterGame(GameState.PLAYING, roomId, false, players),
		// );

		return () => {
			// wsOff("quick-room-joined");
			socket.off("roomCreated");
			socket.off("roomJoined");
		};
	}, [socket, setEnterGame]);

	const joinRoom = (name: string, roomId: string) => {
		if (!socket) socketConErr();
		else socket.emit("joinRoom", name, roomId);
	};

	const createRoom = (name: string) => {
		if (!socket) socketConErr();
		else socket.emit("createRoom", name);
	};

	return { createRoom, joinRoom };
};
