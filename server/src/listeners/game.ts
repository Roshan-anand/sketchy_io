import { GameRooms, io } from "../config/socket";
import { GameStatus, type TypedScoket } from "../lib/types";
import { emitErr } from "./utils";

export const gameListeners = (ws: TypedScoket) => {
	// chat message from client
	ws.on("chatMsg", (msg) => {
		const { name, roomId } = ws.data;
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
		const room = GameRooms.get(ws.data.roomId);
		if (!room) {
			emitErr(ws, "You are not in a valid room.");
			return;
		}
		room.settings = data;
		room.status = GameStatus.IN_PROGRESS;
	});
};
