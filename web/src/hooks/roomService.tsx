import { useEffect } from "react";
import { GameState, type Player } from "@/lib/types";
import useRoomStore from "@/store/roomStore";
import useSocketStore from "@/store/socketStore";

type RoomJoinedData = {
	roomId: string;
	players: Player[];
};

export const useRoomService = () => {
	const { socket, wsEmit } = useSocketStore();
	const { setEnterGame } = useRoomStore();

	useEffect(() => {
		if (!socket || socket.hasListeners("room-created")) return;

		// listen for room creation confirmation
		socket.on("room-created", ({ roomId, players }: RoomJoinedData) => {
			window.history.replaceState({}, document.title, window.location.origin);
			setEnterGame(GameState.WAITING, roomId, true, players);
		});

		// listen for room join confirmation
		socket.on("room-joined", ({ roomId, players }: RoomJoinedData) =>
			setEnterGame(GameState.WAITING, roomId, false, players),
		);

		// listen for quick room join confirmation
		socket.on("quick-room-joined", ({ roomId, players }: RoomJoinedData) =>
			setEnterGame(GameState.PLAYING, roomId, false, players),
		);

		return () => {
			socket.off("room-created");
			socket.off("room-joined");
			socket.off("quick-room-joined");
		};
	}, [socket, setEnterGame]);

	const joinRoom = (name: string, roomId: string) =>
		wsEmit("join-room", { name, roomId });

	const createRoom = (name: string) => wsEmit("create-room", { name });

	return { createRoom, joinRoom };
};
