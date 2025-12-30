import { GameRooms } from "../config/socket";
import type { TypedScoket } from "../lib/types";
import { emitErr } from "./utils";

export const gameListeners = (ws: TypedScoket) => {
	// chat message from client
	ws.on("chatMsg", (msg) => {
		const { roomId, name } = ws.data;
		const room = GameRooms.get(roomId);
		if (!room) {
			emitErr(ws, "You are not in a valid room.");
			return;
		}

		room.validateWord(msg, name, ws.id); // vlidate the message
	});

	ws.on("updateSettings", (setting) => {
		const room = GameRooms.get(ws.data.roomId);
		if (!room) {
			emitErr(ws, "You are not in a valid room.");
			return;
		}
		room.oneSetting = setting;
		ws.to(ws.data.roomId).emit("updateSettings", setting);
	});

	// to start the game
	ws.on("startGame", async (settings) => {
		const room = GameRooms.get(ws.data.roomId);
		if (!room) {
			emitErr(ws, "You are not in a valid room.");
			return;
		}
		room.startGame(settings);
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
