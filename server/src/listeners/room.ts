import type { Socket } from "socket.io";
import { GameRooms, HubUsers } from "../config/socket";
import { type GameRoom, GameStatus, GameType, type Player } from "../lib/types";
import { generateId, MemberMapToArray } from "../lib/utils";
import { broadcastTotalMembers, emitErr } from "./utils";

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
		type,
		members: new Map([[wsId, player]]),
		status: GameStatus.WAITING,
		settings: {
			totalMembers: 8,
			maxRounds: 3,
			drawtime: 80,
			hints: 2,
		},
		word: "",
		round: 0,
		drawerId: "",
	};
	const roomId = generateId(6);
	GameRooms.set(roomId, room);
	console.log("created new room ", roomId);

	return roomId;
};

export const roomListeners = (ws: Socket) => {
	// to quickly join any random room
	ws.on("quick-join", ({ name }: Create) => {
		let roomId: string | null = null;

		// logic to find a room that is playing
		for (const id in GameRooms) {
			const currentRoom = GameRooms.get(id);
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
		const room = GameRooms.get(roomId);

		// if no room join a random room
		if (!room) {
			emitErr(ws, "join a random room");
			return;
		}

		// else join the user to the room
		room.members.set(ws.id, { name, score: 0 });
		HubUsers.set(ws.id, { name, roomId }); // set roomId for the client

		const players = MemberMapToArray(room.members);

		broadcastTotalMembers(roomId);
		ws.emit("room-joined", { roomId, players });
		ws.join(roomId);
	});

	// to create a new private room
	ws.on("create-room", ({ name }: Create) => {
		console.log("room creating .. ");
		const roomId = createNewRoom(GameType.PRIVATE, name, ws.id);
		HubUsers.set(ws.id, { name, roomId }); // set roomId for the client

		const players = [
			{
				name,
				score: 0,
				id: ws.id,
			},
		];

		console.log("room created ");
		ws.emit("room-created", { roomId, players });
		ws.join(roomId);
	});
};
