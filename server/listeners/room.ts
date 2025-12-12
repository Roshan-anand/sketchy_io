import type { Socket } from "socket.io";
import { gameRoom } from "../config/socket";
import { type GameRoom, GameType, type Player } from "../lib/types";
import { generateId } from "../lib/utils";
import { emitErr } from "./utils";

type Create = {
	name: string;
};

type Join = {
	name: string;
	roomId: string;
};

/**
 * to create a new game room with initial player
 *
 * @param type - type of visibility of the game room
 * @param name - name of the initial player
 * @param wsId - socket id of the initial player
 * @returns id - id of the new room created
 */
const createNewRoom = (type: GameType, name: string, wsId: string): string => {
	const player: Player = {
		name,
		score: 0,
	};

	const room: GameRoom = {
		members: new Map([[wsId, player]]),
		word: "",
		round: 0,
		drawerId: "",
		type,
	};

	const roomId = generateId(6);
	gameRoom.set(roomId, room);

	return roomId;
};

export const roomListeners = (ws: Socket) => {
	// to quickly join any random room
	ws.on("quick-join", ({ name }: Create) => {
		let roomId: string | null = null;

		// logic to find a room that is playing
		for (const id in gameRoom) {
			const currentRoom = gameRoom.get(id);
			if (!currentRoom) continue;
			if (currentRoom.type === GameType.PUBLIC) {
				if (currentRoom.members.size < 6) {
					roomId = id;
					currentRoom.members.set(ws.id, { name, score: 0 });
					break;
				}
			}
		}

		// logic to create a new room if all public room is full
		if (!roomId) roomId = createNewRoom(GameType.PRIVATE, name, ws.id);

		ws.join(roomId);
		ws.emit("quick-room-joined", roomId);
	});

	// to join a private room
	ws.on("join-room", ({ name, roomId }: Join) => {
		if (!name || !roomId) {
			emitErr(ws, "invalid values");
			return;
		}

		const room = gameRoom.get(roomId);

		if (!room) {
			emitErr(ws, "invalid room ID");
			return;
		}

		room.members.set(ws.id, { name, score: 0 });
		ws.join(roomId);
		ws.emit("room-joined", roomId);
	});

	// to create a new private room
	ws.on("create-room", ({ name }: Create) => {
		const roomId = createNewRoom(GameType.PRIVATE, name, ws.id);
		ws.join(roomId);
		ws.emit("room-created", roomId);
	});
};
