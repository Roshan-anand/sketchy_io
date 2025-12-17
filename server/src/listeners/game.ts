import { GameRooms, HubUsers, io } from "../config/socket";
import { GameStatus, type TypedScoket } from "../lib/types";
import { emitErr } from "./utils";

export const gameListeners = (ws: TypedScoket) => {
	// chat message from client
	ws.on("chatMsg", (msg) => {
		const user = HubUsers.get(ws.id);
		if (!user) {
			emitErr(ws, "somthing went wrong.");
			return;
		}

		const { name, roomId } = user;
		const room = GameRooms.get(roomId);
		if (!room) {
			emitErr(ws, "You are not in a valid room.");
			return;
		}

		// check if the msg is the correct word
		let isValid = false;
		if (room.status === GameStatus.IN_PROGRESS) {
			if (msg.toLowerCase() === room.word.toLowerCase()) {
				isValid = true;
				// other logic if correct ( update score, reduce time, etc. )
			}
		}

		io.in(roomId).emit("chatMsg", { name, msg, isValid });
	});

	ws.on("startGame", (data) => {
		const roomId = HubUsers.get(ws.id)?.roomId as string;
		const room = GameRooms.get(roomId);
		if (!room) {
			emitErr(ws, "You are not in a valid room.");
			return;
		}
		room.settings = data;
		room.status = GameStatus.IN_PROGRESS;
	});
};
