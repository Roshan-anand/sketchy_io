import { Server } from "socket.io";
import type { GameRoom, TypedIo, User } from "../lib/types";
import { gameListeners } from "../listeners/game";
import { roomListeners } from "../listeners/room";
import { broadcastTotalMembers } from "../listeners/utils";

const io = new Server() as TypedIo;

/**
 *  global state of palyers and room
 */
const GameRooms = new Map<string, GameRoom>();
/**
 * Global state of all the clients connected to the hub
 */
const HubUsers = new Map<string, User>();
let onlinePlayers = 0;

io.on("connection", (socket) => {
	io.emit("playersOnline", onlinePlayers++);

	// register all the listeners
	roomListeners(socket);
	gameListeners(socket);

	socket.on("disconnect", () => {
		// remove player from room
		const socketId = socket.id;
		const user = HubUsers.get(socketId);
		if (user) {
			const { roomId } = user;
			const room = GameRooms.get(roomId);
			if (room) {
				socket.leave(roomId);
				broadcastTotalMembers(roomId);
				room.members.delete(socketId);
				HubUsers.delete(socketId);
				// if room is empty, delete it
				if (room.members.size === 0) GameRooms.delete(roomId);
			}
		}

		io.emit("playersOnline", --onlinePlayers - 1);
	});
});

export { io, GameRooms, HubUsers };
