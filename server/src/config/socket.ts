import { Server } from "socket.io";
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
import type { GameRoom } from "./gameRoom";

const io = new Server() as TypedIo;

/**
 *  global state of palyers and room
 */
const GameRooms = new Map<string, GameRoom>();

io.on("connection", (socket: TypedScoket) => {
	const auth = socket.handshake.auth as WsAuth;
	if (auth.type === GameEntryType.CREATE) createRoom(socket, auth.name);
	else joinRoom(socket, auth.name, auth.roomId);

	// register all the listeners
	gameListeners(socket);

	socket.on("disconnect", () => {
		// remove player from room
		const socketId = socket.id;
		const { roomId } = socket.data;
		if (roomId) {
			const room = GameRooms.get(roomId);
			if (!room) return;
			room.removePlayer(socketId);
			socket.leave(roomId);
			broadcastTotalMembers(roomId);
			io.to(roomId).emit("chatMsg", {
				name: "system",
				msg: `${socket.data.name} left the game`,
				mode: ChatMode.SYSTEM,
			});
			// if room is empty, delete it
			if (room.playerCount === 0) GameRooms.delete(roomId);
		}
	});
});

export { io, GameRooms };
