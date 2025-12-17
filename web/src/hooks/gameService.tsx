import { useEffect } from "react";
import useRoomStore from "@/store/roomStore";
import useSocketStore from "@/store/socketStore";

export const useGameService = () => {
	const { socket } = useSocketStore();
	const { setPlayers } = useRoomStore();

	useEffect(() => {
		if (!socket || socket.hasListeners("roomMembers")) return;

		socket.on("roomMembers", (data) => setPlayers(data));

		return () => {
			socket.off("roomMembers");
		};
	}, [socket, setPlayers]);
};
