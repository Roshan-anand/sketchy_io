import { Server } from "socket.io";
import {
	GameEntryType,
	type GameRoom,
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
const GameRooms = new Map<string, GameRoom>();

io.on("connection", (socket: TypedScoket) => {
	console.log("new client connected : ", socket.handshake.auth);
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
			if (room) {
				socket.leave(roomId);
				broadcastTotalMembers(roomId);
				room.members.delete(socketId);
				// if room is empty, delete it
				if (room.members.size === 0) GameRooms.delete(roomId);
			}
		}
	});
});

export { io, GameRooms };
