import { GameRooms, io } from "../config/socket";
import type { TypedScoket } from "../lib/types";
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
		const mode = room.vallidateWord(msg);

		io.in(roomId).emit("chatMsg", {
			name,
			msg,
			mode,
		});
	});

	// to start the game
	ws.on("startGame", async (settings) => {
		const room = GameRooms.get(ws.data.roomId);
		if (!room) {
			emitErr(ws, "You are not in a valid room.");
			return;
		}
		room.settings = settings;
		room.startGame();
	});

	// to handle choice made by drawer
	ws.on("choiceMade", (word) => {
		const room = GameRooms.get(ws.data.roomId);
		if (!room) {
			emitErr(ws, "You are not in a valid room.");
			return;
		}
		room.startMatch(word, ws.id);
	});
};
