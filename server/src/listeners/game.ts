import { GameRooms, io } from "../config/socket";
import { ChatMode, type TypedScoket } from "../lib/types";
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
		const mode = room.vallidateWord(msg, ws.id);

		if (mode === ChatMode.SYSTEM_SUCCESS) {
			ws.emit("guessed", msg); // notify the guesser that they have guessed correctly
			msg = `${name} guessed the word`;
		}

		io.in(roomId).emit("chatMsg", {
			name,
			msg,
			mode,
		});
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
