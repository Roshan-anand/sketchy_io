import { Server } from "socket.io";
import type { GameRoom } from "../lib/types";
import { roomListeners } from "../listeners/room";

const io = new Server();

// global state of palyers and room
const gameRoom = new Map<string, GameRoom>();
const players = new Map<string, string>();
let onlinePlayers = 0;

io.on("connection", (socket) => {
	console.log("new connection :", socket.id);
	io.emit("online-players", onlinePlayers++);

	// register all the listeners
	roomListeners(socket);

	socket.on("disconnect", () => {
		console.log("disconnected :", socket.id);

		// remove player from room
		const socketId = socket.id;
		const roomId = players.get(socketId);
		if (roomId) {
			const room = gameRoom.get(roomId);
			if (room) {
				room.members.delete(socketId);
				socket.leave(roomId);
				// if room is empty, delete it
				if (room.members.size === 0) gameRoom.delete(roomId);
			}
		}

		io.emit("online-players", --onlinePlayers - 1);
	});
});

export { io, gameRoom };
