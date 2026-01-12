import { Server } from "socket.io";
import type { GameRoom } from "../core/gameRoom";
import {
	ChatMode,
	GameEntryType,
	type TypedIo,
	type TypedScoket,
	type WsAuth,
} from "../lib/types";
import { gameListeners } from "../listeners/game";
import { createRoom, joinRoom } from "../listeners/room";
import { broadcastTotalMembers } from "../listeners/utils";

const io = new Server() as TypedIo;

/**
 *  global state of palyers and room
 */
const GameRoomsHub = new Map<string, GameRoom>();

io.on("connection", (socket: TypedScoket) => {
	const auth = socket.handshake.auth as WsAuth;
	if (auth.type === GameEntryType.CREATE) createRoom(socket, auth.name, auth.character);
	else joinRoom(socket, auth.name, auth.roomId, auth.character);

	// register all the listeners
	gameListeners(socket);

	socket.on("disconnect", () => {
		// remove player from room
		const socketId = socket.id;
		const { roomId } = socket.data;
		if (roomId) {
			const room = GameRoomsHub.get(roomId);
			if (!room) return;
			room.removePlayer(socketId);
			socket.leave(roomId);
			broadcastTotalMembers(roomId);
			io.to(roomId).emit("chatMsg", {
				name: "System",
				msg: `${socket.data.name} left the game`,
				mode: ChatMode.SYSTEM_INFO,
			});
			// if room is empty, delete it
			if (room.playerCount === 0) GameRoomsHub.delete(roomId);
		}
	});
});

export { io, GameRoomsHub };
