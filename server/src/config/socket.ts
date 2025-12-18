import { Server } from "socket.io";
import type { GameRoom, TypedIo, TypedScoket } from "../lib/types";
import { gameListeners } from "../listeners/game";
import { roomListeners } from "../listeners/room";
import { broadcastTotalMembers } from "../listeners/utils";

const io = new Server() as TypedIo;

/**
 *  global state of palyers and room
 */
const GameRooms = new Map<string, GameRoom>();
let onlinePlayers = 0;

io.on("connection", (socket: TypedScoket) => {
	io.emit("playersOnline", onlinePlayers++);

	// register all the listeners
	roomListeners(socket);
	gameListeners(socket);

	socket.on("disconnect", () => {
		// remove player from room
		const socketId = socket.id;
		const { roomId } = socket.data;
		if (roomId) {
			const room = GameRooms.get(roomId);
			if (room) {
				socket.leave(roomId);
				broadcastTotalMembers(roomId);
				room.members.delete(socketId);
				// if room is empty, delete it
				if (room.members.size === 0) GameRooms.delete(roomId);
			}
		}

		io.emit("playersOnline", --onlinePlayers - 1);
	});
});

export { io, GameRooms };
